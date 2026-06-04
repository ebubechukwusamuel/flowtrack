"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function InviteCodeEntry() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    router.push(`/join?token=${code.trim()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
        FT
      </div>

      <h1 className="text-xl font-bold tracking-tight">Enter Invite Code</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Paste the invite code you received in the email
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError("") }}
          placeholder="Paste invite code"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-center font-mono outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={!code.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Join workspace
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  )
}
