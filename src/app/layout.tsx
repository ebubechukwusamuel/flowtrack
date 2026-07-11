import type { Metadata } from "next"
import Script from "next/script"
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
  metadataBase: new URL("https://flowstarck.vercel.app"),
  title: "FlowTrack — Project management that flows",
  description:
    "Kanban boards, team collaboration, and analytics — all in one place. Simple enough for solo freelancers, powerful enough for growing teams.",
  openGraph: {
    title: "FlowTrack — Project management that flows",
    description:
      "Kanban boards, team collaboration, and analytics — all in one place. Simple enough for solo freelancers, powerful enough for growing teams.",
    url: "https://flowstarck.vercel.app",
    siteName: "FlowTrack",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1280, height: 720 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowTrack — Project management that flows",
    description:
      "Kanban boards, team collaboration, and analytics — all in one place.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} ${lexend.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 font-body text-zinc-100 antialiased">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `window.__KREDO_PROJECT__="flowtrack";window.__KREDO_TRACKER_URL__="https://kredo-gray.vercel.app/api/track"` }} />
        <Script src="https://kredo-gray.vercel.app/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
