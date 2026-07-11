import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { createNotification } from "@/lib/notifications"

async function checkProjectAccess(projectId: string, orgId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: orgId },
  })
  return project
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const { title, description, status, priority, projectId, assigneeId, dueDate, order } = await req.json()
  if (!title?.trim() || !projectId) {
    return NextResponse.json({ error: "Title and project required" }, { status: 400 })
  }

  const project = await checkProjectAccess(projectId, membership.organization.id)
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const maxOrder = await prisma.task.aggregate({
    where: { projectId },
    _max: { order: true },
  })

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? "",
      status: status ?? "todo",
      priority: priority ?? "medium",
      projectId,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order: order ?? (maxOrder._max.order ?? 0) + 1,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })

  await prisma.activity.create({
    data: {
      action: "created_task",
      details: `Created task "${task.title}"`,
      userId: session.user.id,
      projectId,
      taskId: task.id,
    },
  })

  if (task.assigneeId && task.assigneeId !== session.user.id) {
    await createNotification({
      userId: task.assigneeId,
      type: "task_assigned",
      title: "Task Assigned",
      message: `You've been assigned "${task.title}"`,
      link: `/projects/${projectId}`,
    })
  }

  return NextResponse.json(task)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 })

  const task = await prisma.task.findFirst({
    where: { id, project: { organizationId: membership.organization.id } },
  })
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) updateData.status = data.status
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.order !== undefined) updateData.order = data.order
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId || null
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
  if (data.submissionLink !== undefined) updateData.submissionLink = data.submissionLink

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })

  if (data.status && data.status !== task.status) {
    await prisma.activity.create({
      data: {
        action: "moved_task",
        details: `Moved "${updated.title}" to ${data.status}`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: id,
      },
    })
  }

  if (data.assigneeId && data.assigneeId !== task.assigneeId && data.assigneeId !== session.user.id) {
    await createNotification({
      userId: data.assigneeId,
      type: "task_assigned",
      title: "Task Assigned",
      message: `You've been assigned "${updated.title}"`,
      link: `/projects/${task.projectId}`,
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 })

  const task = await prisma.task.findFirst({
    where: { id, project: { organizationId: membership.organization.id } },
  })
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
