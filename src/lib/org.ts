import { prisma } from "./db"

export async function getOrCreateOrg(userId: string, userName?: string | null, userEmail?: string | null) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: { include: { members: true } } },
    orderBy: { createdAt: "asc" },
  })

  // Prefer the org with the most members (shared team org over personal)
  const best = memberships.reduce((best, m) => {
    return (!best || m.organization.members.length > best.organization.members.length) ? m : best
  }, null as typeof memberships[0] | null)

  if (best) return best

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
