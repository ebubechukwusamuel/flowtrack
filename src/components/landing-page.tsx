"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { Kanban, Users, BarChart3, CheckSquare, ArrowRight, Menu, X, Sparkles, UserPlus } from "lucide-react"
import dynamic from "next/dynamic"

const ThreeScene = dynamic(() => import("@/components/three-scene"), { ssr: false })

const features = [
  {
    icon: Kanban,
    title: "Kanban Boards",
    description: "Drag-and-drop task management across customizable columns. Visualize your workflow at a glance.",
    gradient: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/10",
  },
  {
    icon: Users,
    title: "Team Sync",
    description: "Assign tasks, track progress, and keep everyone aligned. Real-time collaboration built in.",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track velocity, burndown, and team productivity. Data-driven decisions for better outcomes.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Rich task details with priorities, due dates, and descriptions. Nothing falls through the cracks.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
]

const stats = [
  { label: "Tasks Tracked", numeric: 10, displaySuffix: "K+", suffix: "and counting", decimals: 0 },
  { label: "Active Users", numeric: 500, displaySuffix: "+", suffix: "growing daily", decimals: 0 },
  { label: "Uptime", numeric: 99.9, displaySuffix: "%", suffix: "reliable", decimals: 1 },
  { label: "Avg. Productivity Gain", numeric: 40, displaySuffix: "%", suffix: "reported", decimals: 0 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-display font-bold tracking-tight">FlowTrack</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Features
          </Link>
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        <button
          className="md:hidden rounded-lg p-2 text-zinc-400 hover:text-zinc-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-3 px-6 py-4">
              <Link href="#features" className="block text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
                Features
              </Link>
              <Link href="/login" className="block text-sm text-zinc-400" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function HeroSection() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  return (
    <motion.section style={{ opacity, scale }} className="relative flex min-h-screen items-center justify-center px-6 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300"
        >
          <Sparkles className="h-3 w-3" />
          Manage projects, ship faster
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl font-display font-bold leading-[1.1] tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Project management
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            that flows.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
        >
          Kanban boards, team collaboration, and analytics — all in one place. Simple enough for solo freelancers,
          powerful enough for growing teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-zinc-600 hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <UserPlus className="h-4 w-4" />
            Join a team
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-xs text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free forever plan
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Cancel anytime
          </span>
        </motion.div>
      </div>
    </motion.section>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={index}
      className={`group relative overflow-hidden rounded-2xl border ${feature.border} bg-zinc-900/40 p-6 backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${feature.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 backdrop-blur-sm group-hover:bg-zinc-800 transition-colors">
          <Icon className="h-5 w-5 text-zinc-300" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
      </div>
    </motion.div>
  )
}

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <section id="features" ref={ref} className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div ref={titleRef} className="text-center" variants={fadeUp} initial="hidden" animate={titleInView ? "visible" : "hidden"}>
          <h2 className="text-4xl font-display font-bold tracking-tight sm:text-5xl">
            Everything you need to
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ship faster
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            FlowTrack combines the best of project management into one seamless experience.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function AnimatedCounter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayed, setDisplayed] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1600
          const startTime = performance.now()

          function update(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(target * eased)
            if (progress < 1) requestAnimationFrame(update)
          }

          requestAnimationFrame(update)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, hasAnimated])

  return (
    <span ref={ref} className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
      {displayed.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-display font-bold tracking-tight sm:text-5xl">
                <AnimatedCounter target={stat.numeric} suffix={stat.displaySuffix} decimals={stat.decimals} />
              </div>
              <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              <div className="mt-0.5 text-xs text-zinc-600">{stat.suffix}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 text-center sm:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />

          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Ready to streamline your workflow?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Join hundreds of teams already using FlowTrack to deliver better results.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 px-6 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium">FlowTrack</span>
        </div>
        <p className="text-xs text-zinc-600">
          Built by <span className="text-zinc-400">Ebubechukwu Samuel</span>
        </p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <ThreeScene />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </>
  )
}
