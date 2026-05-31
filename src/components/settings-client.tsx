"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Settings, Save, User, Briefcase, Globe, Bell, Lock, Camera, Clock, Mail, Server } from "lucide-react"

interface ProfileUser {
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

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "Africa/Lagos", "Africa/Cairo",
]

export function SettingsClient({
  orgName,
  orgRole,
  user,
  smtpConfig: initialSmtp,
}: {
  orgName: string
  orgRole: string
  user: ProfileUser
  smtpConfig?: { host: string; port: number; user: string; passSet: boolean }
}) {
  const isAdmin = orgRole === "admin"

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

  const [name, setName] = useState(user.name || "")
  const [jobTitle, setJobTitle] = useState(user.jobTitle || "")
  const [bio, setBio] = useState(user.bio || "")
  const [timezone, setTimezone] = useState(user.timezone || "UTC")
  const [notifyOnAssign, setNotifyOnAssign] = useState(user.notifyOnAssign ?? true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSaved, setPasswordSaved] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState(user.image || "")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), bio: bio.trim(), jobTitle: jobTitle.trim(), timezone, notifyOnAssign }),
    })
    if (res.ok) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
    setSavingProfile(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError("")
    setPasswordSaved(false)

    if (!currentPassword || !newPassword) { setPasswordError("Fill in all fields"); return }
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters"); return }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return }

    setSavingPassword(true)
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setPasswordSaved(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSaved(false), 2000)
    } else {
      setPasswordError(data.error || "Failed to change password")
    }
    setSavingPassword(false)
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (res.ok) {
        setAvatarUrl(data.url + "?t=" + Date.now())
      }
      setUploadingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your profile and workspace</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden dark:bg-zinc-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-zinc-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 rounded-full bg-zinc-900 p-1.5 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="text-sm font-medium">{user.name || "Add your name"}</p>
            <p className="text-xs text-zinc-400">{user.jobTitle || "Add your job title"}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Designer"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input value={user.email || ""} readOnly
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            />
            <p className="text-xs text-zinc-400">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell the team a bit about yourself..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="h-4 w-4" />
              <span>Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <button type="submit" disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save"}
            </button>
          </div>
          {profileSaved && <p className="text-sm text-emerald-500 text-right">Profile saved!</p>}
        </form>
      </motion.div>

      {/* Preferences Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Preferences</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Timezone
              </div>
            </label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-sm font-medium">Notify me on task assignment</p>
                <p className="text-xs text-zinc-400">Get notified when someone assigns a task to you</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={notifyOnAssign} onChange={(e) => setNotifyOnAssign(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-zinc-900 peer-checked:after:translate-x-full dark:bg-zinc-700 dark:peer-checked:bg-zinc-100"></div>
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save preferences
            </button>
          </div>
        </form>
      </motion.div>

      {/* Password Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSaved && <p className="text-sm text-emerald-500">Password changed!</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Organization Section */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-indigo-500" />
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
              {orgSaved && <span className="text-sm text-emerald-500">Saved!</span>}
            </div>
          </form>
        </motion.div>
      )}

      {/* SMTP Section */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold">Email Configuration</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Configure SMTP so invitation emails actually reach your team members' inboxes.
            Use Gmail, SendGrid, Mailgun, or any SMTP provider. Without this, emails are captured in a test inbox.
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
                <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={initialSmtp?.passSet ? "•••••••• (leave blank to keep)" : "Enter password"}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>
            {smtpError && <p className="text-sm text-red-500">{smtpError}</p>}
            {smtpSaved && <p className="text-sm text-emerald-500">SMTP settings saved! Emails will now be delivered.</p>}
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
      )}
    </div>
  )
}
