import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { TeamClient } from "@/components/team-client"

export default async function TeamPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  const isAdmin = membership.role === "admin"

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: membership.organization.id },
    include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } },
    orderBy: { createdAt: "asc" },
  })

  return (
    <TeamClient
      orgName={membership.organization.name}
      orgRole={membership.role}
      members={members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  )
}
