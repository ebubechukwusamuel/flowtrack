import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ chatId: string; messageId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId, messageId } = await params

    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 })
    if (message.senderId !== session.user.id) return NextResponse.json({ error: "Not your message" }, { status: 403 })
    if (message.deletedAt) return NextResponse.json({ error: "Message deleted" }, { status: 400 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim(), editedAt: new Date() },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: { select: { id: true, type: true, name: true, data: true, size: true } },
      },
    })

    return NextResponse.json({ message: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ chatId: string; messageId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId, messageId } = await params

    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 })
    if (message.senderId !== session.user.id) return NextResponse.json({ error: "Not your message" }, { status: 403 })
    if (message.deletedAt) return NextResponse.json({ error: "Already deleted" }, { status: 400 })

    await prisma.message.update({
      where: { id: messageId },
      data: { content: null, deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
