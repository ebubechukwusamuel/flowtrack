"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Mail, Trash2, Shield, UserCircle, Send, CheckCircle } from "lucide-react"
import type { OrgMember } from "@/types"

export function TeamClient({
  orgName,
  orgRole,
  members,
}: {
  orgName: string
  orgRole: string
  members: (OrgMember & { createdAt: string })[]
}) {
  const isAdmin = orgRole === "admin"
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState("")
  const [memberList, setMemberList] = useState(members)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError("")
    setInviteSuccess("")

    try {
      const res = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        setInviteError(data.error || "Failed to send invite")
      } else {
        setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`)
        setInviteEmail("")
      }
    } catch (e) {
      console.error("[INVITE]", e)
      setInviteError(`Request failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    }
    setInviting(false)
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/org/members/${id}`, { method: "DELETE" })
    if (res.ok) {
      setMemberList((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-[#CAFF33]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{orgName}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{memberList.length} members</p>
          </div>
        </div>
      </motion.div>

      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-sm font-semibold mb-3">Invite Member</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Send an invitation email. They'll receive a link to join your workspace.
          </p>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <button type="submit" disabled={inviting || !inviteEmail.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Send className="h-4 w-4" />
              {inviting ? "Sending..." : "Send Invite"}
            </button>
          </form>
          {inviteError && <p className="mt-2 text-sm text-red-500">{inviteError}</p>}
          {inviteSuccess && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-[#CAFF33]">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {inviteSuccess}
            </div>
          )}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Members</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {memberList.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center dark:bg-zinc-700">
                  <UserCircle className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{member.user.name || member.user.email}</span>
                    {member.role === "admin" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#CAFF33]/10 px-2 py-0.5 text-xs font-medium text-[#CAFF33]">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{member.user.email}</p>
                </div>
              </div>
              {isAdmin && member.role !== "admin" && (
                <button onClick={() => handleRemove(member.id)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
