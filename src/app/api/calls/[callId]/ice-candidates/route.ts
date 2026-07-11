import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { callId } = await params
    const url = new URL(req.url)
    const since = url.searchParams.get("since")

    const where: any = { callId }
    if (since) where.createdAt = { gt: new Date(since) }

    const candidates = await prisma.callICECandidate.findMany({
      where,
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ candidates })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { callId } = await params
    const { type, candidate } = await req.json()
    if (!type || !candidate) return NextResponse.json({ error: "type and candidate required" }, { status: 400 })

    const ice = await prisma.callICECandidate.create({
      data: { callId, type, candidate },
    })

    return NextResponse.json({ candidate: ice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
