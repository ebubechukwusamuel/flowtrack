import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  return NextResponse.json({
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    role: membership.role,
  })
}
