"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Users,
  UserCheck,
  Calendar,
  ArrowUpRight,
  Activity,
  AlertCircle,
  UserPlus,
  Target,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ProjectSummary, Activity as ActivityType } from "@/types"

interface StatCardData {
  label: string
  value: number
  icon: React.ElementType
  color: string
}

interface Stats {
  totalProjects: number
  myProjectCount: number
  totalTasks: number
  todoCount: number
  inProgressCount: number
  doneCount: number
  completionRate: number
  lowPriority: number
  mediumPriority: number
  highPriority: number
  urgentPriority: number
  tasksByProject: { name: string; color: string; count: number }[]
  tasksByDay: { date: string; created: number }[]
  myTasksByProject: { name: string; color: string; count: number }[]
  myTodoCount: number
  myInProgressCount: number
  myDoneCount: number
  myOverdueCount: number
  myDueSoonCount: number
  overdueCount: number
  dueSoonCount: number
  memberCount: number
}

interface MemberWorkload {
  id: string
  name: string
  image: string | null
  totalTasks: number
  doneTasks: number
}

interface UpcomingTask {
  id: string
  title: string
  dueDate: string
  priority: string
  projectName: string
  projectColor: string
}

const STATUS_COLORS = {
  todo: "#a1a1aa",
  in_progress: "#f59e0b",
  done: "#10b981",
}

const PRIORITY_COLORS = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#f97316",
  urgent: "#ef4444",
}

