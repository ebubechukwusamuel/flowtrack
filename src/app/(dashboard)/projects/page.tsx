import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { getOrCreateOrg } from "@/lib/org"
import Link from "next/link"
import { Plus, FolderKanban } from "lucide-react"

export default async function ProjectsPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  const isAdmin = membership.role === "admin"

  const projects = await prisma.project.findMany({
    where: { organizationId: membership.organization.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{projects.length} total</p>
        </div>
        {isAdmin && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <FolderKanban className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No projects yet</p>
          {isAdmin && (
            <Link
              href="/projects/new"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
            >
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <h2 className="font-semibold truncate">{project.name}</h2>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400">
                <span>{project._count.tasks} tasks</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
