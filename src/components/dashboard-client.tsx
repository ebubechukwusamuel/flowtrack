"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  BarChart3,
  Search,
  Bell,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react"
import {
  tapScale,
  hoverLift,
  staggerContainer,
  staggerItem,
  springSnappy,
  fadeInUp,
} from "@/lib/hooks/use-animation"
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

interface DashboardTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  projectName: string
  projectColor: string
  assignee: { id: string; name: string } | null
}

interface StatCardData {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
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
  status: string
  dueDate: string
  priority: string
  projectName: string
  projectColor: string
}

// Global visual style configurations
const STATUS_COLORS: Record<string, string> = {
  todo: "#a1a1aa",
  in_progress: "#f59e0b",
  done: "#CAFF33",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#f97316",
  urgent: "#ef4444",
}

const PRIORITY_BG: Record<string, string> = {
  low: "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30",
  medium: "bg-blue-900/20 text-blue-400 border border-blue-800/30",
  high: "bg-orange-900/20 text-orange-400 border border-orange-850/30",
  urgent: "bg-red-900/20 text-red-400 border border-red-850/30",
}

const PRIORITY_TEXT: Record<string, string> = {
  low: "text-zinc-400",
  medium: "text-blue-400",
  high: "text-orange-400",
  urgent: "text-red-400",
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
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className={`${className} ${glow ? "animate-glow-pulse" : ""}`} style={glow ? ({ '--glow': glow } as React.CSSProperties) : undefined}>
      {displayed.toLocaleString()}{suffix}
    </span>
  )
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
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

