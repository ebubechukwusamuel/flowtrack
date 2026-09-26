import { PrismaClient } from "@/generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"

function getPrisma() {
  const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient }
  if (!globalForPrisma._prisma) {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
    })
    globalForPrisma._prisma = new PrismaClient({ adapter })
  }
  return globalForPrisma._prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma()
    const value = (client as any)[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})
