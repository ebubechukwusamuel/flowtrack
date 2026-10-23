import { redirect } from "next/navigation"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  // Skip Supabase auth initialization only in the isolated Figma preview.
  // This preserves the real landing UI without placing production secrets in Figma.
  if (process.env.FIGMA_PREVIEW !== "1") {
    const { getSession } = await import("@/lib/auth")
    const session = await getSession()
    if (session?.user?.id) redirect("/dashboard")
  }
  return <LandingPage />
}
