import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const session = await getSession()
  if (session?.user?.id) redirect("/dashboard")
  return <LandingPage />
}
