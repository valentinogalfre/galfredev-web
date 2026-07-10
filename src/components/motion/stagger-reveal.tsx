'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { useSyncExternalStore, type ReactNode } from 'react'

type StaggerRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  id?: string
}

const containerVariants = (stagger: number, delay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const itemVariants = (y: number, reduced: boolean) => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.38 : 0.72, ease: EASE },
  },
})

export function StaggerReveal({
  children,
  className,
  delay = 0,
  stagger = 0.09,
  ...props
}: StaggerRevealProps) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  return (
    <motion.div
      variants={containerVariants(stagger, delay)}
      initial={hydrated ? 'hidden' : false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={itemVariants(18, reduceMotion ?? false)}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
