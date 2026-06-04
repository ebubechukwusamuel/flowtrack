"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, Save, Briefcase, Mail, Server, Send, CheckCircle, XCircle } from "lucide-react"

export function SettingsClient({
  orgName,
  smtpConfig: initialSmtp,
}: {
  orgName: string
  smtpConfig?: { host: string; port: number; user: string; passSet: boolean }
}) {
  const [orgNameInput, setOrgNameInput] = useState(orgName)
  const [savingOrg, setSavingOrg] = useState(false)
  const [orgSaved, setOrgSaved] = useState(false)

  const [smtpHost, setSmtpHost] = useState(initialSmtp?.host || "")
  const [smtpPort, setSmtpPort] = useState(String(initialSmtp?.port || "587"))
  const [smtpUser, setSmtpUser] = useState(initialSmtp?.user || "")
  const [smtpPass, setSmtpPass] = useState("")
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [smtpSaved, setSmtpSaved] = useState(false)
  const [smtpError, setSmtpError] = useState("")

  const [emailStats, setEmailStats] = useState({ sent: 0, failed: 0, pending: 0, contacts: 0 })
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    setLoadingLogs(true)
    Promise.all([
      fetch("/api/email/stats").then((r) => r.json()),
      fetch("/api/email/logs").then((r) => r.json()),
    ]).then(([stats, logsData]) => {
      setEmailStats(stats)
      setEmailLogs(logsData.logs || [])
    }).finally(() => setLoadingLogs(false))
  }, [])

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!orgNameInput.trim()) return
    setSavingOrg(true)
    const res = await fetch("/api/org/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgNameInput.trim() }),
    })
    if (res.ok) {
      setOrgSaved(true)
      setTimeout(() => setOrgSaved(false), 2000)
    }
    setSavingOrg(false)
  }

  async function handleSaveSmtp(e: React.FormEvent) {
    e.preventDefault()
    setSavingSmtp(true)
    setSmtpError("")
    setSmtpSaved(false)
    const res = await fetch("/api/org/smtp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass }),
    })
    if (res.ok) {
      setSmtpSaved(true)
      setTimeout(() => setSmtpSaved(false), 3000)
    } else {
      const data = await res.json()
      setSmtpError(data.error || "Failed to save")
    }
    setSavingSmtp(false)
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#CAFF33]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your workspace configuration</p>
          </div>
        </div>
      </motion.div>

      {/* Organization Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-[#CAFF33]" />
          <h2 className="text-sm font-semibold">Organization</h2>
        </div>
        <form onSubmit={handleSaveOrg} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <input value={orgNameInput} onChange={(e) => setOrgNameInput(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button type="submit" disabled={savingOrg}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Save className="h-4 w-4" />
              {savingOrg ? "Saving..." : "Save"}
            </button>
            {orgSaved && <span className="text-sm text-[#CAFF33]">Saved!</span>}
          </div>
        </form>
      </motion.div>

      {/* SMTP Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-4 w-4 text-[#CAFF33]" />
          <h2 className="text-sm font-semibold">Email Configuration</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Configure SMTP so invitation emails actually reach your team members&apos; inboxes.
          Use Gmail, SendGrid, Mailgun, or any SMTP provider. Without this, emails are logged but not delivered.
        </p>
        <form onSubmit={handleSaveSmtp} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">SMTP Host</label>
              <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="your@email.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={initialSmtp?.passSet ? "Leave blank to keep current" : "Enter password"}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
          {smtpError && <p className="text-sm text-red-500">{smtpError}</p>}
          {smtpSaved && <p className="text-sm text-[#CAFF33]">SMTP settings saved! Emails will now be delivered.</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={savingSmtp}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Server className="h-4 w-4" />
              {savingSmtp ? "Saving..." : "Save SMTP"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Email Logs Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Send className="h-4 w-4 text-[#CAFF33]" />
          <h2 className="text-sm font-semibold">Email History</h2>
        </div>

        {loadingLogs ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Sent</p>
                <p className="text-lg font-semibold text-[#CAFF33]">{emailStats.sent}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Failed</p>
                <p className="text-lg font-semibold text-red-400">{emailStats.failed}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Pending</p>
                <p className="text-lg font-semibold text-yellow-400">{emailStats.pending}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400">Contacts</p>
                <p className="text-lg font-semibold text-white">{emailStats.contacts}</p>
              </div>
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-sm text-zinc-500">No emails sent yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="pb-2 pr-3 font-medium text-zinc-400">To</th>
                      <th className="pb-2 pr-3 font-medium text-zinc-400">Subject</th>
                      <th className="pb-2 pr-3 font-medium text-zinc-400">Status</th>
                      <th className="pb-2 pr-3 font-medium text-zinc-400">Method</th>
                      <th className="pb-2 font-medium text-zinc-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.slice(0, 20).map((log: any) => (
                      <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 pr-3 text-zinc-300">{log.to}</td>
                        <td className="py-2 pr-3 text-zinc-300 max-w-[200px] truncate">{log.subject}</td>
                        <td className="py-2 pr-3">
                          {log.status === "sent" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-[#CAFF33]">
                              <CheckCircle className="h-3 w-3" /> Sent
                            </span>
                          ) : log.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-400" title={log.error || ""}>
                              <XCircle className="h-3 w-3" /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-xs text-zinc-500">{log.method}</td>
                        <td className="py-2 text-xs text-zinc-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
