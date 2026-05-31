import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

  const invite = await prisma.invite.findUnique({ where: { token } })
  if (!invite) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })

  if (invite.status !== "pending") return NextResponse.json({ error: "This invite has already been used" }, { status: 400 })

  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({ where: { id: invite.id }, data: { status: "expired" } })
    return NextResponse.json({ error: "This invite has expired" }, { status: 400 })
  }

  const userEmail = session.user.email
  if (invite.email !== userEmail) {
    return NextResponse.json({ error: "This invite was sent to a different email address" }, { status: 403 })
  }

  const existingMember = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: invite.organizationId, userId: session.user.id } },
  })
  if (existingMember) {
    await prisma.invite.update({ where: { id: invite.id }, data: { status: "accepted", acceptedAt: new Date() } })
    return NextResponse.json({ success: true, alreadyMember: true })
  }

  await prisma.organizationMember.create({
    data: {
      organizationId: invite.organizationId,
      userId: session.user.id,
      role: invite.role,
    },
  })

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
