// Re-export the shared Prisma singleton from db.ts
export { prisma } from "@/lib/db"

const resolvedDatabaseUrl =
  process.env.DATABASE_URL?.trim() ||
  (() => {
    const host = process.env.MARIADB_HOST
    const port = process.env.MARIADB_PORT || "3306"
    const user = process.env.MARIADB_USER
    const password = process.env.MARIADB_PASSWORD
    const database = process.env.MARIADB_DATABASE
    if (!host || !user || !password || !database) return ""
    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`
  })() || ""

export const hasTrackingDatabaseConfig = Boolean(resolvedDatabaseUrl)
