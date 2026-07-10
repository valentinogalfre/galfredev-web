'use client'

import { Marquee } from '@/components/motion/marquee'
import { cn } from '@/lib/utils'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardHero } from './keyboard-hero'
import { useHeroSound } from './use-hero-sound'
import { usePhysicalKeys } from './use-physical-keys'
import { useTypingLoop, type TypingState } from './use-typing-loop'

type Cta = { label: string; href: string }

type HeroClientProps = {
  titlePrefix: string
  rotatingWords: string[]
  sub: string
  ctaPrimary: Cta
  ctaSecondary: Cta
  typedWords: string[]
  soundOnLabel: string
  soundOffLabel: string
  eggMessage: string
  marqueeItems: { name: string; tagline: string }[]
}

/** Chars que entran en la typed-line cuando tipea el usuario (letter-spacing ancho). */
const USER_LINE_MAX = 14

export function HeroClient({
  titlePrefix,
  rotatingWords,
  sub,
  ctaPrimary,
  ctaSecondary,
  typedWords,
  soundOnLabel,
  soundOffLabel,
  eggMessage,
  marqueeItems,
}: HeroClientProps) {
  // El teclado físico solo captura mientras el hero está en viewport.
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    // Semilla síncrona: el callback del IO puede demorar bajo carga (hidratación
    // + compilación de shaders) y perderse las primeras teclas del usuario.
    const rect = el.getBoundingClientRect()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rect.bottom > 0 && rect.top < window.innerHeight) setInView(true)
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scroll-hint: visible hasta el primer scroll real (>60px); no vuelve.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 60) setScrolled(true)
    }
    // Semilla: si la página ya carga scrolleada (bfcache/anchor) no se muestra.
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { liveKey, buffer, typingPaused, pressSeq, egg } = usePhysicalKeys(inView)
  // Única fuente de verdad del hero: alimenta titular, teclado y línea tipeada.
  const typing = useTypingLoop(typedWords, { paused: typingPaused })
  const rotatingWord = rotatingWords[typing.wordIndex % rotatingWords.length]

  // Salida cinematográfica por scroll: 0 con el hero clavado arriba → 1 cuando
  // salió entero del viewport. Todo vive en MotionValues (cero re-render por
  // scroll): el copy se desvanece hacia arriba en el primer ~60% del recorrido
  // y el teclado recibe el progress crudo (la cámara/tilt se leen con .get()
  // dentro de useFrame; el fallback CSS lo transforma vía motion.div).
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const copyY = useTransform(scrollYProgress, [0, 0.6], [0, -56])

  // Merge loop↔físico: mientras el usuario tipea, el teclado refleja SU tecla
  // (held: queda hundida hasta el keyup) y la typed-line muestra su buffer.
  const userLine = buffer.slice(-USER_LINE_MAX)
  // Memoizado: el modelo WebGL detecta "nueva pulsación" por identidad del
  // objeto — un literal fresco en cada render dispararía ripples fantasma.
  const wordIndex = typing.wordIndex
  const effective: TypingState = useMemo(
    () =>
      typingPaused
        ? { word: '', typed: userLine, pressedKey: liveKey, wordIndex, held: true }
        : typing,
    [typingPaused, userLine, liveKey, wordIndex, typing],
  )

  // Sonido opcional (persistido en localStorage, apagado por defecto).
  const { soundOn, toggleSound } = useHeroSound(typing, typingPaused, pressSeq)

  const typedLine = egg ? eggMessage : typingPaused ? userLine : typing.typed

  return (
    <section
      ref={sectionRef}
      // Señal observable de que el teclado físico está capturando (e2e/manual QA).
      data-keys-live={inView ? '' : undefined}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(ellipse_at_50%_62%,rgba(31,127,115,0.2),transparent_56%),radial-gradient(ellipse_at_12%_8%,rgba(31,127,115,0.1),transparent_44%),radial-gradient(ellipse_at_88%_6%,rgba(255,180,106,0.06),transparent_38%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(5,8,16,0.9))]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-4 pt-24 text-center sm:px-6 sm:pt-32">
        {/* Copy del hero: al scrollear se desvanece y sube (completa ~60% del
            recorrido). Con reduced-motion el style no se aplica: queda estático. */}
        <motion.div
          style={reducedMotion ? undefined : { opacity: copyOpacity, y: copyY }}
          className="flex w-full flex-col items-center"
        >
          <h1
            style={{ animationDelay: '0.08s' }}
            className="hero-enter-h1 text-balance text-[2.35rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl"
          >
            <span>{titlePrefix}</span>{' '}
            <span className="inline-block whitespace-nowrap">
              {/* Crossfade puro, SIN desplazamiento en y: la palabra desplazada
                  agranda el bounding box de texto del h1 y Chrome re-emite un
                  candidato LCP más grande en cada rotación (LCP tardío). */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={rotatingWord}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-2 font-normal italic text-transparent [font-family:var(--font-instrument-serif),Georgia,serif]"
                >
                  {rotatingWord}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p
            style={{ animationDelay: '0.16s' }}
            className="hero-enter mt-4 max-w-xl text-pretty text-[0.95rem] leading-[1.65] text-[var(--text-soft)] sm:mt-5 sm:text-[1.08rem] sm:leading-8"
          >
            {sub}
          </p>

          <div
            style={{ animationDelay: '0.24s' }}
            className="hero-enter mt-7 flex w-full flex-col items-center justify-center gap-3 sm:mt-8 sm:w-auto sm:flex-row"
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
          </div>
        </motion.div>

        <div
          style={{ animationDelay: '0.3s' }}
          className="hero-enter-fade -mx-10 mt-0 self-stretch sm:mx-0 sm:mt-2"
        >
          <KeyboardHero
            typing={effective}
            egg={egg}
            visible={inView}
            scrollProgress={reducedMotion ? undefined : scrollYProgress}
          />
          {/* El cursor ▌ vive en ::after para que el textContent sea solo lo
              tipeado. Fuera del teclado: existe igual en modo CSS y WebGL. */}
          <div
            className="kb-typed"
            data-testid="typed-line"
            aria-hidden="true"
            // El mensaje del egg es largo: sin el tracking ancho no entra en mobile.
            style={egg ? { letterSpacing: '0.08em' } : undefined}
          >
            {typedLine}
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? soundOffLabel : soundOnLabel}
            title={soundOn ? soundOffLabel : soundOnLabel}
            data-testid="sound-toggle"
            // relative z-10: la typed-line tira el contenido -3rem sobre el shell
            // del teclado; sin esto el canvas WebGL (capa absoluta) intercepta el click.
            className="relative z-10 mt-2 inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/35 transition duration-300 hover:border-[rgba(61,221,196,0.3)] hover:text-[#8ceada] active:scale-95"
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>

        {/* Scroll-hint: mouse-pill decorativa que invita a bajar; se desvanece
            con el primer scroll (>60px) y no vuelve. Icónica, sin copy. */}
        <div
          aria-hidden="true"
          style={{ animationDelay: '0.55s' }}
          className={cn(
            'hero-enter-fade mt-auto flex justify-center pt-6 transition-opacity duration-500',
            scrolled && 'pointer-events-none opacity-0',
          )}
        >
          <div className="scroll-hint-pill">
            <span className="scroll-hint-dot" />
          </div>
        </div>
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
