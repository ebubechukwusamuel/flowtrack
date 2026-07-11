import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params

    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: session.user.id } },
    })
    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: { select: { id: true, type: true, name: true, data: true, size: true } },
      },
    })

    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params

    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: session.user.id } },
    })
    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

    const { content, attachments } = await req.json()
    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Content or attachment required" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || null,
        chatId,
        senderId: session.user.id,
        attachments: {
          create: (attachments || []).map((a: { type: string; name: string; data: string; size: number }) => ({
            type: a.type,
            name: a.name,
            data: a.data,
            size: a.size,
          })),
        },
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: { select: { id: true, type: true, name: true, data: true, size: true } },
      },
    })

    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } })

    const otherParticipant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId: { not: session.user.id } },
    })
    if (otherParticipant) {
      const sender = session.user.name || "Someone"
      const preview = content?.trim()
        ? (content.trim().length > 60 ? content.trim().slice(0, 60) + "..." : content.trim())
        : `Sent a ${attachments?.[0]?.type || "file"}`
      await createNotification({
        userId: otherParticipant.userId,
        type: "new_message",
        title: `Message from ${sender}`,
        message: preview,
        link: `/chat`,
      })
    }

    return NextResponse.json({ message })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
