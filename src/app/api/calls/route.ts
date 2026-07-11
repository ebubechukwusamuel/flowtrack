import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const active = await prisma.call.findMany({
      where: {
        OR: [{ callerId: session.user.id }, { receiverId: session.user.id }],
      },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        chat: { select: { id: true, name: true, isGroup: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ calls: active })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { receiverId, chatId, isVideo } = await req.json()
    if (!receiverId) return NextResponse.json({ error: "receiverId required" }, { status: 400 })

    const call = await prisma.call.create({
      data: {
        callerId: session.user.id,
        receiverId,
        chatId: chatId || null,
        isVideo: !!isVideo,
        status: "ringing",
      },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        chat: { select: { id: true, name: true, isGroup: true } },
      },
    })

    return NextResponse.json({ call })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
