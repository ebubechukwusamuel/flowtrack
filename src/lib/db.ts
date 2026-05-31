import { PrismaClient } from "@/generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaNeon(new Pool({ connectionString: process.env.DATABASE_URL })),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
