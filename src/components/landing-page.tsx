"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { staggerContainer, staggerItem, fadeInUp, springGentle } from "@/lib/hooks/use-animation"
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Users,
  Kanban,
  Zap,
  Lock,
  ChevronRight,
  Activity,
  Plus,
  HelpCircle,
  Play,
  Check,
  Star,
  Layers,
  Calendar,
  MousePointerClick
} from "lucide-react"

// Define features corresponding to the "Our Products" section
const coreProducts = [
  {
    title: "Interactive Kanban",
    description: "Drag-and-drop task tracking across fully customizable workflows. Optimize your team’s delivery speed instantly.",
    link: "/register",
    badge: "Most Popular",
    icon: Kanban,
  },
  {
    title: "Team Synchronization",
    description: "Assign responsibilities, monitor workloads in real-time, and align efforts. Automatic email delivery via built-in SMTP engine.",
    link: "/register",
    badge: "Real-time",
    icon: Users,
  },
  {
    title: "Actionable Analytics",
    description: "Graph task velocity, burndown rate, and workload balance across multiple projects. Keep stakeholders informed.",
    link: "/register",
    badge: "Advanced",
    icon: TrendingUp,
  }
]

// FAQ Items
const faqs = [
  {
    q: "How does FlowTrack organize workspace collaboration?",
    a: "FlowTrack uses a hierarchy of Organizations, Projects, and Kanban-style Tasks. Admins can create workspaces, invite members via automated emails, assign specific roles, and assign tasks with due dates and urgency levels."
  },
  {
    q: "What happens if email delivery is not configured?",
    a: "FlowTrack includes a graceful fallback flow. If your SMTP is unconfigured, the system generates a secure invite code on the spot, allowing administrators to manually share the code with team members."
  },
  {
    q: "How do members accept team invitations?",
    a: "Members simply click the invitation link in their email or visit the accept-invite route. They paste the generated token, input their name and password, and instantly join the organization with their designated role."
  },
  {
    q: "Can I track my own assigned tasks?",
    a: "Yes. FlowTrack features a dedicated 'My Tasks' portal for members. It filters out everything else to let you focus on what you need to deliver. You can change task statuses and paste direct deliverable links to submit your work."
  },
  {
    q: "How can admins review submitted task deliverables?",
    a: "FlowTrack has an exclusive 'Submissions' dashboard for team admins. Here, you can view all completed tasks, see who submitted them, read timestamps, and review deliverable URLs to verify task completion before marking them closed."
  }
]

