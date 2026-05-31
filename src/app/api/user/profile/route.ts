import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, bio, jobTitle, timezone, notifyOnAssign } = await req.json()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(jobTitle !== undefined && { jobTitle }),
      ...(timezone !== undefined && { timezone }),
      ...(notifyOnAssign !== undefined && { notifyOnAssign }),
    },
    select: { id: true, name: true, email: true, image: true, bio: true, jobTitle: true, timezone: true, notifyOnAssign: true },
  })

  return NextResponse.json(updated)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true, jobTitle: true, timezone: true, notifyOnAssign: true, createdAt: true },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(user)
}
