import type { RowDataPacket } from "mysql2"
import { getTrackingMariaPool, toSafeTableName } from "@/lib/tracking/mariadb-pool"

const PAGE_TYPES = [
  "practitioner_page",
  "clinic_page",
  "collection_page",
  "other",
] as const

const DEVICE_TYPES = ["mobile", "desktop"] as const

export type TrackingTab = "events" | "leads"

export interface TrackingListParams {
  tab: TrackingTab
  q: string
  pageType: string
  country: string
  deviceType: string
  from: string
  to: string
  page: number
  pageSize: number
}

function normalizePageType(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  return PAGE_TYPES.includes(v as (typeof PAGE_TYPES)[number]) ? v : null
}

function normalizeDeviceType(value: string): string | null {
  const v = value.trim().toLowerCase()
  if (!v) return null
  return DEVICE_TYPES.includes(v as (typeof DEVICE_TYPES)[number]) ? v : null
}

function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

export async function listTrackingRows(
  params: TrackingListParams
): Promise<{ rows: RowDataPacket[]; total: number }> {
  const pool = getTrackingMariaPool()
  if (!pool) {
    return { rows: [], total: 0 }
  }

  const eventsTable = toSafeTableName(process.env.MARIADB_EVENTS_TABLE, "directory_events")
  const leadsTable = toSafeTableName(process.env.MARIADB_LEADS_TABLE, "directory_leads")
  const table = params.tab === "leads" ? leadsTable : eventsTable

  const where: string[] = ["1=1"]
  const values: unknown[] = []

  const pageType = normalizePageType(params.pageType)
  if (pageType) {
    where.push("page_type = ?")
    values.push(pageType)
  }

  const deviceType = normalizeDeviceType(params.deviceType)
  if (deviceType) {
    where.push("device_type = ?")
    values.push(deviceType)
  }

  const country = params.country.trim()
  if (country) {
    where.push("country = ?")
    values.push(country.toUpperCase())
  }

  const from = params.from.trim()
  if (from) {
    where.push("timestamp >= ?")
    values.push(from.replace("T", " ").slice(0, 23))
  }

  const to = params.to.trim()
  if (to) {
    where.push("timestamp <= ?")
    values.push(to.replace("T", " ").slice(0, 23))
  }

  const q = params.q.trim()
  if (q) {
    const like = `%${escapeLike(q)}%`
    if (params.tab === "leads") {
      where.push(
        "(page_url LIKE ? ESCAPE '\\\\' OR referrer LIKE ? ESCAPE '\\\\' OR name LIKE ? ESCAPE '\\\\' OR contact LIKE ? ESCAPE '\\\\' OR treatment LIKE ? ESCAPE '\\\\' OR location LIKE ? ESCAPE '\\\\' OR budget LIKE ? ESCAPE '\\\\')"
      )
      values.push(like, like, like, like, like, like, like)
    } else {
      where.push(
        "(page_url LIKE ? ESCAPE '\\\\' OR referrer LIKE ? ESCAPE '\\\\' OR cta_label LIKE ? ESCAPE '\\\\' OR cta_target_url LIKE ? ESCAPE '\\\\')"
      )
      values.push(like, like, like, like)
    }
  }

  const whereSql = where.join(" AND ")
  const offset = Math.max(0, (params.page - 1) * params.pageSize)
  const limit = Math.min(100, Math.max(1, params.pageSize))

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM \`${table}\` WHERE ${whereSql}`,
    values
  )
  const total = Number(countRows[0]?.total ?? 0)

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM \`${table}\` WHERE ${whereSql} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  )

  return { rows, total }
}
