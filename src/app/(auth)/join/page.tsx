"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { UserPlus, KeyRound, ArrowRight, Building2 } from "lucide-react"

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get("token") || ""

  const [inviteToken, setInviteToken] = useState(tokenFromUrl)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<"code" | "register">(tokenFromUrl ? "register" : "code")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, token: inviteToken.trim() }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div className="w-full max-w-sm space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#CAFF33] text-xl font-bold text-[#1C1C1C]">
          FT
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "code" ? "Join your team" : "Create your account"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {step === "code" ? "Enter your invite code to get started" : "Set up your account to join the workspace"}
        </p>
      </motion.div>

      {step === "code" ? (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={(e) => { e.preventDefault(); if (inviteToken.trim()) setStep("register") }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 text-center">
              Paste the invite code from your email invitation
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Invite Code</label>
            <input
              type="text"
              required
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-[#CAFF33] focus:ring-1 focus:ring-[#CAFF33] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Paste your invite code"
            />
          </div>

          <button
            type="submit"
            disabled={!inviteToken.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] transition-colors hover:bg-[#d8ff5c] disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            Continue
          </button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an invite code?{" "}
            <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
              Create a company
            </Link>
          </p>
        </motion.form>
      ) : (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} className="space-y-4"
        >
          <div className="flex items-center gap-2 rounded-lg border border-[#CAFF33]/20 bg-[#CAFF33]/5 px-3 py-2 text-sm text-[#CAFF33]">
            <KeyRound className="h-4 w-4 shrink-0" />
            <span>Joining with invite code</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="join-name" className="text-sm font-medium">Your Name</label>
            <input
              id="join-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#CAFF33] focus:ring-1 focus:ring-[#CAFF33] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="join-email" className="text-sm font-medium">Your Email</label>
            <input
              id="join-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#CAFF33] focus:ring-1 focus:ring-[#CAFF33] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="you@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="join-password" className="text-sm font-medium">Password</label>
            <input
              id="join-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#CAFF33] focus:ring-1 focus:ring-[#CAFF33] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#CAFF33] px-4 py-2 text-sm font-medium text-[#1C1C1C] transition-colors hover:bg-[#d8ff5c] disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Creating..." : "Join team"}
          </button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
              Sign in
            </Link>
          </p>
        </motion.form>
      )}
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  )
}
