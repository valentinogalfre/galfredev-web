'use client'

import { Marquee } from '@/components/motion/marquee'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { KeyboardCss } from './keyboard-css'
import { useTypingLoop } from './use-typing-loop'

type Cta = { label: string; href: string }

type HeroClientProps = {
  eyebrow: string
  titlePrefix: string
  rotatingWords: string[]
  sub: string
  ctaPrimary: Cta
  ctaSecondary: Cta
  typedWords: string[]
  marqueeItems: { name: string; tagline: string }[]
}

export function HeroClient({
  eyebrow,
  titlePrefix,
  rotatingWords,
  sub,
  ctaPrimary,
  ctaSecondary,
  typedWords,
  marqueeItems,
}: HeroClientProps) {
  // Única fuente de verdad del hero: alimenta titular, teclado y línea tipeada.
  const typing = useTypingLoop(typedWords)
  const rotatingWord = rotatingWords[typing.wordIndex % rotatingWords.length]

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(ellipse_at_50%_62%,rgba(31,127,115,0.2),transparent_56%),radial-gradient(ellipse_at_12%_8%,rgba(31,127,115,0.1),transparent_44%),radial-gradient(ellipse_at_88%_6%,rgba(255,180,106,0.06),transparent_38%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(5,8,16,0.9))]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-4 pt-24 text-center sm:px-6 sm:pt-32">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.1)] px-4 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#8ceada] sm:text-[11px] sm:tracking-[0.16em]"
        >
          <span className="relative inline-flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full rounded-full bg-[#3dddc4] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_#3dddc4]" />
          </span>
          {eyebrow}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-balance text-[2.35rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:mt-6 sm:text-6xl lg:text-7xl"
        >
          <span>{titlePrefix}</span>{' '}
          <span className="inline-block whitespace-nowrap">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={rotatingWord}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-2 font-normal italic text-transparent [font-family:var(--font-instrument-serif),Georgia,serif]"
              >
                {rotatingWord}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-xl text-pretty text-[0.95rem] leading-[1.65] text-[var(--text-soft)] sm:mt-5 sm:text-[1.08rem] sm:leading-8"
        >
          {sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:mt-8 sm:w-auto sm:flex-row"
        >
          <Link
            href={ctaPrimary.href}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full border border-[rgba(61,221,196,0.22)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_44px_rgba(31,127,115,0.34)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_52px_rgba(31,127,115,0.44)] active:scale-[0.985] sm:w-auto"
          >
            {ctaPrimary.label}
          </Link>
          <Link
            href={ctaSecondary.href}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-7 py-3 text-sm text-white/84 transition duration-300 hover:border-white/24 hover:bg-white/[0.055] hover:text-white active:scale-[0.985] sm:w-auto"
          >
            {ctaSecondary.label}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          data-testid="keyboard-hero"
          className="-mx-10 mt-0 self-stretch sm:mx-0 sm:mt-2"
        >
          <KeyboardCss typing={typing} />
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-[rgba(61,221,196,0.14)] py-3">
        <Marquee
          speed={44}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/38"
        >
          {marqueeItems.map((project) => (
            <span key={project.name} className="flex items-center">
              <span className="mx-6">
                {project.name} — {project.tagline.replace(/\.$/, '')}
              </span>
              <span className="text-[rgba(61,221,196,0.55)]">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