// Testimonials data
const testimonials = [
  {
    quote: "FlowTrack completely restructured how our engineering squad ships features. The direct submission logs and automated invite fallback saved us hours of onboarding confusion.",
    author: "Alexander Mercer",
    role: "Lead Platform Engineer, VoxelHQ",
    stars: 5,
  },
  {
    quote: "The interface is blisteringly fast and the dark theme is incredibly comfortable for late-night pushes. The project workload tracking has made sprint planning remarkably precise.",
    author: "Sophia Martinez",
    role: "VP of Product, CloudBurst",
    stars: 5,
  },
  {
    quote: "FlowTrack brings together the visual clarity of a board with rich task checklists, due dates, and seamless member onboarding. It is the central nervous system of our operations.",
    author: "Marcus Chen",
    role: "Co-Founder, Synthetix AI",
    stars: 5,
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeUseCase, setActiveUseCase] = useState<"admin" | "member">("admin")
  const [activeFeatureTab, setActiveFeatureTab] = useState<"boards" | "invites" | "sync">("boards")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1A1A] font-lexend text-white overflow-x-hidden relative selection:bg-[#CAFF33] selection:text-[#1A1A1A]">
      
      {/* 1. HEADER / NAVIGATION BAR */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#1A1A1A]/85 backdrop-blur-md border-b border-[#262626] transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 h-[80px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#1C1C1C] to-[#262626] border border-[#262626] rounded-xl flex items-center justify-center transition-all group-hover:border-[#CAFF33]/30">
              <span className="text-[#CAFF33] font-bold text-lg">FT</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#CAFF33]">
              FlowTrack
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-light text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link href="#use-cases" className="text-sm font-light text-zinc-400 hover:text-white transition-colors">Use Cases</Link>
            <Link href="#faq" className="text-sm font-light text-zinc-400 hover:text-white transition-colors">FAQ</Link>
            <Link href="#testimonials" className="text-sm font-light text-zinc-400 hover:text-white transition-colors">Reviews</Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 text-sm font-light text-zinc-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 rounded-full bg-[#CAFF33] text-[#1C1C1C] text-sm font-medium hover:bg-[#d8ff5c] transition-all hover:shadow-[0_0_20px_rgba(202,255,51,0.25)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-[#1C1C1C] border-b border-[#262626] px-6 py-6 absolute top-[80px] inset-x-0 space-y-4 flex flex-col z-50"
            >
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="#features" 
                className="text-base font-light text-zinc-400 hover:text-white py-1"
              >
                Features
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="#use-cases" 
                className="text-base font-light text-zinc-400 hover:text-white py-1"
              >
                Use Cases
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="#faq" 
                className="text-base font-light text-zinc-400 hover:text-white py-1"
              >
                FAQ
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="#testimonials" 
                className="text-base font-light text-zinc-400 hover:text-white py-1"
              >
                Reviews
              </Link>
              <div className="h-px bg-[#262626] my-2" />
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="/login" 
                className="text-center py-2.5 font-light text-zinc-300 hover:text-white"
              >
                Log In
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)} 
                href="/register" 
                className="w-full text-center py-3 rounded-xl bg-[#CAFF33] text-[#1C1C1C] font-semibold hover:bg-[#d8ff5c] transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. FIGMA-PERFECT HERO SECTION */}
      <section className="relative w-full min-h-[920px] pt-[160px] pb-[80px] px-6 md:px-12 lg:px-24 flex items-center justify-center overflow-hidden">
        
        {/* Abstract design vector glows (from Figma Spec) */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          {/* Vector 1 (Top Right Glow) */}
          <div 
            className="absolute w-[450px] h-[400px] right-[5%] top-[10%] mix-blend-screen animate-pulse-glow"
            style={{
              background: "linear-gradient(210deg, #CAFF33 10.87%, rgba(25, 25, 25, 0) 98.77%)",
              filter: "blur(60px)",
              borderRadius: "50%"
            }}
          />
          {/* Vector 2 (Center Left Glow) */}
          <div 
            className="absolute w-[350px] h-[350px] left-[10%] bottom-[20%] mix-blend-screen"
            style={{
              background: "linear-gradient(210deg, #CAFF33 10.87%, rgba(25, 25, 25, 0) 98.77%)",
              filter: "blur(50px)",
              borderRadius: "50%"
            }}
          />
          {/* Vector 3 (Bottom Right Glow) */}
          <div 
            className="absolute w-[250px] h-[250px] right-[20%] bottom-[5%] mix-blend-screen animate-pulse-glow"
            style={{
              background: "linear-gradient(210deg, #CAFF33 10.87%, rgba(25, 25, 25, 0) 98.77%)",
              filter: "blur(40px)",
              borderRadius: "50%"
            }}
          />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative z-10 items-center">
          
          {/* Left Text Panel (Figma width: 825.98px) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.15 },
              },
            }}
            className="lg:col-span-7 space-y-[40px] flex flex-col items-start"
          >
            
            {/* Header Badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#262626] border border-[#333333] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#CAFF33] animate-pulse shrink-0" />
              <span className="text-sm font-light text-white tracking-wide">
                ✓ Active Task Management Enabled
              </span>
            </motion.div>

            {/* Typography Heading & Subtext */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="space-y-[16px] w-full"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.2] text-white tracking-tight">
                Empowering Your Team’s <br />
                <span className="text-[#CAFF33] font-semibold relative">
                  Project Journey
                </span>
              </h1>
              <p className="max-w-[620px] text-lg font-light text-zinc-300 leading-relaxed pt-2">
                Streamline tasks, collaborate in real-time, and drive productivity with a customizable workspace designed for high-performance teams.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link 
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4.5 rounded-full bg-[#CAFF33] text-[#1C1C1C] text-lg font-medium hover:bg-[#d8ff5c] hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-[0_0_30px_rgba(202,255,51,0.3)] shrink-0"
              >
                Open Workspace <ArrowRight className="h-5 w-5 shrink-0 text-[#1C1C1C]" />
              </Link>
              <Link 
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4.5 rounded-full border border-[#262626] bg-[#1C1C1C]/50 hover:bg-[#262626]/50 text-white text-lg font-light hover:border-zinc-700 active:scale-[0.98] transition-all"
              >
                Learn More
              </Link>
            </motion.div>

          </motion.div>

          {/* Right High-Fidelity Mockup Panel (Figma width: 515.02px, height: 624.48px) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center relative select-none"
          >
            
            {/* Absolute Glowing Backdrop behind Widget */}
            <div className="absolute w-[120%] h-[120%] bg-radial from-[#CAFF33]/8 via-transparent to-transparent pointer-events-none rounded-full blur-[40px] -z-10" />

            {/* Figma-Perfect Dashboard Card container */}
            <div className="relative w-full max-w-[480px] xl:max-w-[515px] bg-[#1A1A1A] border border-[#262626] rounded-2xl p-[30px] xl:p-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
              
              {/* Dynamic noise/texture layout effect (represented as visual background layers) */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              {/* Card Section 1: Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 z-10 relative"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base xl:text-lg font-medium text-white tracking-tight">
                    Active Tasks Stack
                  </h3>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Card Section 2: Task Stack with Decreasing Opacities (Figma Code Specs) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 pt-2"
                >
                  
                  {/* Opaque Task Item 1 (opacity: 1) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 15 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex justify-between items-center p-3.5 xl:p-4 bg-[#1C1C1C] border border-[#262626] rounded-xl hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#CAFF33] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-[#1C1C1C]" />
                      </div>
                      <div>
                        <p className="text-sm font-normal text-white">Figma UI Redesign</p>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Assigned to: Ebube</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[11px] font-semibold text-[#CAFF33] px-2 py-0.5 rounded-full bg-[#CAFF33]/10">
                        High
                      </span>
                      <p className="text-[10px] text-zinc-500 font-light mt-1">FT-104</p>
                    </div>
                  </motion.div>

                  {/* Semitransparent Task Item 2 (opacity: 0.5) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 15 },
                      visible: { opacity: 0.5, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex justify-between items-center p-3.5 xl:p-4 bg-[#1C1C1C]/50 border border-[#262626]/50 rounded-xl opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-[#CAFF33]" />
                      </div>
                      <div>
                        <p className="text-sm font-normal text-white">API Gateway Integration</p>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Assigned to: Sarah</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[11px] font-semibold text-red-500 px-2 py-0.5 rounded-full bg-red-500/10">
                        Urgent
                      </span>
                      <p className="text-[10px] text-zinc-500 font-light mt-1">FT-108</p>
                    </div>
                  </motion.div>

                  {/* Faint Task Item 3 (opacity: 0.2) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 15 },
                      visible: { opacity: 0.2, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex justify-between items-center p-3.5 xl:p-4 bg-[#1C1C1C]/20 border border-[#262626]/20 rounded-xl opacity-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#262626]/20 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-normal text-white">Database Compaction</p>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">Assigned to: System</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[11px] font-semibold text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-500/10">
                        Low
                      </span>
                      <p className="text-[10px] text-zinc-500 font-light mt-1">FT-101</p>
                    </div>
                  </motion.div>

                </motion.div>

              </motion.div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* 3. CORE VALUES / PRODUCTS SECTION (Grid of 3) */}
      <section id="features" className="w-full py-[100px] px-6 max-w-[1400px] mx-auto relative z-10 border-t border-[#262626]">
        
        {/* Section Title */}
        <div className="space-y-4 text-center max-w-[700px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white tracking-tight">
            Our Core <span className="text-[#CAFF33]">Products & Values</span>
          </h2>
          <p className="text-base font-light text-zinc-400">
            A carefully curated ecosystem of features engineered to bring visual simplicity and raw computational efficiency to project cycles.
          </p>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreProducts.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 hover:border-[#CAFF33]/30 transition-all hover:-translate-y-1.5 group relative flex flex-col justify-between"
              >
                <div>
                  {/* Badge */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center group-hover:bg-[#CAFF33] group-hover:text-[#1C1C1C] transition-colors text-[#CAFF33]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-normal uppercase tracking-wider text-[#CAFF33] bg-[#CAFF33]/5 border border-[#CAFF33]/15 px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  </div>

                  {/* Heading & Text */}
                  <h3 className="text-xl font-medium text-white mb-3 tracking-tight group-hover:text-[#CAFF33] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm font-light text-zinc-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-8">
                  <Link 
                    href={p.link}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-[#CAFF33] transition-colors"
                  >
                    Activate Product <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

      </section>

      {/* 4. USE CASES SECTION (Tabbed Interactivity) */}
      <section id="use-cases" className="w-full py-[100px] bg-[#1C1C1C]/40 border-y border-[#262626] relative z-10 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left panel: Info & Tab controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-[40px]"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white tracking-tight">
                Use Cases for <br />
                <span className="text-[#CAFF33]">Every Team Workflow</span>
              </h2>
              <p className="text-base font-light text-zinc-400 leading-relaxed">
                Whether you are managing complex deliverables as an administrator or hitting checkpoints as a product assignee, we adapt to you.
              </p>
            </div>

            {/* Custom Tab buttons */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#1C1C1C] border border-[#262626] p-2 rounded-2xl">
              <button 
                onClick={() => setActiveUseCase("admin")}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-medium transition-all ${
                  activeUseCase === "admin" 
                    ? "bg-[#CAFF33] text-[#1C1C1C]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                For Project Admins
              </button>
              <button 
                onClick={() => setActiveUseCase("member")}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-medium transition-all ${
                  activeUseCase === "member" 
                    ? "bg-[#CAFF33] text-[#1C1C1C]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <MousePointerClick className="h-4 w-4 shrink-0" />
                For Team Members
              </button>
            </div>
          </motion.div>
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeUseCase === "admin" ? (
                <motion.div 
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-6.5 space-y-6">
                    <div>
                      <span className="text-[#CAFF33] text-5xl font-semibold tracking-tight">78%</span>
                      <p className="text-base font-medium text-white mt-2">Reduction in Time-to-Onboard</p>
                      <p className="text-sm font-light text-zinc-400 mt-2 leading-relaxed">
                        Automatic email fallback and shareable codes streamline inviting entire teams, even without direct mail infrastructure.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-6.5 space-y-6">
                    <div>
                      <span className="text-[#CAFF33] text-5xl font-semibold tracking-tight">91%</span>
                      <p className="text-base font-medium text-white mt-2">Submission Transparency</p>
                      <p className="text-sm font-light text-zinc-400 mt-2 leading-relaxed">
                        Review work URLs immediately, check completion times, and trace deliverables without messaging back-and-forth.
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-[#22251B] border border-[#2d3224] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-[#D1FF4D]">Auto-sync team contacts to your local database</p>
                      <p className="text-xs text-zinc-400 font-light mt-1">Every invited member is automatically saved to your contact list.</p>
                    </div>
                    <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D1FF4D] shrink-0 bg-[#1A1A1A]/40 px-4.5 py-2.5 rounded-full border border-[#2d3224] hover:bg-[#1A1A1A] transition-colors">
                      Try Admin Console <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="member"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-6.5 space-y-6">
                    <div>
                      <span className="text-[#CAFF33] text-5xl font-semibold tracking-tight">63%</span>
                      <p className="text-base font-medium text-white mt-2">Increase in Focus Rate</p>
                      <p className="text-sm font-light text-zinc-400 mt-2 leading-relaxed">
                        A clean, isolated task portal hides workspace clutter to only show what is assigned to you, along with strict priority markers.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-6.5 space-y-6">
                    <div>
                      <span className="text-[#CAFF33] text-5xl font-semibold tracking-tight">100%</span>
                      <p className="text-base font-medium text-white mt-2">Zero-Friction Submissions</p>
                      <p className="text-sm font-light text-zinc-400 mt-2 leading-relaxed">
                        Paste links directly into your 'My Tasks' page to finalize your tickets. No emails or attachments required.
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-[#22251B] border border-[#2d3224] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-[#D1FF4D]">Get due-date calendars and clear priority alerts</p>
                      <p className="text-xs text-zinc-400 font-light mt-1">Easily trace what is overdue or urgent to budget your sprints.</p>
                    </div>
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D1FF4D] shrink-0 bg-[#1A1A1A]/40 px-4.5 py-2.5 rounded-full border border-[#2d3224] hover:bg-[#1A1A1A] transition-colors">
                      Access Member Portal <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 5. DETAILED FEATURES TAB GRID */}
      <section id="features" className="w-full py-[100px] px-6 max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-[30px] lg:sticky lg:top-[120px]"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white tracking-tight">
                Packed with <br />
                <span className="text-[#CAFF33]">Engineered Details</span>
              </h2>
              <p className="text-sm font-light text-zinc-400">
                Experience high-performance project planning. Toggle the tabs below to explore the visual modules built directly into the core application.
              </p>
            </div>

            {/* Selection Column */}
            <div className="flex flex-col gap-2 bg-[#1C1C1C] border border-[#262626] p-2.5 rounded-2xl">
              <button 
                onClick={() => setActiveFeatureTab("boards")}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                  activeFeatureTab === "boards" 
                    ? "bg-[#CAFF33] text-[#1C1C1C] font-semibold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                }`}
              >
                <span>Fluid Kanban Boards</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setActiveFeatureTab("invites")}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                  activeFeatureTab === "invites" 
                    ? "bg-[#CAFF33] text-[#1C1C1C] font-semibold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                }`}
              >
                <span>Fallback Workspace Invites</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setActiveFeatureTab("sync")}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                  activeFeatureTab === "sync" 
                    ? "bg-[#CAFF33] text-[#1C1C1C] font-semibold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                }`}
              >
                <span>Contact Auto-Sync</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Right showcase grid */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeFeatureTab === "boards" && (
                <motion.div 
                  key="boards"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Interactive Sprints</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Drag task blocks smoothly between To Do, In Progress, and Done. The UI instantly updates task statuses in the SQL db.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Dynamic Deadlines</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Pick due dates for task items in the custom creation modal. Tasks automatically display bright overdue status badges when late.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Task Priorities</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Mark tasks as low, medium, high, or urgent. High priority items light up with distinct alerts to draw immediate member attention.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Granular Assigning</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Select specific team assignees from your workspace pool to pin accountability to tickets.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeFeatureTab === "invites" && (
                <motion.div 
                  key="invites"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Robust Fallback Flow</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      If external mail APIs fail or remain unconfigured in settings, FlowTrack creates the invite code instantly in the client panel.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Secure Invite Tokens</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Each invite is registered with a cryptographically secure token, valid for 7 days, and matching only the target invitee email.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <MousePointerClick className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Invite Entry widget</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Landing on accept-invite without a token presents a beautiful widget prompting manual entry to redirect to sign up.
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">One-click Accepting</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Invited users clicking the email link have their token pre-filled, letting them complete registration in under 10 seconds.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeFeatureTab === "sync" && (
                <motion.div 
                  key="sync"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-[#1C1C1C] border border-[#262626] rounded-2xl p-8 space-y-4 col-span-1 md:col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#CAFF33]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Local Contact Database</h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      Every invited team member and new registration is automatically stored in your local contacts table — no external API needed, no rate limits, full control.
                    </p>
                    <div className="pt-2 text-xs font-mono text-[#D1FF4D] bg-[#22251B] p-4 rounded-xl border border-[#2d3224] overflow-x-auto">
                      {`// Contacts saved locally in your database\nawait prisma.emailContact.create({\n  data: { email, name, organizationId }\n});`}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION (Interactive Accordions) */}
      <section id="faq" className="w-full py-[100px] px-6 max-w-[1000px] mx-auto relative z-10 border-t border-[#262626]">
        
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-4 text-center max-w-[600px] mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white tracking-tight">
            Frequently Asked <span className="text-[#CAFF33]">Questions</span>
          </h2>
          <p className="text-base font-light text-zinc-400">
            Got questions about invites, databases, or task submissions? We have answers.
          </p>
        </motion.div>

        {/* Accordions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="space-y-4"
        >
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div 
                key={idx}
                className="bg-[#1C1C1C] border border-[#262626] rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5.5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="text-base md:text-lg font-medium text-white group-hover:text-[#CAFF33] transition-colors pr-4">
                    {item.q}
                  </span>
                  <div className={`p-1.5 rounded-full border border-[#262626] bg-[#1A1A1A] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 border-[#CAFF33]/20" : ""}`}>
                    <ChevronDown className={`h-4.5 w-4.5 text-zinc-400 group-hover:text-[#CAFF33] transition-colors`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm font-light text-zinc-400 leading-relaxed border-t border-[#262626]/30">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>

      </section>

      {/* 7. TESTIMONIALS (Slider layout) */}
      <section id="testimonials" className="w-full py-[100px] bg-[#1C1C1C]/20 border-t border-[#262626] px-6">
        <div className="max-w-[900px] mx-auto space-y-10 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-2"
          >
            <span className="text-[#CAFF33] text-xs font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-semibold leading-tight text-white tracking-tight">
              Trusted by Product Teams
            </h2>
          </motion.div>

          {/* Testimonial Card */}
          <div className="relative min-h-[220px] flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1">
                  {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#CAFF33] text-[#CAFF33] stroke-[1.5]" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-lg md:text-xl lg:text-2xl font-light text-zinc-100 leading-relaxed italic max-w-[800px] mx-auto">
                  “{testimonials[currentTestimonial].quote}”
                </p>
                {/* Author */}
                <div className="pt-2">
                  <p className="text-base font-medium text-white">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-xs text-zinc-500 font-light mt-0.5">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center gap-2.5 pt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentTestimonial === i 
                    ? "bg-[#CAFF33] w-6" 
                    : "bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 8. CALL TO ACTION (CTA) BANNER */}
      <section className="w-full py-[80px] px-6 max-w-[1400px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl border border-[#262626] bg-[#1C1C1C] overflow-hidden p-8 md:p-16 text-center shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
        >
          
          {/* Abstract glows behind CTA */}
          <div className="absolute inset-0 pointer-events-none opacity-20 -z-10">
            <div 
              className="absolute w-[350px] h-[350px] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              style={{
                background: "radial-gradient(circle, #CAFF33 0%, rgba(25, 25, 25, 0) 70%)",
                filter: "blur(40px)"
              }}
            />
          </div>

          <div className="max-w-[750px] mx-auto space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-[44px] font-semibold leading-[1.2] text-white tracking-tight">
                Start Your Project Management <br />
                Journey with <span className="text-[#CAFF33] font-semibold">FlowTrack</span> Today
              </h2>
              <p className="text-base font-light text-zinc-400 max-w-[550px] mx-auto">
                Invite your team, distribute checklist items, set priority levels, and review deliverable links all within a single high-performance dashboard.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link 
                href="/register" 
                className="px-8 py-4.5 rounded-full bg-[#CAFF33] text-[#1C1C1C] text-lg font-medium hover:bg-[#d8ff5c] hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-[0_0_25px_rgba(202,255,51,0.3)]"
              >
                Register Free Workspace
              </Link>
            </div>
          </div>

        </motion.div>
      </section>
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full bg-[#151515] border-t border-[#262626] py-16 px-6 relative z-10"
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-[#262626]/60 pb-12 mb-12">
          
          {/* Logo & description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] bg-[#1C1C1C] border border-[#262626] rounded-xl flex items-center justify-center">
                <span className="text-[#CAFF33] font-bold text-sm">FT</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">FlowTrack</span>
            </div>
            <p className="text-xs font-light text-zinc-500 leading-relaxed">
              A state-of-the-art project management workspace designed to give solo freelancers and growing teams absolute focus, speed, and delivery sync.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wide">Product</h4>
            <ul className="space-y-2.5 text-xs font-light text-zinc-500">
              <li><Link href="#features" className="hover:text-[#CAFF33] transition-colors">Fluid Kanban Boards</Link></li>
              <li><Link href="#use-cases" className="hover:text-[#CAFF33] transition-colors">Team Synchronization</Link></li>
              <li><Link href="/register" className="hover:text-[#CAFF33] transition-colors">Workload Analytics</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wide">Enterprise</h4>
            <ul className="space-y-2.5 text-xs font-light text-zinc-500">
              <li><Link href="/login" className="hover:text-[#CAFF33] transition-colors">Secure Sign In</Link></li>
              <li><Link href="/register" className="hover:text-[#CAFF33] transition-colors">Team Management</Link></li>
              <li><Link href="/join" className="hover:text-[#CAFF33] transition-colors">Invite Code Entry</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wide">Legal & Sync</h4>
            <ul className="space-y-2.5 text-xs font-light text-zinc-500">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li className="text-[#CAFF33]/60 flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CAFF33] animate-ping" />
                Email Engine Active
              </li>
            </ul>
          </div>

        </div>

        {/* Sub-footer copyright */}
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-zinc-600">
          <p>© 2026 FlowTrack Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#CAFF33] cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-[#CAFF33] cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-[#CAFF33] cursor-pointer transition-colors">Discord</span>
          </div>
        </div>

      </motion.footer>    </div>
  )
}
