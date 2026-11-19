'use client'

import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export function CursorSpotlight() {
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const reduceMotion = useReducedMotion()

  const smoothX = useSpring(mouseX, { stiffness: 68, damping: 22, mass: 0.5 })
  const smoothY = useSpring(mouseY, { stiffness: 68, damping: 22, mass: 0.5 })

  const background = useMotionTemplate`radial-gradient(560px circle at ${smoothX}px ${smoothY}px, rgba(31,127,115,0.06), transparent 66%)`

  useEffect(() => {
    if (reduceMotion) return

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY, reduceMotion])

  if (reduceMotion) return null

  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 hidden lg:block"
      style={{ background }}
    />
  )
}
