import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    })

    await getOrCreateOrg(user.id, name, email)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
