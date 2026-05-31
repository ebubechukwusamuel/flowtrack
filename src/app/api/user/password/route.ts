import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { compare, hash } from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password required" }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "No password set on this account" }, { status: 400 })
  }

  const isValid = await compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  const passwordHash = await hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  })

  return NextResponse.json({ success: true })
}
