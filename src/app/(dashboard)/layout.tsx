import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const projects = await prisma.project.findMany({
    where: { organizationId: membership.organization.id },
    select: { id: true, name: true, color: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="flex h-screen">
      <Sidebar
        user={session.user}
        orgName={membership.organization.name}
        orgRole={membership.role}
        projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
      />
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  )
}
