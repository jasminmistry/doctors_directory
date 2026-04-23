import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function buildMariaUrlFromParts(): string | null {
  const host = process.env.MARIADB_HOST
  const port = process.env.MARIADB_PORT || "3306"
  const user = process.env.MARIADB_USER
  const password = process.env.MARIADB_PASSWORD
  const database = process.env.MARIADB_DATABASE

  if (!host || !user || !password || !database) return null

  const encodedUser = encodeURIComponent(user)
  const encodedPassword = encodeURIComponent(password)
  const encodedDatabase = encodeURIComponent(database)

  return `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${encodedDatabase}`
}

const resolvedDatabaseUrl =
  process.env.DATABASE_URL?.trim() || buildMariaUrlFromParts() || ""

export const hasTrackingDatabaseConfig = Boolean(resolvedDatabaseUrl)

function createPrismaClient() {
  if (!resolvedDatabaseUrl) return new PrismaClient()
  return new PrismaClient({
    datasources: {
      db: {
        url: resolvedDatabaseUrl,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
