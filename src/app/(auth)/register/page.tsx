"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      setError(error.message || "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/login?registered=true")
  }

  return (
    <div className="w-full max-w-sm space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4 justify-center">
          <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#1C1C1C] to-[#262626] border border-[#262626] rounded-xl flex items-center justify-center transition-all group-hover:border-[#CAFF33]/30">
            <span className="text-[#CAFF33] font-bold text-lg">FT</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#CAFF33]">
            FlowTrack
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create your company</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Set up a new workspace on FlowTrack
        </p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} className="space-y-4"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Company Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Your company or team name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Your Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="At least 6 characters"
          />
        </div>

        <p className="text-xs text-zinc-500 text-center pt-1">
          Email invites work out of the box. Admins can configure custom SMTP in Settings later.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] transition-colors hover:bg-[#d8ff5c] disabled:opacity-50"
        >
          <Building2 className="h-4 w-4" />
          {loading ? "Creating..." : "Create company"}
        </button>
      </motion.form>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-center text-sm text-zinc-500 dark:text-zinc-400"
      >
        Joining an existing team?{" "}
        <Link href="/join" className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
          Enter invite code
        </Link>
      </motion.p>
    </div>
  )
}
