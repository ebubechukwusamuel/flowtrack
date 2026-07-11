import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
          include: {
            sender: { select: { id: true, name: true, image: true } },
            attachments: true,
          },
        },
      },
    })
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 })

    return NextResponse.json({ chat })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { chatId } = await params
    const { name, addParticipantIds, removeParticipantIds } = await req.json()

    const updateData: any = {}
    if (name) updateData.name = name
    if (addParticipantIds?.length) {
      await prisma.chatParticipant.createMany({
        data: addParticipantIds.map((uid: string) => ({ chatId, userId: uid })),
        skipDuplicates: true,
      })
    }
    if (removeParticipantIds?.length) {
      await prisma.chatParticipant.deleteMany({
        where: { chatId, userId: { in: removeParticipantIds } },
      })
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.chat.update({ where: { id: chatId }, data: updateData })
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
      },
    })

    return NextResponse.json({ chat })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
