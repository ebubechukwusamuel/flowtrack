import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const membership = await getOrCreateOrg(userId, session.user.name, session.user.email)
  const orgId = membership.organization.id
  const isAdmin = membership.role === "admin"

  const [projects, tasks, members, recentActivities, myActivities] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.task.findMany({
      where: { project: { organizationId: orgId } },
      include: { project: { select: { name: true, color: true } }, assignee: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    }),
    prisma.activity.findMany({
      where: { project: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      take: isAdmin ? 15 : 8,
      include: {
        user: { select: { name: true, email: true, image: true } },
        project: { select: { name: true } },
        task: { select: { title: true } },
      },
    }),
    isAdmin
      ? Promise.resolve([])
      : prisma.activity.findMany({
          where: { project: { organizationId: orgId }, userId },
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            user: { select: { name: true, email: true, image: true } },
            project: { select: { name: true } },
            task: { select: { title: true } },
          },
        }),
  ])

  const now = new Date()
  const myTasks = tasks.filter((t) => t.assigneeId === userId)
  const myTaskIds = new Set(myTasks.map((t) => t.id))
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done")
  const dueSoonTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false
    const due = new Date(t.dueDate)
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return due > now && due < weekFromNow
  })
  const myOverdueTasks = overdueTasks.filter((t) => myTaskIds.has(t.id))
  const myDueSoonTasks = dueSoonTasks.filter((t) => myTaskIds.has(t.id))

  // Member workload distribution for admin view
  const memberWorkload = members.map((m) => ({
    id: m.user.id,
    name: m.user.name || m.user.email || "Unknown",
    image: m.user.image,
    totalTasks: tasks.filter((t) => t.assigneeId === m.user.id).length,
    doneTasks: tasks.filter((t) => t.assigneeId === m.user.id && t.status === "done").length,
  }))

  const projectSummaries = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    color: p.color,
    ownerId: p.ownerId,
    updatedAt: p.updatedAt.toISOString(),
    _count: { tasks: p._count.tasks },
  }))

  const todoCount = tasks.filter((t) => t.status === "todo").length
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length
  const doneCount = tasks.filter((t) => t.status === "done").length
  const myTodoCount = myTasks.filter((t) => t.status === "todo").length
  const myInProgressCount = myTasks.filter((t) => t.status === "in_progress").length
  const myDoneCount = myTasks.filter((t) => t.status === "done").length
  const lowPriority = tasks.filter((t) => t.priority === "low").length
  const mediumPriority = tasks.filter((t) => t.priority === "medium").length
  const highPriority = tasks.filter((t) => t.priority === "high").length
  const urgentPriority = tasks.filter((t) => t.priority === "urgent").length

  const tasksByProjectMap = new Map<string, { name: string; color: string; count: number }>()
  for (const task of tasks) {
    const key = task.projectId
    const existing = tasksByProjectMap.get(key)
    if (existing) existing.count++
    else tasksByProjectMap.set(key, { name: task.project.name, color: task.project.color, count: 1 })
  }
  const tasksByProject = Array.from(tasksByProjectMap.values()).sort((a, b) => b.count - a.count)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, start, end }
  })
  const tasksByDay = last7Days.map(({ date, start, end }) => ({
    date,
    created: tasks.filter((t) => {
      const c = new Date(t.createdAt)
      return c >= start && c < end
    }).length,
  }))

  // Personal task by project
  const myTasksByProjectMap = new Map<string, { name: string; color: string; count: number }>()
  for (const task of myTasks) {
    const key = task.projectId
    const existing = myTasksByProjectMap.get(key)
    if (existing) existing.count++
    else myTasksByProjectMap.set(key, { name: task.project.name, color: task.project.color, count: 1 })
  }
  const myTasksByProject = Array.from(myTasksByProjectMap.values()).sort((a, b) => b.count - a.count)

  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

  // My projects (projects I have tasks in)
  const myProjectIds = new Set(myTasks.map((t) => t.projectId))
  const myProjects = projectSummaries.filter((p) => myProjectIds.has(p.id))

  // All tasks assigned to current user (for member dashboard)
  const myAllTasks = myTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    submissionLink: t.submissionLink,
    projectName: t.project.name,
    projectColor: t.project.color,
    dueDate: t.dueDate?.toISOString() ?? null,
    priority: t.priority,
  }))

  // Submitted tasks for admin view
  const submittedTasks = tasks
    .filter((t) => t.status === "done" && t.submissionLink)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map((t) => ({
      id: t.id,
      title: t.title,
      submissionLink: t.submissionLink!,
      submittedAt: t.updatedAt.toISOString(),
      projectName: t.project.name,
      projectColor: t.project.color,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name || "Unknown" } : null,
    }))

  // Member's upcoming deadline tasks
  const myUpcomingTasks = myTasks
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate!.toISOString(),
      priority: t.priority,
      projectName: t.project.name,
      projectColor: t.project.color,
    }))

  return (
    <DashboardClient
      projects={projectSummaries}
      myProjects={myProjects}
      isAdmin={isAdmin}
      userId={userId}
      orgName={membership.organization.name}
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        image: members.find((m) => m.user.id === userId)?.user.image ?? null,
      }}
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        projectName: t.project.name,
        projectColor: t.project.color,
        assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name || "Unknown" } : null,
      }))}
      activities={recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
        user: a.user,
        project: a.project,
        task: a.task,
      }))}
      myActivities={myActivities.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
        user: a.user,
        project: a.project,
        task: a.task,
      }))}
      memberWorkload={memberWorkload}
      myUpcomingTasks={myUpcomingTasks}
      stats={{
        totalProjects: projectSummaries.length,
        myProjectCount: myProjects.length,
        totalTasks,
        todoCount,
        inProgressCount,
        doneCount,
        completionRate,
        lowPriority,
        mediumPriority,
        highPriority,
        urgentPriority,
        tasksByProject,
        tasksByDay,
        myTasksByProject,
        myTodoCount,
        myInProgressCount,
        myDoneCount,
        myOverdueCount: myOverdueTasks.length,
        myDueSoonCount: myDueSoonTasks.length,
        overdueCount: overdueTasks.length,
        dueSoonCount: dueSoonTasks.length,
        memberCount: members.length,
      }}
    />
  )
}
