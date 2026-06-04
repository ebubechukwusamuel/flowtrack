"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Activity, PlusCircle, CheckCircle, Edit3, Trash2, UserPlus, LogIn, MessageSquare, ListTodo } from "lucide-react"

type ActivityItem = {
  id: string
  action: string
  details: string
  createdAt: string
  user: { name: string | null; image: string | null }
  task: { title: string } | null
  project: { name: string } | null
}

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  readAt: string | null
  createdAt: string
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  created_task: <PlusCircle className="h-4 w-4 text-emerald-400" />,
  completed_task: <CheckCircle className="h-4 w-4 text-[#CAFF33]" />,
  updated_task: <Edit3 className="h-4 w-4 text-blue-400" />,
  deleted_task: <Trash2 className="h-4 w-4 text-red-400" />,
  joined_org: <UserPlus className="h-4 w-4 text-purple-400" />,
  signed_in: <LogIn className="h-4 w-4 text-zinc-400" />,
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  task_assigned: <ListTodo className="h-4 w-4 text-blue-400" />,
  new_message: <MessageSquare className="h-4 w-4 text-emerald-400" />,
}

function formatActivityAction(action: string): string {
  const map: Record<string, string> = {
    created_task: "created a task",
    completed_task: "completed a task",
    updated_task: "updated a task",
    deleted_task: "deleted a task",
    joined_org: "joined the workspace",
    signed_in: "signed in",
  }
  return map[action] || action
}

export function ActivityClient({ notifications, activities }: { notifications: NotificationItem[]; activities: ActivityItem[] }) {
  useEffect(() => {
    fetch("/api/notifications", { method: "PATCH" }).catch(() => {})
  }, [])

  const unreadNotifications = notifications.filter((n) => !n.readAt)

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[#CAFF33]" />
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadNotifications.length > 0 && (
            <span className="rounded-full bg-red-500/10 text-red-400 text-xs px-2 py-0.5 font-medium">
              {unreadNotifications.length} unread
            </span>
          )}
        </div>
      </motion.div>

      {/* Notifications Section */}
      {unreadNotifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">New</p>
          {unreadNotifications.map((n, i) => (
            <motion.a
              key={n.id}
              href={n.link || "#"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-start gap-3 rounded-xl border border-[#CAFF33]/20 bg-[#CAFF33]/5 px-4 py-3 hover:bg-[#CAFF33]/10 transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {NOTIFICATION_ICONS[n.type] || <Bell className="h-4 w-4 text-[#CAFF33]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
              </div>
              <time className="shrink-0 text-xs text-zinc-600">{formatRelativeTime(n.createdAt)}</time>
            </motion.a>
          ))}
        </motion.div>
      )}

      {/* Past Notifications */}
      {notifications.filter((n) => n.readAt).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider pt-2">Earlier</p>
          {notifications.filter((n) => n.readAt).map((n, i) => (
            <motion.a
              key={n.id}
              href={n.link || "#"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="mt-0.5 shrink-0 opacity-50">
                {NOTIFICATION_ICONS[n.type] || <Bell className="h-4 w-4 text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-400">{n.title}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{n.message}</p>
              </div>
              <time className="shrink-0 text-xs text-zinc-700">{formatRelativeTime(n.createdAt)}</time>
            </motion.a>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Workspace Activity Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-zinc-500" />
          <h2 className="text-sm font-medium text-zinc-400">Workspace Activity</h2>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-16 text-center">
            <Activity className="h-10 w-10 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500">No activity yet</p>
            <p className="text-xs text-zinc-600 mt-1">Actions from your team will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div className="mt-0.5 shrink-0">
                  {ACTIVITY_ICONS[item.action] || <Activity className="h-4 w-4 text-zinc-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium text-white">{item.user.name || "Someone"}</span>{" "}
                    {formatActivityAction(item.action)}
                    {item.task && (
                      <> in <span className="font-medium text-zinc-200">&ldquo;{item.task.title}&rdquo;</span></>
                    )}
                    {item.project && !item.task && (
                      <> in <span className="font-medium text-zinc-200">{item.project.name}</span></>
                    )}
                  </p>
                  {item.details && <p className="text-xs text-zinc-500 mt-0.5">{item.details}</p>}
                </div>
                <time className="shrink-0 text-xs text-zinc-600">{formatRelativeTime(item.createdAt)}</time>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
