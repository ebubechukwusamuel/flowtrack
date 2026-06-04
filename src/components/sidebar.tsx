"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ListTodo,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  Bell,
  User,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { tapScale, hoverLift, staggerContainer, staggerItem } from "@/lib/hooks/use-animation"

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

  const MotionLink = motion.create(Link)

  function navLink(href: string, icon: React.ComponentType<{ className?: string }>, label: string) {
    const Icon = icon
    const active = isActive(href)
    return (
      <MotionLink
        href={href}
        whileHover={{ x: collapsed ? 0 : 3, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium relative ${
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-[#CAFF33]/10 dark:text-[#CAFF33] font-semibold"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && label}
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[24px] bg-[#CAFF33] rounded-l-[2px] origin-center"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </MotionLink>
    )
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#262626] border border-[#262626] transition-all group-hover:border-[#CAFF33]/30">
              <span className="text-[#CAFF33] font-bold text-sm">FT</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight">FlowTrack</span>
              <span className="text-xs text-zinc-400 truncate">{orgName}</span>
            </div>
          </Link>
        )}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </div>

      {collapsed && (
        <div className="flex justify-center py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#262626] border border-[#262626]">
            <span className="text-[#CAFF33] font-bold text-sm">FT</span>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto scrollbar-thin">
        {/* Main Navigation */}
        {navLink("/dashboard", LayoutDashboard, "Dashboard")}
        {navLink("/projects", FolderKanban, "All Projects")}

        {/* Project list under All Projects */}
        {!collapsed && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="ml-2 mb-1 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-700"
          >
            {projects.length === 0 ? (
              <motion.p variants={staggerItem} className="px-3 py-1 text-xs text-zinc-400">No projects yet</motion.p>
            ) : projects.length <= 5 ? (
              projects.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <MotionLink
                    href={isMemberView ? `/projects/${p.id}?view=member` : `/projects/${p.id}`}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                      pathname === `/projects/${p.id}`
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </MotionLink>
                </motion.div>
              ))
            ) : (
              <>
                {projects.slice(0, 5).map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <MotionLink
                      href={isMemberView ? `/projects/${p.id}?view=member` : `/projects/${p.id}`}
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                        pathname === `/projects/${p.id}`
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.name}</span>
                    </MotionLink>
                  </motion.div>
                ))}
                <motion.div variants={staggerItem}>
                  <MotionLink
                    href="/projects"
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    View all {projects.length} projects
                  </MotionLink>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* My Tasks (members only, or admin in member view) */}
        {(!isAdmin || isMemberView) && navLink("/my-tasks", ListTodo, "My Tasks")}
        {/* Submissions (admin only) */}
        {isAdmin && !isMemberView && navLink("/submissions", CheckCircle2, "Submissions")}

        {/* Team & Settings */}
        <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800 space-y-0.5">
          {navLink("/activity", Bell, "Activity")}
          {navLink("/chat", MessageSquare, "Chat")}
          {navLink("/team", Users, "Team")}
          {navLink("/profile", User, "Profile")}
          {isAdmin && navLink("/settings", Settings, "Settings")}
        </div>

        {/* New Project (admin) */}
        {isAdmin && !collapsed && (
          <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800">
            <MotionLink
              href="/projects/new"
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Plus className="h-4 w-4 shrink-0" />
              New Project
            </MotionLink>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800 space-y-1">
        {/* Admin: Switch to Member View */}
        {isAdmin && !collapsed && (
          <motion.button
            onClick={toggleView}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#CAFF33] dark:hover:bg-zinc-800 dark:hover:text-[#CAFF33]"
          >
            {isMemberView ? (
              <>
                <EyeOff className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Exit Member View</span>
                <span className="rounded-full bg-[#CAFF33]/10 px-2 py-0.5 text-[10px] font-medium text-[#CAFF33] dark:bg-[#CAFF33]/10 dark:text-[#CAFF33]">Admin</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">View as Member</span>
              </>
            )}
          </motion.button>
        )}
        {/* Collapsed: just icon for member view */}
        {isAdmin && collapsed && (
          <motion.button
            onClick={toggleView}
            whileTap={{ scale: 0.9 }}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800"
            title={isMemberView ? "Exit Member View" : "View as Member"}
          >
            {isMemberView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
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
        <motion.button
          onClick={() => signOut()}
          whileHover={{ x: collapsed ? 0 : 2 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </motion.button>
      </div>
    </motion.aside>
  )
}