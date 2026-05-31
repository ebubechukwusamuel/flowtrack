"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, UserPlus, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"create" | "join">("create")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteToken, setInviteToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (mode === "join") {
      if (!inviteToken.trim()) {
        setError("Please enter your invite code")
        setLoading(false)
        return
      }
      router.push(`/accept-invite?token=${inviteToken.trim()}`)
      return
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div className="w-full max-w-sm space-y-6 p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "create" ? "Create account" : "Join your team"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {mode === "create" ? "Get started with FlowTrack" : "Enter your invite code to join"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <button
          onClick={() => { setMode("create"); setError("") }}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          New workspace
        </button>
        <button
          onClick={() => { setMode("join"); setError("") }}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "join"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Join a team
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {mode === "join" ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">
                Paste the invite code from your email invitation below.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Code</label>
              <input
                type="text"
                required
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Paste your invite code"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inviteToken.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <UserPlus className="h-4 w-4" />
              Join team
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="you@example.com"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Building2 className="h-4 w-4" />
              {loading ? "Creating..." : "Create workspace"}
            </button>
          </>
        )}
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
          Sign in
        </Link>
      </p>
    </div>
  )
}
