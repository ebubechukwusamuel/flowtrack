import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { MyTasksClient } from "@/components/my-tasks-client"

export default async function MyTasksPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const membership = await getOrCreateOrg(userId, session.user.name, session.user.email)

  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId, project: { organizationId: membership.organization.id } },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  })

  return (
    <MyTasksClient
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
        submissionLink: t.submissionLink,
        projectId: t.project.id,
        projectName: t.project.name,
        projectColor: t.project.color,
        assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name || "Unknown" } : null,
      }))}
    />
  )
}
