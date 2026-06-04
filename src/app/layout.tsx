import type { Metadata } from "next"
import { DM_Sans, Bricolage_Grotesque, Lexend } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
})

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "FlowTrack — Project management that flows",
  description:
    "Kanban boards, team collaboration, and analytics — all in one place. Simple enough for solo freelancers, powerful enough for growing teams.",
  openGraph: {
    title: "FlowTrack",
    description: "Project management that flows.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} ${lexend.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 font-body text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
