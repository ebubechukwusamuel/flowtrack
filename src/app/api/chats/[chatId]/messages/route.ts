import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params

    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: session.user.id } },
    })
    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params

    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: session.user.id } },
    })
    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        chatId,
        senderId: session.user.id,
      },
      include: { sender: { select: { id: true, name: true, image: true } } },
    })

    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } })

    const otherParticipant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId: { not: session.user.id } },
    })
    if (otherParticipant) {
      const sender = session.user.name || "Someone"
      const preview = content.trim().length > 60 ? content.trim().slice(0, 60) + "..." : content.trim()
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
