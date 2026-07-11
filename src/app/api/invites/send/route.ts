import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { sendEmail, buildInviteEmailHtml } from "@/lib/mail"
import { addContact } from "@/lib/email/contacts"
import crypto from "node:crypto"

export async function POST(req: Request) {
  try {
    const session = await getSession()
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

    await prisma.invite.deleteMany({
      where: { email, organizationId: membership.organization.id, status: "pending" },
    })

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

    addContact(email, null, membership.organization.id)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4444"
    const acceptUrl = `${baseUrl}/accept-invite?token=${token}`

    const inviterName = session.user.name || session.user.email || "Someone"
    const html = buildInviteEmailHtml({
      inviterName,
      orgName: membership.organization.name,
      acceptUrl,
      token: invite.token,
    })

    const org = await prisma.organization.findUnique({ where: { id: membership.organization.id } })
    const smtpConfig = org?.smtpHost ? { host: org.smtpHost, port: org.smtpPort || 587, user: org.smtpUser || "", pass: org.smtpPass || "" } : null

    const result = await sendEmail({
      to: email,
      subject: `You're invited to ${membership.organization.name} on FlowTrack`,
      html,
      smtp: smtpConfig,
      organizationId: membership.organization.id,
      invitedById: session.user.id,
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        token: invite.token,
        method: result.method,
        error: result.error || "Email delivery not configured",
      }, { status: 400 })
    }

    return NextResponse.json({ success: true, token: invite.token, method: result.method, logId: result.logId })

  } catch (err: any) {
    console.error("[INVITE_ROUTE]", err)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
