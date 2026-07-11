import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 })

  const { name, description, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? "",
      color: color ?? "#6366f1",
      ownerId: session.user.id,
      organizationId: membership.organization.id,
    },
  })

  return NextResponse.json(project)
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const projects = await prisma.project.findMany({
    where: { organizationId: membership.organization.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(projects)
}
