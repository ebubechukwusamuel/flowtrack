"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, AlertCircle, ArrowUp, ArrowDown } from "lucide-react"
import type { Task } from "@/types"

const priorityIcons = {
  low: ArrowDown,
  medium: AlertCircle,
  high: ArrowUp,
  urgent: AlertCircle,
}

const priorityColors = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-orange-500",
  urgent: "text-red-500",
}

export function TaskCard({
  task,
  isOverlay,
  onEdit,
}: {
  task: Task
  isOverlay?: boolean
  onEdit?: (task: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const PriorityIcon = priorityIcons[task.priority as keyof typeof priorityIcons] || AlertCircle

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 ${isOverlay ? "shadow-xl rotate-3" : ""}`}
      onClick={() => onEdit?.(task)}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <PriorityIcon className={`h-3.5 w-3.5 shrink-0 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
            <h3 className="text-sm font-medium truncate">{task.title}</h3>
          </div>
          {task.description && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.assignee && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                {(task.assignee.name || task.assignee.email || "?")[0].toUpperCase()}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {task.assignee.name || task.assignee.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
