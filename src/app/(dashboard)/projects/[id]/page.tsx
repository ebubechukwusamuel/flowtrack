import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { getOrCreateOrg } from "@/lib/org"
import { ProjectBoard } from "@/components/project-board"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const { id } = await params
  const project = await prisma.project.findFirst({
    where: { id, organizationId: membership.organization.id },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { order: "asc" },
      },
    },
  })

  const isAdmin = membership.role === "admin"

  if (!project) notFound()

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: membership.organization.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  const users = members.map((m) => m.user)

  const serialized = {
    ...project,
    tasks: project.tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  }

  return <ProjectBoard project={serialized} users={users} currentUserId={session.user.id} isAdmin={isAdmin} />
}
