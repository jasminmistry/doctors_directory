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
  // No DATABASE_URL — return a proxy that throws on first use rather than at
  // import time so that build-time static routes that import this module but
  // never call the DB can still compile successfully.
  prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
      throw new Error(
        `DATABASE_URL is not configured — cannot call prisma.${String(prop)}()`
      )
    },
  })
}

export { prisma }
