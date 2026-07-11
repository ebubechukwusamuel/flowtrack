import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const orgId = membership.organization.id
  const [sent, failed, pending, contacts] = await Promise.all([
    prisma.emailLog.count({ where: { organizationId: orgId, status: "sent" } }),
    prisma.emailLog.count({ where: { organizationId: orgId, status: "failed" } }),
    prisma.emailLog.count({ where: { organizationId: orgId, status: "pending" } }),
    prisma.emailContact.count({ where: { organizationId: orgId } }),
  ])

  return NextResponse.json({ sent, failed, pending, contacts })
}
