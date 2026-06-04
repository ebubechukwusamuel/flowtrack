import { prisma } from "@/lib/db"

export async function getEmailLogs(organizationId: string, limit = 50) {
  return prisma.emailLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getEmailStats(organizationId: string) {
  const [sent, failed, pending, total] = await Promise.all([
    prisma.emailLog.count({ where: { organizationId, status: "sent" } }),
    prisma.emailLog.count({ where: { organizationId, status: "failed" } }),
    prisma.emailLog.count({ where: { organizationId, status: "pending" } }),
    prisma.emailLog.count({ where: { organizationId } }),
  ])
  return { sent, failed, pending, total }
}
