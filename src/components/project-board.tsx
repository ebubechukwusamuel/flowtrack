"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, ExternalLink, CheckCircle2, Send, Link2, UserCircle, Calendar, AlertCircle, ArrowUp, ArrowDown } from "lucide-react"
import { TaskDialog } from "./task-dialog"
import type { Task, Project, User } from "@/types"

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

const PRIORITY_ICONS: Record<string, { icon: typeof ArrowDown; color: string }> = {
  low: { icon: ArrowDown, color: "text-blue-500" },
  medium: { icon: AlertCircle, color: "text-amber-500" },
  high: { icon: ArrowUp, color: "text-orange-500" },
  urgent: { icon: AlertCircle, color: "text-red-500" },
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export function ProjectBoard({ project, users, currentUserId, isAdmin: _isAdmin }: { project: Project; users: User[]; currentUserId?: string; isAdmin?: boolean }) {
  const searchParams = useSearchParams()
  const isMemberView = searchParams.get("view") === "member"
  const isAdmin = (_isAdmin || false) && !isMemberView
  const [tasks, setTasks] = useState(project.tasks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [submitLinks, setSubmitLinks] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  async function updateTask(id: string, data: Partial<Task>) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update" }))
      throw new Error(err.error || "Failed to update")
    }
    const updated = await res.json()
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function handleCreateTask(title: string, status: string, data?: Partial<Task>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status, projectId: project.id, description: data?.description, priority: data?.priority, assigneeId: (data as Record<string, unknown>)?.assigneeId, dueDate: data?.dueDate }),
    })
    if (res.ok) {
      const task = await res.json()
      setTasks((prev) => [...prev, task])
    }
  }

  async function handleDeliver(taskId: string) {
    const link = submitLinks[taskId]
    if (!link?.trim()) return
    setSubmitError("")
    try {
      await updateTask(taskId, { submissionLink: link.trim(), status: "done" } as Partial<Task>)
      setSubmitLinks((prev) => ({ ...prev, [taskId]: "" }))
    } catch (e) {
      setSubmitError((e as Error).message)
    }
  }

  async function handleDeleteSubmission(taskId: string) {
    if (!confirm("Remove your submission and reopen this task?")) return
    try {
      await updateTask(taskId, { submissionLink: null, status: "in_progress" } as Partial<Task>)
    } catch {}
  }

  const myTasks = tasks.filter((t) => t.assignee?.id === currentUserId)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditingTask(null); setDialogOpen(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isAdmin ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Task</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Assignee</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Due Date</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Submission</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">
                      No tasks yet. {isAdmin && "Create your first task."}
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setEditingTask(task); setDialogOpen(true) }}
                          className="font-medium text-left hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{task.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                            {(task.assignee?.name || task.assignee?.email || "U")[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {task.assignee?.name || task.assignee?.email || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.dueDate ? (
                          <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "done" ? "text-red-500 font-medium" : "text-zinc-500"}`}>
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                        {task.status === "in_progress" && task.assignee?.id === currentUserId && (
                          <span className="ml-1.5 text-xs text-amber-500">(viewing)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.submissionLink ? (
                          <a href={task.submissionLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingTask(task); setDialogOpen(true) }}
                          className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {myTasks.length === 0 ? (
              <div className="text-center py-16">
                <UserCircle className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-4 text-sm text-zinc-500">No tasks assigned to you yet.</p>
              </div>
            ) : (
              myTasks.map((task) => {
                const PriorityIcon = PRIORITY_ICONS[task.priority]?.icon || AlertCircle
                const priorityColor = PRIORITY_ICONS[task.priority]?.color || "text-zinc-500"
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"
                return (
                  <div key={task.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              if (task.status === "todo") {
                                updateTask(task.id, { status: "in_progress" } as Partial<Task>)
                              }
                            }}
                            className="font-medium text-left hover:text-zinc-600 dark:hover:text-zinc-300"
                          >
                            {task.title}
                          </button>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
                            {STATUS_LABELS[task.status] || task.status}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-1.5 text-sm text-zinc-500">{task.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
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
                      <div className="mt-4 flex gap-2">
                        <div className="flex-1 relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            value={submitLinks[task.id] || ""}
                            onChange={(e) => setSubmitLinks((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Paste your deliverable link..."
                            className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
                          />
                        </div>
                        <button
                          onClick={() => handleDeliver(task.id)}
                          disabled={!submitLinks[task.id]?.trim()}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] hover:bg-[#d8ff5c] disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" /> Submit
                        </button>
                      </div>
                    )}

                    {submitError && (
                      <p className="mt-2 text-sm text-red-500">{submitError}</p>
                    )}

                    {task.status === "done" && task.submissionLink && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#22251B] px-3 py-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#CAFF33] shrink-0" />
                        <span className="text-[#D1FF4D]">Submitted:</span>
                        <a href={task.submissionLink} target="_blank" rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1 truncate flex-1 min-w-0"
                        >
                          {task.submissionLink} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        <button
                          onClick={() => handleDeleteSubmission(task.id)}
                          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {dialogOpen && (
        <TaskDialog
          task={editingTask}
          column="todo"
          users={users}
          currentUserId={currentUserId}
          onSave={async (title, data) => {
            if (editingTask) {
              await updateTask(editingTask.id, data as Partial<Task>)
            } else {
              await handleCreateTask(title, "todo", data as Partial<Task>)
            }
            setDialogOpen(false)
            setEditingTask(null)
          }}
          onDelete={async (id) => {
            const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
            if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id))
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