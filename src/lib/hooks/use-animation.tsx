"use client"

import { type Variants, type Transition } from "framer-motion"

export const defaultTransition: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
}

export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

export const springGentle: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
}

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...defaultTransition, delay },
  }),
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...defaultTransition, delay },
  }),
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...defaultTransition, delay },
  }),
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { ...springGentle, delay },
  }),
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

export const staggerItemLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition,
  },
}

export const hoverLift = {
  whileHover: { y: -2, transition: springSnappy },
  whileTap: { y: 0, transition: springSnappy },
}

export const hoverScale = {
  whileHover: { scale: 1.03, transition: springSnappy },
  whileTap: { scale: 0.98, transition: springSnappy },
}

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.15)",
    transition: { duration: 0.2 },
  },
}

export const tapScale = {
  whileTap: { scale: 0.95, transition: springSnappy },
}

export const tapScaleSmall = {
  whileTap: { scale: 0.9, transition: springSnappy },
}
