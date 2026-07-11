import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user!.id
    const { receiverIds, chatId, isVideo } = await req.json()
    if (!receiverIds?.length) return NextResponse.json({ error: "receiverIds required" }, { status: 400 })

    const calls = await Promise.all(
      receiverIds.map((rid: string) =>
        prisma.call.create({
          data: {
            callerId: userId,
            receiverId: rid,
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
      )
    )

    return NextResponse.json({ calls })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
