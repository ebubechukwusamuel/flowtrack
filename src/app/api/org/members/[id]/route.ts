import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 })

  const { id } = await params

  const target = await prisma.organizationMember.findFirst({
    where: { id, organizationId: membership.organization.id },
  })
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 })
  if (target.role === "admin") return NextResponse.json({ error: "Cannot remove admin" }, { status: 400 })

  await prisma.organizationMember.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
