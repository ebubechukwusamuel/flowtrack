import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { image } = await req.json()
  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "Image data required" }, { status: 400 })
  }

  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image },
  })

  return NextResponse.json({ url: image })
}
