import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AcceptInviteClient } from "@/components/accept-invite-client"
import { InviteCodeEntry } from "@/components/invite-code-entry"

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
        <InviteCodeEntry />
      </div>
    )
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } }, invitedBy: { select: { name: true } } },
  })

  if (!invite) return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500">Invalid or expired invite link</p></div>

  if (invite.status !== "pending") {
    if (invite.status === "accepted") return <div className="flex items-center justify-center min-h-screen"><p className="text-zinc-500">You've already accepted this invite</p></div>
    return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500">This invite has expired</p></div>
  }

  if (invite.expiresAt < new Date()) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500">This invite has expired</p></div>
  }

  const session = await getSession()

  return (
    <AcceptInviteClient
      token={token}
      orgName={invite.organization.name}
      inviterName={invite.invitedBy.name || "Someone"}
      email={invite.email}
      isLoggedIn={!!session?.user}
      userEmail={session?.user?.email || ""}
    />
  )
}
