import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function toSafeTableName(input: string | undefined, fallback: string): string {
  if (!input) return fallback
  return /^[a-zA-Z0-9_]+$/.test(input) ? input : fallback
}

export function getTrackingMariaPool(): mysql.Pool | null {
  const host = process.env.MARIADB_HOST
  const user = process.env.MARIADB_USER
  const password = process.env.MARIADB_PASSWORD
  const database = process.env.MARIADB_DATABASE
  const port = Number.parseInt(process.env.MARIADB_PORT || "3306", 10)

  if (!host || !user || !password || !database) return null

  if (!pool) {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port: Number.isNaN(port) ? 3306 : port,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    })
  }

  return pool
}

export function trackingDashboardTokenOk(token: string | null): boolean {
  const expected = process.env.TRACKING_DASHBOARD_TOKEN
  if (!expected) return true
  return Boolean(token && token === expected)
}
