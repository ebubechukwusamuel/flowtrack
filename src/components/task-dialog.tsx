"use client"

import { useState, useEffect } from "react"
import { X, Trash2, CheckCircle2, Link2, Send } from "lucide-react"
import type { Task, User } from "@/types"

export function TaskDialog({
  task,
  column,
  users,
  onSave,
  onDelete,
  onClose,
  currentUserId,
}: {
  task: Task | null
  column: string
  users: User[]
  onSave: (title: string, data: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
  currentUserId?: string
}) {
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [priority, setPriority] = useState(task?.priority ?? "medium")
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? "")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(task?.status ?? column)
  const [submissionLink, setSubmissionLink] = useState(task?.submissionLink ?? "")

  useEffect(() => {
    if (task && currentUserId && task.assignee?.id === currentUserId && task.status === "todo") {
      fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: "in_progress" }),
      }).then((res) => {
        if (res.ok) setStatus("in_progress")
      })
    }
  }, [task?.id, currentUserId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  async function handleDeliver() {
    if (!task) return
    if (!submissionLink.trim()) return
    setSaving(true)
    await onSave(task.title, { status: "done", submissionLink: submissionLink.trim() } as Partial<Task>)
    setStatus("done")
    setSaving(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave(title.trim(), {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: status || task?.status || column,
      assigneeId: assigneeId || undefined,
    } as Partial<Task>)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{task ? "Edit Task" : "New Task"}</h2>
          <div className="flex items-center gap-1">
            {task && (
              <button
                onClick={() => onDelete(task.id)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {task && status === "in_progress" && currentUserId === task.assignee?.id && (
          <div className="mb-4 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Submit your deliverable</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="Paste your link here..."
                  className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
              <button
                type="button"
                onClick={handleDeliver}
                disabled={saving || !submissionLink.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {saving ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : task ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
