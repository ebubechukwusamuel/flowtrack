import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { addContact } from "@/lib/email/contacts"

export async function POST(req: Request) {
  try {
    const { name, email, password, token, smtpHost, smtpPort, smtpUser, smtpPass } = await req.json()

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

    if (token) {
      const invite = await prisma.invite.findUnique({ where: { token } })
      if (!invite) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })
      if (invite.status !== "pending") return NextResponse.json({ error: "This invite has already been used" }, { status: 400 })
      if (invite.expiresAt < new Date()) {
        await prisma.invite.update({ where: { id: invite.id }, data: { status: "expired" } })
        return NextResponse.json({ error: "This invite has expired" }, { status: 400 })
      }
      if (invite.email !== email) {
        return NextResponse.json({ error: "This invite was sent to a different email" }, { status: 400 })
      }
      await prisma.organizationMember.create({
        data: { organizationId: invite.organizationId, userId: user.id, role: invite.role },
      })
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "accepted", acceptedAt: new Date() },
      })
      addContact(email, name, invite.organizationId)
    } else {
      const org = await getOrCreateOrg(user.id, name, email)

      if (smtpHost) {
        await prisma.organization.update({
          where: { id: org.organization.id },
          data: { smtpHost, smtpPort: smtpPort || 587, smtpUser: smtpUser || "", smtpPass: smtpPass || "" },
        })
      }

      addContact(email, name, org.organization.id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
