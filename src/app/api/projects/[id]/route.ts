import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

async function getMemberOrg(userId: string) {
  const m = await getOrCreateOrg(userId)
  return { orgId: m.organization.id, userId, role: m.role }
}

async function checkAccess(projectId: string, orgId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: orgId },
  })
  if (!project) return null
  return project
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { orgId } = await getMemberOrg(session.user.id)
  const { id } = await params

  const project = await prisma.project.findFirst({
    where: { id, organizationId: orgId },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { orgId } = await getMemberOrg(session.user.id)
  const { id } = await params
  const body = await req.json()

  const project = await checkAccess(id, orgId)
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.project.update({
    where: { id },
    data: { name: body.name, description: body.description, color: body.color },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { orgId } = await getMemberOrg(session.user.id)
  const { id } = await params

  const project = await checkAccess(id, orgId)
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
