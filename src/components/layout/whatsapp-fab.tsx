'use client'

import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/types/content'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

/** El FAB vive en RootShell (ambos árboles es/en): sus textos van por locale. */
const LABELS = {
  es: {
    message: 'Hola, me gustaría consultar por los servicios de GalfreDev.',
    aria: 'Abrir conversación por WhatsApp con GalfreDev',
    label: 'Hablar por WhatsApp',
  },
  en: {
    message: "Hi, I'd like to ask about GalfreDev's services.",
    aria: 'Open a WhatsApp conversation with GalfreDev',
    label: 'Chat on WhatsApp',
  },
} as const

export function WhatsAppFab({ locale }: { locale: Locale }) {
  const labels = LABELS[locale]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const nextValue = window.scrollY > 520
      setVisible((current) => (current === nextValue ? current : nextValue))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ duration: 0.22 }}
          href={buildWhatsAppUrl(labels.message)}
          target="_blank"
          rel="noreferrer"
          aria-label={labels.aria}
          className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-emerald-400/28 bg-[rgba(11,20,17,0.94)] px-4 py-3 text-sm text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-emerald-400/50 sm:bottom-6 sm:right-6"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
            <MessageCircle size={18} />
          </span>
          <span className="hidden sm:block">{labels.label}</span>
        </motion.a>
      ) : null}
    </AnimatePresence>
  )
}
