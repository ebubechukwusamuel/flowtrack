"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Layout,
  ListTodo,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProject {
  id: string
  name: string
  color: string
}

export function Sidebar({
  user,
  orgName,
  orgRole,
  projects: initialProjects,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null }
  orgName: string
  orgRole: string
  projects: SidebarProject[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [projects, setProjects] = useState(initialProjects)

  const isAdmin = orgRole === "admin"
  const isMemberView = searchParams.get("view") === "member"

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href))

  function toggleView() {
    const current = new URL(window.location.href)
    if (isMemberView) {
      current.searchParams.delete("view")
    } else {
      current.searchParams.set("view", "member")
    }
    window.location.href = current.toString()
  }

  function navLink(href: string, icon: React.ElementType, label: string) {
    const Icon = icon
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive(href)
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && label}
      </Link>
    )
  }

  return (
    <aside
      className={`flex flex-col border-r border-zinc-200 bg-white transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900 ${collapsed ? "w-16" : "w-56"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Layout className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight">FlowTrack</span>
              <span className="text-xs text-zinc-400 truncate">{orgName}</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {collapsed && (
        <div className="flex justify-center py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Layout className="h-3.5 w-3.5" />
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto scrollbar-thin">
        {/* Main Navigation */}
        {navLink("/dashboard", LayoutDashboard, "Dashboard")}
        {navLink("/projects", FolderKanban, "All Projects")}

        {/* Project list under All Projects */}
        {!collapsed && (
          <div className="ml-2 mb-1 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-700">
            {projects.length === 0 ? (
              <p className="px-3 py-1 text-xs text-zinc-400">No projects yet</p>
            ) : projects.length <= 5 ? (
              projects.map((p) => (
                <Link
                  key={p.id}
                  href={isMemberView ? `/projects/${p.id}?view=member` : `/projects/${p.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    pathname === `/projects/${p.id}`
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                </Link>
              ))
            ) : (
              <>
                {projects.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={isMemberView ? `/projects/${p.id}?view=member` : `/projects/${p.id}`}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      pathname === `/projects/${p.id}`
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                ))}
                <Link
                  href="/projects"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  View all {projects.length} projects
                </Link>
              </>
            )}
          </div>
        )}

        {/* My Tasks */}
        {navLink("/dashboard?view=member", ListTodo, "My Tasks")}

        {/* Team & Settings */}
        <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800 space-y-0.5">
          {navLink("/team", Users, "Team")}
          {navLink("/settings", Settings, "Settings")}
        </div>

        {/* New Project (admin) */}
        {isAdmin && !collapsed && (
          <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href="/projects/new"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Plus className="h-4 w-4 shrink-0" />
              New Project
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800 space-y-1">
        {/* Admin: Switch to Member View */}
        {isAdmin && !collapsed && (
          <button
            onClick={toggleView}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
          >
            {isMemberView ? (
              <>
                <EyeOff className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Exit Member View</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">Admin</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">View as Member</span>
              </>
            )}
          </button>
        )}
        {/* Collapsed: just icon for member view */}
        {isAdmin && collapsed && (
          <button
            onClick={toggleView}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800"
            title={isMemberView ? "Exit Member View" : "View as Member"}
          >
            {isMemberView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-1">
            <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden dark:bg-zinc-700">
              {user.image ? (
                <img src={user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-medium text-zinc-500">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 truncate text-xs text-zinc-400">
              {user.name || user.email}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  )
}