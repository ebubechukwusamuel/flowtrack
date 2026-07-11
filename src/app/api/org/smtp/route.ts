import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can change SMTP settings" }, { status: 403 })

  const { host, port, user, pass } = await req.json()

  await prisma.organization.update({
    where: { id: membership.organization.id },
    data: { smtpHost: host || null, smtpPort: port ? parseInt(port) : null, smtpUser: user || null, smtpPass: pass || null },
  })

  return NextResponse.json({ success: true })
}

export async function GET(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json({
    host: membership.organization.smtpHost || "",
    port: membership.organization.smtpPort || 587,
    user: membership.organization.smtpUser || "",
    pass: membership.organization.smtpPass ? "********" : "",
  })
}