const PRIORITY_BG = {
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

function AnimatedValue({ value, suffix = "", className, glow }: { value: number; suffix?: string; className?: string; glow?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayed, setDisplayed] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 900
          const startTime = performance.now()
          function update(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(Math.round(value * eased))
            if (progress < 1) requestAnimationFrame(update)
          }
          requestAnimationFrame(update)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return <span ref={ref} className={`${className} ${glow ? "animate-glow-pulse" : ""}`} style={glow ? ({ '--glow': glow } as React.CSSProperties) : undefined}>{displayed}{suffix}</span>
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase()
  const bg = PRIORITY_BG[p as keyof typeof PRIORITY_BG] || "bg-zinc-100 text-zinc-600"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${bg}`}>
      {p}
    </span>
  )
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── MEMBER DASHBOARD ────────────────────────────────────────────────────────

function MemberDashboard({
  projects,
  myProjects,
  stats,
  activities,
  myActivities,
  myUpcomingTasks,
  orgName,
  user,
}: {
  projects: ProjectSummary[]
  myProjects: ProjectSummary[]
  stats: Stats
  activities: ActivityType[]
  myActivities: ActivityType[]
  myUpcomingTasks: UpcomingTask[]
  orgName: string
  user: { name: string; email: string; image: string | null }
}) {
  const totalMyTasks = stats.myTodoCount + stats.myInProgressCount + stats.myDoneCount
  const personalRate = totalMyTasks > 0 ? Math.round((stats.myDoneCount / totalMyTasks) * 100) : 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <Section delay={0}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden dark:bg-zinc-700">
              {user.image ? (
                <img src={user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-zinc-500">
                  {user.name[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{orgName}</p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Alert banner */}
      {stats.myOverdueCount > 0 && (
        <Section delay={0.05}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 dark:border-red-900 dark:bg-red-950"
          >
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              You have <strong>{stats.myOverdueCount}</strong> overdue task{stats.myOverdueCount !== 1 ? "s" : ""}.{" "}
              {stats.myDueSoonCount > 0 && (
                <span><strong>{stats.myDueSoonCount}</strong> due within 7 days.</span>
              )}
            </p>
            <Link href="/projects" className="ml-auto text-xs font-medium text-red-700 underline underline-offset-2 dark:text-red-300">
              View tasks
            </Link>
          </motion.div>
        </Section>
      )}

      {stats.myDueSoonCount > 0 && stats.myOverdueCount === 0 && (
        <Section delay={0.05}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-900 dark:bg-amber-950"
          >
            <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>{stats.myDueSoonCount}</strong> task{stats.myDueSoonCount !== 1 ? "s" : ""} due within 7 days
            </p>
          </motion.div>
        </Section>
      )}

      {/* My Task Progress */}
      <Section delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-4">
          {/* My stat cards */}
          {([
            { label: "My Tasks", value: totalMyTasks, icon: ListTodo, color: "text-indigo-500", glow: "#6366f1" },
            { label: "To Do", value: stats.myTodoCount, icon: Clock, color: "text-zinc-500", glow: "#a1a1aa" },
            { label: "In Progress", value: stats.myInProgressCount, icon: TrendingUp, color: "text-amber-500", glow: "#f59e0b" },
            { label: "Completed", value: stats.myDoneCount, icon: CheckCircle2, color: "text-emerald-500", glow: "#10b981" },
          ] as (StatCardData & { glow: string })[]).map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{card.label}</p>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <AnimatedValue value={card.value} className="mt-2 text-3xl font-bold" glow={card.glow} />
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* Personal completion + high priority */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section delay={0.25}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold">My Completion Rate</h2>
            </div>
            <div className="flex items-end gap-3">
              <AnimatedValue value={personalRate} suffix="%" className="text-3xl font-bold text-emerald-500" glow="#10b981" />
              <p className="text-xs text-zinc-400 mb-1">{stats.myDoneCount} of {totalMyTasks} tasks done</p>
            </div>
            {/* Mini progress bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${personalRate}%` }}
              />
            </div>
          </div>
        </Section>

        <Section delay={0.3}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold">Upcoming Deadlines</h2>
            </div>
            {myUpcomingTasks.length === 0 ? (
              <p className="text-sm text-zinc-400 py-3">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2 mt-2">
                {myUpcomingTasks.map((t) => {
                  const dueDate = new Date(t.dueDate)
                  const isSoon = dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
                  return (
                    <Link
                      key={t.id}
                      href={`/projects/${t.projectName.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.projectColor }} />
                      <span className="flex-1 truncate">{t.title}</span>
                      <PriorityBadge priority={t.priority} />
                      <span className={`text-xs whitespace-nowrap ${isSoon ? "text-red-500 font-medium" : "text-zinc-400"}`}>
                        {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* My tasks by project + activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section delay={0.35}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold mb-4">My Tasks per Project</h2>
            {stats.myTasksByProject.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No tasks assigned yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(180, stats.myTasksByProject.length * 44)}>
                <AreaChart data={stats.myTasksByProject} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="myTasksWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#a1a1aa" }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  <Area type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2.5} fill="url(#myTasksWaveGrad)"
                    isAnimationActive={true} animationDuration={1200}
                    dot={{ fill: "#818cf8", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>

        <Section delay={0.4}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold">My Recent Activity</h2>
            </div>
            {myActivities.length === 0 && activities.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">No activity yet</p>
            ) : (
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                {(myActivities.length > 0 ? myActivities : activities.slice(0, 5)).map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0 dark:bg-zinc-700 dark:text-zinc-300">
                      {(a.user.name || a.user.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-900 dark:text-zinc-100">{a.user.name || a.user.email}</span>{" "}
                      <span className="text-zinc-500">
                        {formatActivityAction(a, true)}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                      {formatRelativeTime(a.createdAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Status distribution + My Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section delay={0.45}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold mb-4">My Task Status</h2>
            {totalMyTasks === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No tasks assigned yet</p>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: "To Do", value: stats.myTodoCount, color: STATUS_COLORS.todo },
                      { name: "In Progress", value: stats.myInProgressCount, color: STATUS_COLORS.in_progress },
                      { name: "Done", value: stats.myDoneCount, color: STATUS_COLORS.done },
                    ].filter((d) => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
                      isAnimationActive={true} animationDuration={1200}
                    >
                      {[stats.myTodoCount, stats.myInProgressCount, stats.myDoneCount]
                        .filter((v) => v > 0)
                        .map((_, i) => {
                          const colors = [STATUS_COLORS.todo, STATUS_COLORS.in_progress, STATUS_COLORS.done].filter((_, j) => {
                            const vals = [stats.myTodoCount, stats.myInProgressCount, stats.myDoneCount]
                            return vals[j] > 0
                          })
                          return <Cell key={i} fill={colors[i]} />
                        })}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {[
                { name: "To Do", value: stats.myTodoCount, color: STATUS_COLORS.todo },
                { name: "In Progress", value: stats.myInProgressCount, color: STATUS_COLORS.in_progress },
                { name: "Done", value: stats.myDoneCount, color: STATUS_COLORS.done },
              ].filter((d) => d.value > 0).map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.5}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">My Projects</h2>
              <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                View all
              </Link>
            </div>
            {myProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-500">Not assigned to any projects yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myProjects.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 font-medium truncate">{p.name}</span>
                    <span className="text-xs text-zinc-400">{p._count.tasks} tasks</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Team activity */}
      <Section delay={0.55}>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold">Team Activity</h2>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">No team activity yet</p>
          ) : (
            <div className="space-y-1 max-h-[240px] overflow-y-auto">
              {activities.slice(0, 8).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0 dark:bg-zinc-700 dark:text-zinc-300">
                    {(a.user.name || a.user.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-900 dark:text-zinc-100">{a.user.name || a.user.email}</span>{" "}
                    <span className="text-zinc-500">{formatActivityAction(a)}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap">{formatRelativeTime(a.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminDashboard({
  projects,
  stats,
  activities,
  memberWorkload,
  orgName,
}: {
  projects: ProjectSummary[]
  stats: Stats
  activities: ActivityType[]
  memberWorkload: MemberWorkload[]
  orgName: string
}) {
  const statusData = [
    { name: "To Do", value: stats.todoCount, color: STATUS_COLORS.todo },
    { name: "In Progress", value: stats.inProgressCount, color: STATUS_COLORS.in_progress },
    { name: "Done", value: stats.doneCount, color: STATUS_COLORS.done },
  ].filter((d) => d.value > 0)

  const priorityData = [
    { name: "Low", value: stats.lowPriority, color: PRIORITY_COLORS.low },
    { name: "Medium", value: stats.mediumPriority, color: PRIORITY_COLORS.medium },
    { name: "High", value: stats.highPriority, color: PRIORITY_COLORS.high },
    { name: "Urgent", value: stats.urgentPriority, color: PRIORITY_COLORS.urgent },
  ].filter((d) => d.value > 0)

  const showAlerts = stats.overdueCount > 0 || stats.dueSoonCount > 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <Section delay={0}>
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{orgName}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Workspace overview · {stats.memberCount} member{stats.memberCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* Alerts */}
      {showAlerts && (
        <Section delay={0.05}>
          <div className="flex gap-4 flex-wrap">
            {stats.overdueCount > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950"
              >
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <span className="text-red-700 dark:text-red-300"><strong>{stats.overdueCount}</strong> overdue across team</span>
              </motion.div>
            )}
            {stats.dueSoonCount > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950"
              >
                <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="text-amber-700 dark:text-amber-300"><strong>{stats.dueSoonCount}</strong> due within 7 days</span>
              </motion.div>
            )}
          </div>
        </Section>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([
          { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban, color: "text-indigo-500", glow: "#6366f1" },
          { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "text-blue-500", glow: "#3b82f6" },
          { label: "In Progress", value: stats.inProgressCount, icon: Clock, color: "text-amber-500", glow: "#f59e0b" },
          { label: "Completed", value: stats.doneCount, icon: CheckCircle2, color: "text-emerald-500", glow: "#10b981" },
          { label: "Team Members", value: stats.memberCount, icon: Users, color: "text-violet-500", glow: "#8b5cf6" },
          { label: "Overdue", value: stats.overdueCount, icon: AlertCircle, color: "text-red-500", glow: "#ef4444" },
        ] as (StatCardData & { glow: string })[]).map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <AnimatedValue value={card.value} className="mt-2 text-3xl font-bold" glow={card.glow} />
            </motion.div>
          )
        })}
      </div>

      {/* Metric cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section delay={0.4}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold">Completion Rate</h2>
            </div>
            <AnimatedValue value={stats.completionRate} suffix="%" className="text-3xl font-bold text-emerald-500" glow="#10b981" />
            <p className="text-xs text-zinc-400 mt-1">{stats.doneCount} of {stats.totalTasks} tasks done</p>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div className="h-2 rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.completionRate}%` }} />
            </div>
          </div>
        </Section>

        <Section delay={0.45}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-sm font-semibold">High Priority Tasks</h2>
            </div>
            <AnimatedValue value={stats.highPriority + stats.urgentPriority} className="text-3xl font-bold text-red-500" glow="#ef4444" />
            <p className="text-xs text-zinc-400 mt-1">{stats.highPriority} high, {stats.urgentPriority} urgent</p>
          </div>
        </Section>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section delay={0.5}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold mb-4">Status Distribution</h2>
            {statusData.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No tasks yet</p>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
                      isAnimationActive={true} animationDuration={1200}
                    >
                      {statusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.55}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold mb-4">Priority Distribution</h2>
            {priorityData.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No tasks yet</p>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
                      isAnimationActive={true} animationDuration={1200}
                    >
                      {priorityData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {stats.tasksByProject.length > 0 && (
          <Section delay={0.6}>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold mb-4">Tasks per Project</h2>
              <ResponsiveContainer width="100%" height={Math.max(200, stats.tasksByProject.length * 44)}>
                <AreaChart data={stats.tasksByProject} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tasksWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#a1a1aa" }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  <Area type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2.5} fill="url(#tasksWaveGrad)"
                    isAnimationActive={true} animationDuration={1200}
                    dot={{ fill: "#818cf8", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {stats.tasksByDay.some((d) => d.created > 0) && (
          <Section delay={0.65}>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold mb-4">7-Day Activity</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.tasksByDay} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="activityWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#a1a1aa" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "13px", color: "#f4f4f5" }} />
                  <Area type="monotone" dataKey="created" stroke="#818cf8" strokeWidth={2.5} fill="url(#activityWaveGrad)"
                    isAnimationActive={true} animationDuration={1200}
                    dot={{ fill: "#818cf8", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}
      </div>

      {/* Team workload */}
      <Section delay={0.7}>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold">Team Workload</h2>
          </div>
          {memberWorkload.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">No team members yet</p>
          ) : (
            <div className="space-y-3">
              {memberWorkload.map((m, i) => {
                const rate = m.totalTasks > 0 ? Math.round((m.doneTasks / m.totalTasks) * 100) : 0
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600 shrink-0 dark:bg-zinc-700 dark:text-zinc-300">
                      {m.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{m.name}</span>
                        <span className="text-xs text-zinc-400 ml-2">{m.doneTasks}/{m.totalTasks} done</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${rate}%`, backgroundColor: rate > 66 ? "#10b981" : rate > 33 ? "#f59e0b" : "#ef4444" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </Section>

      {/* Recent activity */}
      <Section delay={0.75}>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">No activity yet. Start by creating a project!</p>
          ) : (
            <div className="space-y-1 max-h-[320px] overflow-y-auto">
              {activities.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0 dark:bg-zinc-700 dark:text-zinc-300">
                    {(a.user.name || a.user.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-900 dark:text-zinc-100">{a.user.name || a.user.email}</span>{" "}
                    <span className="text-zinc-500">{formatActivityAction(a)}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap">{formatRelativeTime(a.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Recent projects */}
      <Section delay={0.8}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700"
            >
              <FolderKanban className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-500">No projects yet</p>
              <Link href="/projects/new" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
                Create your first project
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.85 + i * 0.05 }}
                >
                  <Link href={`/projects/${project.id}`}
                    className="group block rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <h3 className="font-medium truncate">{project.name}</h3>
                    </div>
                    {project.description && <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{project.description}</p>}
                    <p className="mt-3 text-xs text-zinc-400">{project._count.tasks} tasks</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatActivityAction(a: { action: string; task?: { title: string } | null; project?: { name: string } | null; details: string }, short = false) {
  if (a.action === "created" && a.task?.title) return `created task "${a.task.title}"`
  if (a.action === "created" && a.project?.name) return `created project "${a.project.name}"`
  if (a.action === "updated" && a.task?.title) return `updated "${a.task.title}"`
  if (a.action === "completed" && a.task?.title) return `completed "${a.task.title}"`
  if (a.action === "deleted") return `deleted ${a.details}`
  return a.details || a.action
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export function DashboardClient({
  projects,
  myProjects,
  isAdmin,
  userId,
  orgName,
  user,
  activities,
  myActivities,
  memberWorkload,
  myUpcomingTasks,
  stats,
}: {
  projects: ProjectSummary[]
  myProjects: ProjectSummary[]
  isAdmin: boolean
  userId: string
  orgName: string
  user: { name: string; email: string; image: string | null }
  activities: ActivityType[]
  myActivities: ActivityType[]
  memberWorkload: MemberWorkload[]
  myUpcomingTasks: UpcomingTask[]
  stats: Stats
}) {
  const searchParams = useSearchParams()
  const isMemberView = searchParams.get("view") === "member"
  const effectiveIsAdmin = isAdmin && !isMemberView

  if (effectiveIsAdmin) {
    return <AdminDashboard projects={projects} stats={stats} activities={activities} memberWorkload={memberWorkload} orgName={orgName} />
  }

  return (
    <MemberDashboard
      projects={projects}
      myProjects={myProjects}
      stats={stats}
      activities={activities}
      myActivities={myActivities}
      myUpcomingTasks={myUpcomingTasks}
      orgName={orgName}
      user={user}
    />
  )
}
