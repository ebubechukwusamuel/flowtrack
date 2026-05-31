"use client"

import { TaskCard } from "./task-card"
import type { Task } from "@/types"

export function SortableTask({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  return <TaskCard task={task} onEdit={onEdit} />
}
