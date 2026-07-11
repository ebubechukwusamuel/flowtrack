import { PrismaClient } from "@/generated/prisma"

function getPrisma() {
  const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient }
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = new PrismaClient()
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
