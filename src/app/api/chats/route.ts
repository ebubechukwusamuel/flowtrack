import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

    const chats = await prisma.chat.findMany({
      where: { organizationId: membership.organization.id },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
            attachments: { select: { id: true, type: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ chats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

    const { participantId } = await req.json()
    if (!participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 })

    const existing = await prisma.chat.findFirst({
      where: {
        organizationId: membership.organization.id,
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
      },
    })

    if (existing) return NextResponse.json({ chat: existing })

    const chat = await prisma.chat.create({
      data: {
        organizationId: membership.organization.id,
        participants: {
          createMany: {
            data: [{ userId: session.user.id }, { userId: participantId }],
          },
        },
      },
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
