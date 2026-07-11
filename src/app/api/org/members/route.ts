import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Fetch members from ALL orgs the user belongs to
  const userOrgs = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    select: { organizationId: true },
  })
  const orgIds = userOrgs.map((m) => m.organizationId)

  const orgMembers = await prisma.organizationMember.findMany({
    where: { organizationId: { in: orgIds } },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  })

  const members = orgMembers.map((m) => m.user)

  return NextResponse.json({ members })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can invite" }, { status: 403 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "No user found with that email" }, { status: 404 })

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: membership.organization.id, userId: user.id } },
  })
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 400 })

  const member = await prisma.organizationMember.create({
    data: { organizationId: membership.organization.id, userId: user.id, role: "member" },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(member)
}
