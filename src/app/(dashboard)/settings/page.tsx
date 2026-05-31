import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { SettingsClient } from "@/components/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true, jobTitle: true, timezone: true, notifyOnAssign: true, createdAt: true },
  })

  if (!user) redirect("/login")

  const smtpConfig = {
    host: membership.organization.smtpHost || "",
    port: membership.organization.smtpPort || 587,
    user: membership.organization.smtpUser || "",
    passSet: !!membership.organization.smtpPass,
  }

  return (
    <SettingsClient
      orgName={membership.organization.name}
      orgRole={membership.role}
      smtpConfig={smtpConfig}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        jobTitle: user.jobTitle,
        timezone: user.timezone,
        notifyOnAssign: user.notifyOnAssign,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  )
}
