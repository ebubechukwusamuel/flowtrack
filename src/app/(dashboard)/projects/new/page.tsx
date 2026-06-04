import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getOrCreateOrg } from "@/lib/org"
import { NewProjectForm } from "./form"

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await getOrCreateOrg(session.user.id, session.user.name, session.user.email)
  if (membership.role !== "admin") redirect("/projects")

  return <NewProjectForm />
}
