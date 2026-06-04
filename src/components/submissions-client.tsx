"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ExternalLink, Search, FolderKanban, Clock, UserCircle } from "lucide-react"

interface Submission {
  id: string
  title: string
  description: string
  submissionLink: string
  submittedAt: string
  projectId: string
  projectName: string
  projectColor: string
  assignee: { id: string; name: string; email: string } | null
}

function SubmissionCard({ s }: { s: Submission }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-[#CAFF33]/10 flex items-center justify-center text-sm font-bold text-[#CAFF33] shrink-0">
            {(s.assignee?.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{s.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.projectColor }} />
                {s.projectName}
              </div>
            </div>
            {s.description && (
              <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">{s.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
              <span>by <strong className="text-zinc-600 dark:text-zinc-300">{s.assignee?.name || "Unknown"}</strong></span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
        <a
          href={s.submissionLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] hover:bg-[#d8ff5c] shrink-0"
        >
          View <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

export function SubmissionsClient({ submissions }: { submissions: Submission[] }) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? submissions.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.assignee?.name.toLowerCase().includes(search.toLowerCase()) ||
          s.projectName.toLowerCase().includes(search.toLowerCase())
      )
    : submissions

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {submissions.length} submitted task{submissions.length !== 1 ? "s" : ""} from your team
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="w-56 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          {search ? (
            <>
              <Search className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-4 text-sm text-zinc-500">No submissions match your search</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-4 text-sm text-zinc-500">No submissions yet</p>
              <p className="text-xs text-zinc-400 mt-1">Submissions will appear here when team members complete their tasks</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <SubmissionCard s={s} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
