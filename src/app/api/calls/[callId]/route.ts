import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { callId } = await params
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        chat: { select: { id: true, name: true, isGroup: true } },
      },
    })
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 })

    return NextResponse.json({ call })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { callId } = await params
    const body = await req.json()

    const updateData: any = {}
    if (body.status) {
      updateData.status = body.status
      if (body.status === "ongoing") updateData.startedAt = new Date()
      if (body.status === "ended" || body.status === "missed") updateData.endedAt = new Date()
    }
    if (body.offer !== undefined) updateData.offer = body.offer
    if (body.answer !== undefined) updateData.answer = body.answer

    const call = await prisma.call.update({
      where: { id: callId },
      data: updateData,
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

export async function DELETE(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { callId } = await params
    await prisma.call.update({
      where: { id: callId },
      data: { status: "missed", endedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
