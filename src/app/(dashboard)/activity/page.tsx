import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { ActivityClient } from "@/components/activity-client"

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const [notifications, activities] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.activity.findMany({
      where: { project: { organizationId: membership.organization.id } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, image: true } },
        task: { select: { title: true } },
        project: { select: { name: true } },
      },
    }),
  ])

  return (
    <ActivityClient
      notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString(), readAt: n.readAt?.toISOString() ?? null }))}
      activities={activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
    />
  )
}
