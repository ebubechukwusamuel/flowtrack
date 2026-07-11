import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getOrCreateOrg } from "@/lib/org"
import { ProfileClient } from "@/components/profile-client"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true, jobTitle: true, timezone: true, notifyOnAssign: true, createdAt: true },
  })
  if (!user) redirect("/")

  return <ProfileClient user={{ ...user, name: user.name ?? "", email: user.email ?? "", createdAt: user.createdAt.toISOString() }} />
}
