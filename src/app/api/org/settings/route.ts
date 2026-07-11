import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can update settings" }, { status: 403 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const updated = await prisma.organization.update({
    where: { id: membership.organization.id },
    data: { name: name.trim() },
  })

  return NextResponse.json(updated)
}
