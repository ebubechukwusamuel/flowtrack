import { prisma } from "./db"

export async function getOrCreateOrg(userId: string, userName?: string | null, userEmail?: string | null) {
  const existing = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  })
  if (existing) return existing

  const name = userName || userEmail?.split("@")[0] || "My Team"
  const slug = (userEmail?.split("@")[0] || `team-${userId.slice(0, 8)}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")

  const org = await prisma.organization.create({ data: { name, slug } })

  const membership = await prisma.organizationMember.create({
    data: { organizationId: org.id, userId, role: "admin" },
    include: { organization: true },
  })

  return membership
}

export async function getUserOrg(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  })
}
