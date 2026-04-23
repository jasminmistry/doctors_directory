import { defineConfig } from "prisma/config"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config()

export default defineConfig({
  schema: "prisma/schema.prisma",
})
