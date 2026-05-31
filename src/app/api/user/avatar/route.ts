import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import fs from "node:fs"
import path from "node:path"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { image } = await req.json()
  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "Image data required" }, { status: 400 })
  }

  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 })
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  const avatarsDir = path.resolve(process.cwd(), "public", "avatars")
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true })
  }

  const filename = `${session.user.id}.${ext}`
  fs.writeFileSync(path.join(avatarsDir, filename), buffer)

  const url = `/avatars/${filename}`
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: url },
  })

  return NextResponse.json({ url })
}
