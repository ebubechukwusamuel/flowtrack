import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const logs = await prisma.emailLog.findMany({
    where: { organizationId: membership.organization.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ logs })
}