// ----------------------------------------------------
// 1. REUSABLE FIGMA-STYLE STAT CARD
// ----------------------------------------------------
function FigmaStatCard({
  label,
  value,
  icon: Icon,
  color,
  i = 0,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  i?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: [0.2, 0, 0.15, 1] }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:border-[#CAFF33]/30 transition-all duration-300 group cursor-default"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <AnimatedValue value={value} className="text-[28px] font-semibold text-white leading-tight font-lexend" />
          <p className="text-sm font-light text-zinc-400">{label}</p>
        </div>
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="h-11 w-11 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center text-[#CAFF33] shadow-md shrink-0 group-hover:bg-[#CAFF33] group-hover:text-[#1C1C1C] transition-colors duration-300"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ----------------------------------------------------
// 2. ADMIN DASHBOARD VIEW (Redesigned per Figma mockups)
// ----------------------------------------------------
function AdminDashboard({
  projects,
  stats,
  activities,
  memberWorkload,
  orgName,
  user,
  tasks,
}: {
  projects: ProjectSummary[]
  stats: Stats
  activities: ActivityType[]
  memberWorkload: MemberWorkload[]
  orgName: string
  user: { name: string; email: string; image: string | null }
  tasks: DashboardTask[]
}) {
  const [activeFaqTab, setActiveFaqTab] = useState<"monthly" | "weekly">("monthly")
  const [dateFilter, setDateFilter] = useState("all")
  const [dateFilterOpen, setDateFilterOpen] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch("/api/notifications/unread-count").then((r) => r.json()).then((d) => setUnreadCount(d.count)).catch(() => {})
    const interval = setInterval(() => {
      fetch("/api/notifications/unread-count").then((r) => r.json()).then((d) => setUnreadCount(d.count)).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  function filterTasksByDate(taskList: DashboardTask[]): DashboardTask[] {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)

    if (dateFilter === "today") {
      return taskList.filter((t) => {
        const d = new Date(t.createdAt)
        return d >= startOfDay && d < endOfDay
      })
    }
    if (dateFilter === "week") {
      const dayOfWeek = startOfDay.getDay()
      const weekStart = new Date(startOfDay)
      weekStart.setDate(weekStart.getDate() - ((dayOfWeek + 6) % 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      return taskList.filter((t) => {
        const d = new Date(t.createdAt)
        return d >= weekStart && d < weekEnd
      })
    }
    if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return taskList.filter((t) => {
        const d = new Date(t.createdAt)
        return d >= monthStart && d < monthEnd
      })
    }
    if (dateFilter === "custom" && customStart && customEnd) {
      const cs = new Date(customStart)
      const ce = new Date(customEnd)
      ce.setDate(ce.getDate() + 1)
      return taskList.filter((t) => {
        const d = new Date(t.createdAt)
        return d >= cs && d < ce
      })
    }
    return taskList
  }

  const filteredTasks = filterTasksByDate(tasks)

  const chartData = stats.tasksByDay.length > 0 ? stats.tasksByDay : [{ date: "No data", created: 0 }]

  // Pie chart segment data matching To Do, In Progress, Done
  const statusData = [
    { name: "To Do", value: stats.todoCount, color: "#4b5563" },
    { name: "In Progress", value: stats.inProgressCount, color: "#f59e0b" },
    { name: "Completed", value: stats.doneCount, color: "#CAFF33" },
  ].filter((item) => item.value > 0)

  return (
    <div className="p-6 space-y-8 bg-[#1A1A1A] min-h-screen text-white font-lexend">
      
      {/* HEADER SECTION (Figma Welcome + Actions) */}
      <Section delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#262626]">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight">
              Welcome Back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs font-light text-zinc-500">{orgName} Workspace Admin Console</p>
          </div>
          
          {/* Header Action Items */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            {/* Search Input bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                placeholder="Search analytics..."
                className="w-48 bg-[#1C1C1C] border border-[#262626] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CAFF33]/50 transition-all"
              />
            </div>
            
            {/* Alert bell notification */}
            <Link href="/activity">
              <motion.div
                whileHover={{ scale: 1.05, borderColor: "#52525b" }}
                whileTap={{ scale: 0.9 }}
                animate={stats.overdueCount > 0 ? { rotate: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative p-2 bg-[#1C1C1C] border border-[#262626] rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-1"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* Profile widget */}
            <Link href="/profile">
              <motion.div
                whileHover={{ borderColor: "#52525b" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] border border-[#262626] rounded-xl cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0 text-xs text-white">
                  {user.image ? (
                    <img src={user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-light truncate max-w-[80px] text-zinc-300">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
              </motion.div>
            </Link>
          </div>
        </div>
      </Section>

      {/* ALERTS */}
      {stats.overdueCount > 0 && (
        <Section delay={0.03}>
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-5 py-3.5 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="font-light">
              Alert: Workspace contains <strong>{stats.overdueCount}</strong> overdue task{stats.overdueCount !== 1 ? "s" : ""} requiring prompt assignee followups.
            </p>
            <Link href="/projects" className="ml-auto text-xs font-medium text-red-400 underline underline-offset-4">
              Address tasks
            </Link>
          </div>
        </Section>
      )}

      {/* FIGMA STAT CARDS ROW (4 Columns) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <FigmaStatCard
          label="Total Workspace Tasks"
          value={stats.totalTasks}
          icon={ListTodo}
          color="text-blue-500"
          i={0}
        />
        <FigmaStatCard
          label="Active Client Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          color="text-amber-500"
          i={1}
        />
        <FigmaStatCard
          label="Completed Tasks"
          value={stats.doneCount}
          icon={CheckCircle2}
          color="text-[#CAFF33]"
          i={2}
        />
        <FigmaStatCard
          label="Pending & In Progress"
          value={stats.inProgressCount + stats.todoCount}
          icon={Clock}
          color="text-violet-500"
          i={3}
        />
      </div>

      {/* FIGMA MIDDLE ROW: LINE CHART & DOUGHNUT */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Line Chart (Figma Orders Analytics) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-8 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#262626] pb-4">
            <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
              Workspace Activity Analytics
            </h2>
            {/* Chart Legend */}
            <div className="flex items-center gap-6 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" />
                <span>Tasks Created</span>
              </div>
            </div>
          </div>

          {/* Area Chart visualization */}
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #333333", borderRadius: "12px", fontSize: "12px", color: "#f4f4f5" }}
                  itemStyle={{ color: "#CAFF33" }}
                  labelClassName="font-medium text-white mb-1"
                />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#818cf8" 
                  strokeWidth={2.5} 
                  fill="url(#createdGrad)"
                  dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Doughnut Chart (Figma Earnings) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-4 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
              Completion Progress
            </h2>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <MoreHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Recharts Doughnut Pie */}
          <div className="relative h-[200px] w-full flex items-center justify-center">
            {statusData.length === 0 ? (
              <p className="text-sm text-zinc-500">No active tasks</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={statusData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={65} 
                      outerRadius={85} 
                      paddingAngle={4} 
                      dataKey="value"
                      isAnimationActive={true} 
                      animationDuration={1000}
                    >
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "10px", fontSize: "12px", color: "#f4f4f5" }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centered value indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-white tracking-tight font-lexend">
                    {stats.completionRate}%
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-light mt-0.5">
                    Completed
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Legends with customized status dots */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2 text-xs">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong className="text-white font-medium">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* FIGMA BOTTOM ROW: TASK LIST TABLE */}
      <Section delay={0.6}>
        <motion.div
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
        >
          
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
                Workspace Task List
              </h2>
              <p className="text-xs text-zinc-500 font-light mt-1">Listing recently created organization tickets</p>
            </div>
            <div className="relative">
              <motion.div
                whileHover={{ borderColor: "#52525b" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#262626] rounded-lg cursor-pointer hover:border-zinc-700 text-xs"
              >
                <span className="text-zinc-300 font-light">
                  {dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : "Custom"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </motion.div>
              {dateFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 z-20 w-44 bg-[#1C1C1C] border border-[#262626] rounded-xl p-1.5 shadow-xl"
                >
                  {[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "custom", label: "Custom Range" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setDateFilter(opt.value); if (opt.value !== "custom") setDateFilterOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        dateFilter === opt.value ? "bg-[#CAFF33]/10 text-[#CAFF33]" : "text-zinc-400 hover:text-white hover:bg-[#262626]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {dateFilter === "custom" && (
                    <div className="border-t border-[#262626] mt-1.5 pt-1.5 px-1 space-y-1.5">
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-[#262626] border border-[#333] rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-[#262626] border border-[#333] rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <button
                        onClick={() => setDateFilterOpen(false)}
                        className="w-full text-center px-2 py-1 rounded-lg text-xs bg-[#CAFF33] text-[#1A1A1A] font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Table display */}
          <div className="overflow-x-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-light text-sm">
                No active workspace tasks. Start by creating a project and task.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#262626] text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <th className="pb-4 pl-2 w-[6%]">No</th>
                    <th className="pb-4 w-[12%]">Task ID</th>
                    <th className="pb-4 w-[12%]">Date Created</th>
                    <th className="pb-4 w-[20%]">Task Title</th>
                    <th className="pb-4 w-[18%]">Assignee</th>
                    <th className="pb-4 w-[14%]">Project</th>
                    <th className="pb-4 w-[10%]">Urgency</th>
                    <th className="pb-4 w-[10%]">Status</th>
                    <th className="pb-4 pr-2 w-[6%] text-center">Action</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-[#262626]/40 text-xs font-light text-zinc-300"
                >
                  {filteredTasks.slice(0, 5).map((t, idx) => {
                    const statusDot = STATUS_COLORS[t.status] || "#a1a1aa"
                    return (
                      <motion.tr
                        key={t.id}
                        variants={staggerItem}
                        whileHover={{ backgroundColor: "rgba(26,26,26,0.6)" }}
                        className="transition-colors"
                      >
                        <td className="py-4 pl-2 font-normal text-white">{idx + 1}</td>
                        <td className="py-4 font-mono font-medium text-[#CAFF33]">#FT-{t.id.slice(-5).toUpperCase()}</td>
                        <td className="py-4 text-zinc-400">
                          {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-4 font-medium text-white truncate max-w-[200px]">{t.title}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                              {(t.assignee?.name || "?")[0].toUpperCase()}
                            </div>
                            <span className="truncate max-w-[120px]">{t.assignee?.name || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.projectColor }} />
                            <span className="truncate max-w-[100px] text-zinc-400">{t.projectName}</span>
                          </div>
                        </td>
                        <td className="py-4 font-medium" style={{ color: PRIORITY_COLORS[t.priority] || "#a1a1aa" }}>
                          {t.priority.toUpperCase()}
                        </td>
                        <td className="py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1C1C] border border-[#262626] shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: statusDot }} />
                            <span className="text-[10px] text-zinc-300 font-normal">
                              {t.status === "todo" ? "To Do" : t.status === "in_progress" ? "In Progress" : "Done"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-2 text-center text-zinc-500 hover:text-white transition-colors cursor-pointer">
                          <MoreHorizontal className="h-4 w-4 mx-auto" />
                        </td>
                      </motion.tr>
                    )
                  })}
                </motion.tbody>
              </table>
            )}
          </div>

        </motion.div>
      </Section>

      {/* TEAM WORKLOAD & PROJECTS ROW */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Team Workload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-6 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
            <Users className="h-4.5 w-4.5 text-[#CAFF33]" />
            <h2 className="text-base font-medium text-white tracking-tight">Team Workload Distribution</h2>
          </div>
          
          {memberWorkload.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No active team members.</p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {memberWorkload.map((m) => {
                const rate = m.totalTasks > 0 ? Math.round((m.doneTasks / m.totalTasks) * 100) : 0
                return (
                  <motion.div key={m.id} variants={staggerItem} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                          {m.name[0].toUpperCase()}
                        </div>
                        <span className="font-normal text-white truncate max-w-[150px]">{m.name}</span>
                      </div>
                      <span className="text-zinc-500 shrink-0">{m.doneTasks}/{m.totalTasks} resolved</span>
                    </div>
                    <div className="h-2 w-full bg-[#1A1A1A] border border-[#262626] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${rate}%` }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        className="h-full rounded-full bg-[#CAFF33] shadow-[0_0_8px_rgba(202,255,51,0.2)]"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Right Column: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-6 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
            <Activity className="h-4.5 w-4.5 text-[#CAFF33]" />
            <h2 className="text-base font-medium text-white tracking-tight">Recent Activity Stream</h2>
          </div>
          
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No activity logged.</p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3 max-h-[220px] overflow-y-auto pr-1"
            >
              {activities.slice(0, 4).map((a) => (
                <motion.div key={a.id} variants={staggerItem} whileHover={{ x: 4 }} className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                    {(a.user.name || a.user.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white truncate max-w-[120px] inline-block align-bottom">{a.user.name || a.user.email}</span>{" "}
                    <span className="text-zinc-500">{formatActivityAction(a)}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0 font-light">{formatRelativeTime(a.createdAt)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </div>

    </div>
  )
}

// ----------------------------------------------------
// 3. MEMBER DASHBOARD VIEW (Redesigned per Figma mockups)
// ----------------------------------------------------
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [upcomingTasks, setUpcomingTasks] = useState(myUpcomingTasks)

  async function handleStartTask(taskId: string) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: "in_progress" }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUpcomingTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t))
      )
    }
  }

  useEffect(() => {
    fetch("/api/notifications/unread-count").then((r) => r.json()).then((d) => setUnreadCount(d.count)).catch(() => {})
    const interval = setInterval(() => {
      fetch("/api/notifications/unread-count").then((r) => r.json()).then((d) => setUnreadCount(d.count)).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const totalMyTasks = stats.myTodoCount + stats.myInProgressCount + stats.myDoneCount

  const memberChartData = stats.tasksByDay.length > 0 ? stats.tasksByDay : [{ date: "No data", created: 0 }]

  const memberStatusData = [
    { name: "To Do", value: stats.myTodoCount, color: "#4b5563" },
    { name: "In Progress", value: stats.myInProgressCount, color: "#f59e0b" },
    { name: "Completed", value: stats.myDoneCount, color: "#CAFF33" },
  ].filter((item) => item.value > 0)

  return (
    <div className="p-6 space-y-8 bg-[#1A1A1A] min-h-screen text-white font-lexend">
      
      {/* HEADER ROW */}
      <Section delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#262626]">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs font-light text-zinc-500">{orgName} Member Portal</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            <Link href="/activity">
              <motion.div
                whileHover={{ scale: 1.05, borderColor: "#52525b" }}
                whileTap={{ scale: 0.9 }}
                animate={stats.myOverdueCount > 0 ? { rotate: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative p-2 bg-[#1C1C1C] border border-[#262626] rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-1"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            <Link href="/profile">
              <motion.div
                whileHover={{ borderColor: "#52525b" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] border border-[#262626] rounded-xl cursor-pointer"
              >
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0 text-xs text-white">
                  {user.image ? (
                    <img src={user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-light truncate max-w-[80px] text-zinc-300">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
              </motion.div>
            </Link>
          </div>
        </div>
      </Section>

      {/* OVERDUE ALERTS */}
      {stats.myOverdueCount > 0 && (
        <Section delay={0.03}>
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-5 py-3.5 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="font-light">
              Attention: You have <strong>{stats.myOverdueCount}</strong> overdue task{stats.myOverdueCount !== 1 ? "s" : ""} pending completion.
            </p>
            <Link href="/my-tasks" className="ml-auto text-xs font-medium text-red-400 underline underline-offset-4">
              View my tasks
            </Link>
          </div>
        </Section>
      )}

      {/* FIGMA MEMBER STAT CARDS */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <FigmaStatCard
          label="My Assigned Tasks"
          value={totalMyTasks}
          icon={ListTodo}
          color="text-blue-500"
          i={0}
        />
        <FigmaStatCard
          label="Tasks To Do"
          value={stats.myTodoCount}
          icon={Clock}
          color="text-zinc-400"
          i={1}
        />
        <FigmaStatCard
          label="Tasks In Progress"
          value={stats.myInProgressCount}
          icon={TrendingUp}
          color="text-amber-500"
          i={2}
        />
        <FigmaStatCard
          label="Completed Tasks"
          value={stats.myDoneCount}
          icon={CheckCircle2}
          color="text-[#CAFF33]"
          i={3}
        />
      </div>

      {/* FIGMA MIDDLE ROW: LINE CHART & DOUGHNUT */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        
        {/* Line Chart Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-8 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#262626] pb-4">
            <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
              My Created Tasks
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" />
              <span>Tasks Created</span>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberChartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1C1C1C", border: "1px solid #333333", borderRadius: "12px", fontSize: "12px", color: "#f4f4f5" }} />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#818cf8" 
                  strokeWidth={2.5} 
                  fill="url(#memberCreatedGrad)"
                  dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Doughnut distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="lg:col-span-4 bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
              My Task States
            </h2>
          </div>

          <div className="relative h-[200px] w-full flex items-center justify-center">
            {memberStatusData.length === 0 ? (
              <p className="text-sm text-zinc-500">No active tasks</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={memberStatusData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={65} 
                      outerRadius={85} 
                      paddingAngle={4} 
                      dataKey="value"
                      isAnimationActive={true} 
                      animationDuration={1000}
                    >
                      {memberStatusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-white tracking-tight font-lexend">
                    {stats.myTodoCount + stats.myInProgressCount > 0 ? Math.round((stats.myDoneCount / totalMyTasks) * 100) : 100}%
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-light mt-0.5">
                    Rate
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center gap-3 text-xs flex-wrap">
            {memberStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* FIGMA BOTTOM ROW: MY UPCOMING TASKS */}
      <Section delay={0.65}>
        <motion.div
          whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-5 xl:p-6 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="border-b border-[#262626] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base xl:text-lg font-medium text-white tracking-tight">
                My Upcoming Deadlines
              </h2>
              <p className="text-xs text-zinc-500 font-light mt-1">Listing pending tickets assigned to you with approaching milestones</p>
            </div>
            <motion.a
              href="/my-tasks"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-[#CAFF33] hover:underline hover:text-[#d8ff5c]"
            >
              Go to Taskboard →
            </motion.a>
          </div>

          <div className="overflow-x-auto">
            {myUpcomingTasks.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">You have no upcoming task deadlines.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#262626] text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">No</th>
                    <th className="pb-3">Task Title</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3 pr-2 text-center">Action</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-[#262626]/40 text-xs font-light text-zinc-300"
                >
                  {upcomingTasks.map((t, idx) => {
                    const isOverdue = new Date(t.dueDate) < new Date()
                    return (
                      <motion.tr
                        key={t.id}
                        variants={staggerItem}
                        whileHover={{ backgroundColor: "rgba(26,26,26,0.6)" }}
                        className="transition-colors"
                      >
                        <td className="py-3.5 pl-2 font-normal text-white">{idx + 1}</td>
                        <td className="py-3.5">
                          <button
                            onClick={() => {
                              if (t.status === "todo") handleStartTask(t.id)
                            }}
                            className="font-medium text-white hover:text-[#CAFF33] text-left"
                          >
                            {t.title}
                          </button>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            t.status === "todo"
                              ? "bg-zinc-700 text-zinc-400"
                              : t.status === "in_progress"
                              ? "bg-amber-900 text-amber-300"
                              : "bg-[#CAFF33]/10 text-[#CAFF33]"
                          }`}>
                            {t.status === "todo" ? "To Do" : t.status === "in_progress" ? "In Progress" : "Done"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.projectColor }} />
                            <span className="truncate max-w-[120px] text-zinc-400">{t.projectName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-medium" style={{ color: PRIORITY_COLORS[t.priority.toLowerCase()] || "#a1a1aa" }}>
                          {t.priority.toUpperCase()}
                        </td>
                        <td className={`py-3.5 font-medium ${isOverdue ? "text-red-500" : "text-zinc-400"}`}>
                          {isOverdue ? "Overdue: " : ""}
                          {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </motion.tr>
                    )
                  })}
                </motion.tbody>
              </table>
            )}
          </div>
        </motion.div>
      </Section>

    </div>
  )
}

// ----------------------------------------------------
// 4. MAIN EXPORT ROUTE WRAPPER
// ----------------------------------------------------
export function DashboardClient({
  projects,
  myProjects,
  isAdmin,
  userId,
  orgName,
  user,
  tasks,
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
  tasks: DashboardTask[]
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
    return (
      <AdminDashboard 
        projects={projects} 
        stats={stats} 
        activities={activities} 
        memberWorkload={memberWorkload} 
        orgName={orgName} 
        user={user}
        tasks={tasks}
      />
    )
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

function formatActivityAction(a: { action: string; task?: { title: string } | null; project?: { name: string } | null; details: string }) {
  if (a.action === "created" && a.task?.title) return `created task "${a.task.title}"`
  if (a.action === "created" && a.project?.name) return `created project "${a.project.name}"`
  if (a.action === "updated" && a.task?.title) return `updated "${a.task.title}"`
  if (a.action === "completed" && a.task?.title) return `completed "${a.task.title}"`
  if (a.action === "deleted") return `deleted ${a.details}`
  return a.details || a.action
}
