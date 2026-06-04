"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Search,
  Send,
  Link2,
  ExternalLink,
  Calendar,
  FolderKanban,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { TaskDialog } from "./task-dialog"
import type { Task, User } from "@/types"

interface MyTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  submissionLink: string | null
  projectId: string
  projectName: string
  projectColor: string
  assignee: { id: string; name: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  done: "bg-[#CAFF33]/10 text-[#CAFF33]",
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

const PRIORITY_ICONS: Record<string, typeof ArrowDown> = {
  low: ArrowDown,
  medium: AlertCircle,
  high: ArrowUp,
  urgent: AlertCircle,
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-orange-500",
  urgent: "text-red-500",
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

const FILTERS = ["all", "todo", "in_progress", "done"] as const

function SubmitWidget({ taskId, onDone }: { taskId: string; onDone: () => void }) {
  const [link, setLink] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!link.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, submissionLink: link.trim(), status: "done" }),
      })
      if (res.ok) onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste your deliverable link..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#CAFF33] focus:ring-1 focus:ring-[#CAFF33] placeholder:text-zinc-500 text-zinc-100"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || !link.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] hover:bg-[#d8ff5c] disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? "..." : "Submit"}
      </button>
    </div>
  )
}

function TaskCard({ task, onSubmitted, onClick }: { task: MyTask; onSubmitted: () => void; onClick: () => void }) {
  const PriorityIcon = PRIORITY_ICONS[task.priority] || AlertCircle
  const priorityColor = PRIORITY_COLORS[task.priority] || "text-zinc-500"
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onClick} className="font-medium text-left hover:text-zinc-600 dark:hover:text-zinc-300">
              {task.title}
            </button>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
              {STATUS_LABELS[task.status] || task.status}
            </span>
          </div>
          {task.description && (
            <p className="mt-1.5 text-sm text-zinc-500">{task.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
            <Link href={`/projects/${task.projectId}`} className="inline-flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.projectColor }} />
              {task.projectName}
            </Link>
            <span className={`inline-flex items-center gap-1 ${priorityColor}`}>
              <PriorityIcon className="h-3.5 w-3.5" />
              {PRIORITY_LABELS[task.priority] || "Medium"}
            </span>
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                <Calendar className="h-3.5 w-3.5" />
                {isOverdue ? "Overdue: " : "Due: "}
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {task.status === "in_progress" && (
        <div className="mt-4">
          <SubmitWidget taskId={task.id} onDone={onSubmitted} />
        </div>
      )}

      {task.status === "done" && task.submissionLink && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#22251B] px-3 py-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[#CAFF33] shrink-0" />
          <span className="text-[#D1FF4D]">Submitted:</span>
          <a href={task.submissionLink} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1 truncate"
          >
            {task.submissionLink} <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      )}
    </div>
  )
}

export function MyTasksClient({ tasks, currentUserId }: { tasks: MyTask[]; currentUserId?: string }) {
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingTask, setEditingTask] = useState<MyTask | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [taskList, setTaskList] = useState(tasks)

  const filtered = taskList.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const todoCount = taskList.filter((t) => t.status === "todo").length
  const inProgressCount = taskList.filter((t) => t.status === "in_progress").length
  const doneCount = taskList.filter((t) => t.status === "done").length

  async function updateTask(id: string, data: Record<string, unknown>) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) throw new Error("Failed to update")
    const updated = await res.json()
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-sm text-zinc-500 mt-1">{taskList.length} task{taskList.length !== 1 ? "s" : ""} assigned to you</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {f === "all" && <ListTodo className="h-4 w-4" />}
            {f === "todo" && <Clock className="h-4 w-4" />}
            {f === "in_progress" && <div className="h-2 w-2 rounded-full bg-amber-500" />}
            {f === "done" && <CheckCircle2 className="h-4 w-4" />}
            {f === "all" ? "All" : STATUS_LABELS[f] || f}
            {f === "todo" && todoCount > 0 && <span className="text-xs opacity-60">({todoCount})</span>}
            {f === "in_progress" && inProgressCount > 0 && <span className="text-xs opacity-60">({inProgressCount})</span>}
            {f === "done" && doneCount > 0 && <span className="text-xs opacity-60">({doneCount})</span>}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-48 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-1.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-4 text-sm text-zinc-500">
            {search ? "No tasks match your search" : filter === "all" ? "No tasks assigned to you yet" : `No ${STATUS_LABELS[filter]?.toLowerCase() || filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-4" key={refreshKey}>
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <TaskCard
                task={task}
                onSubmitted={() => setRefreshKey((k) => k + 1)}
                onClick={() => { setEditingTask(task); setDialogOpen(true) }}
              />
            </motion.div>
          ))}
        </div>
      )}

      {dialogOpen && editingTask && (
        <TaskDialog
          task={editingTask as unknown as Task}
          column="todo"
          users={[]}
          currentUserId={currentUserId}
          onSave={async (title, data) => {
            await updateTask(editingTask.id, { ...data, title } as Record<string, unknown>)
            setDialogOpen(false)
            setEditingTask(null)
            setRefreshKey((k) => k + 1)
          }}
          onDelete={async (id) => {
            const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
            if (res.ok) {
              setTaskList((prev) => prev.filter((t) => t.id !== id))
            }
            setDialogOpen(false)
            setEditingTask(null)
          }}
          onClose={() => {
            setDialogOpen(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
