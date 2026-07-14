import { defineConfig } from 'prisma/config'
import 'dotenv/config'
console.log('DATABASE_URL =', process.env.DATABASE_URL)

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
