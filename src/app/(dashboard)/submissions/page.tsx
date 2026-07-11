import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { SubmissionsClient } from "@/components/submissions-client"

export default async function SubmissionsPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") redirect("/dashboard")

  const tasks = await prisma.task.findMany({
    where: {
      project: { organizationId: membership.organization.id },
      status: "done",
      submissionLink: { not: null },
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <SubmissionsClient
      submissions={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        submissionLink: t.submissionLink!,
        submittedAt: t.updatedAt.toISOString(),
        projectId: t.project.id,
        projectName: t.project.name,
        projectColor: t.project.color,
        assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name || "Unknown", email: t.assignee.email || "" } : null,
      }))}
    />
  )
}
