import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { SettingsClient } from "@/components/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  if (membership.role !== "admin") redirect("/dashboard")

  const smtpConfig = {
    host: membership.organization.smtpHost || "",
    port: membership.organization.smtpPort || 587,
    user: membership.organization.smtpUser || "",
    passSet: !!membership.organization.smtpPass,
  }

  return (
    <SettingsClient
      orgName={membership.organization.name}
      smtpConfig={smtpConfig}
    />
  )
}
