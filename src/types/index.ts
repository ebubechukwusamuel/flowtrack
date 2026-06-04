export interface User {
  id: string
  name: string | null
  email: string | null
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  order: number
  dueDate: string | null
  submissionLink: string | null
  createdAt: string
  updatedAt: string
  assignee: User | null
}

export interface ProjectSummary {
  id: string
  name: string
  description: string
  color: string
  ownerId: string
  updatedAt: string
  _count: { tasks: number }
}

export interface Project extends Omit<ProjectSummary, "_count" | "updatedAt"> {
  tasks: Task[]
}

export interface OrgMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    jobTitle: string | null
  }
}

export interface Activity {
  id: string
  action: string
  details: string
  createdAt: string
  user: {
    name: string | null
    email: string | null
  }
  project?: { name: string } | null
  task?: { title: string } | null
}

export interface ProfileUser {
  id: string
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  bio: string | null | undefined
  jobTitle: string | null | undefined
  timezone: string | null | undefined
  notifyOnAssign: boolean | null | undefined
  createdAt: string
}
