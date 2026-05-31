import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { sendEmail, buildInviteEmailHtml } from "@/lib/mail"
import crypto from "node:crypto"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Only admins can invite" }, { status: 403 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: membership.organization.id,
      user: { email },
    },
  })
  if (existingMember) return NextResponse.json({ error: "Already a member" }, { status: 400 })

  const existingInvite = await prisma.invite.findFirst({
    where: { email, organizationId: membership.organization.id, status: "pending" },
  })
  if (existingInvite) return NextResponse.json({ error: "An invite was already sent to this email" }, { status: 400 })

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invite.create({
    data: {
      email,
      token,
      organizationId: membership.organization.id,
      invitedById: session.user.id,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4444"
  const acceptUrl = `${baseUrl}/accept-invite?token=${token}`

  const inviterName = session.user.name || session.user.email || "Someone"
  const html = buildInviteEmailHtml({
    inviterName,
    orgName: membership.organization.name,
    acceptUrl,
  })

  const org = await prisma.organization.findUnique({ where: { id: membership.organization.id } })
  const smtpConfig = org?.smtpHost ? { host: org.smtpHost, port: org.smtpPort || 587, user: org.smtpUser || "", pass: org.smtpPass || "" } : null

  try {
    await sendEmail({ to: email, subject: `You're invited to ${membership.organization.name} on FlowTrack`, html, smtp: smtpConfig })
  } catch (err) {
    console.error("[INVITE] Email send failed:", err)
    return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 })
  }

  return NextResponse.json({ success: true, token: invite.token })
}
