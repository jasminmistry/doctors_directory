import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.DATABASE_URL) {
  const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL)
  const adapter = new PrismaMariaDb({
    host: hostname,
    port: parseInt(port) || 3306,
    user: username,
    password: decodeURIComponent(password),
    database: pathname.slice(1),
    allowPublicKeyRetrieval: true,
  })

  prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} else {
  // Fallback for environments without DATABASE_URL (should not happen in production)
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
}

export { prisma }
