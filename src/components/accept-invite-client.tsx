"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, ArrowRight, LogIn } from "lucide-react"

export function AcceptInviteClient({
  token,
  orgName,
  inviterName,
  email,
  isLoggedIn,
  userEmail,
}: {
  token: string
  orgName: string
  inviterName: string
  email: string
  isLoggedIn: boolean
  userEmail: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLoggedIn) {
      setStatus("accepting")
      fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("success")
            setTimeout(() => router.push("/dashboard"), 2000)
          } else {
            setStatus("error")
            setError(data.error || "Failed to accept invite")
          }
        })
        .catch(() => {
          setStatus("error")
          setError("Something went wrong")
        })
    }
  }, [isLoggedIn, token, router])

  const emailMatch = isLoggedIn && userEmail?.toLowerCase() !== email.toLowerCase()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          FT
        </div>

        {!isLoggedIn ? (
          <>
            <h1 className="text-xl font-bold tracking-tight">Join {orgName}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {inviterName} invited you to join <strong>{orgName}</strong> on FlowTrack.
              Sign in or create an account to accept.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <LogIn className="h-4 w-4" />
                Sign in to accept
              </Link>
              <p className="text-xs text-zinc-400">
                Invite sent to <strong>{email}</strong>
              </p>
            </div>
          </>
        ) : emailMatch ? (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-bold tracking-tight">Email mismatch</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This invite was sent to <strong>{email}</strong>, but you're signed in as <strong>{userEmail}</strong>.
              Please sign in with the correct account.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <LogIn className="h-4 w-4" />
                Switch account
              </Link>
            </div>
          </>
        ) : status === "accepting" ? (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
            <h1 className="mt-4 text-xl font-bold tracking-tight">Joining {orgName}...</h1>
            <p className="mt-2 text-sm text-zinc-500">Hang tight while we add you to the workspace</p>
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-xl font-bold tracking-tight">Welcome to {orgName}!</h1>
            <p className="mt-2 text-sm text-zinc-500">Redirecting you to your dashboard...</p>
            <div className="mt-6">
              <ArrowRight className="mx-auto h-5 w-5 text-zinc-400 animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-bold tracking-tight">Couldn't join</h1>
            <p className="mt-2 text-sm text-red-500">{error}</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
