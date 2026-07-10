'use client'

import { cn } from '@/lib/utils'
import type { ProjectId, ServiceId } from '@/types/content'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'

type FilterChip = { id: ServiceId; name: string }

/**
 * Las cards llegan renderizadas del server (ProjectFrame usa node:fs para
 * detectar capturas); acá solo se decide cuáles se ven.
 */
type FilterItem = { id: ProjectId; services: ServiceId[]; card: ReactNode }

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/**
 * Client component chico: chips de servicio + grilla filtrable de casos.
 * Estado local puro (sin URL); AnimatePresence popLayout anima el reflow.
 */
export function ProjectsFilter({
  allLabel,
  groupLabel,
  filters,
  items,
}: {
  allLabel: string
  /** Describe el grupo de chips para lectores de pantalla (p. ej. "Filtrar por servicio"). */
  groupLabel: string
  filters: FilterChip[]
  items: FilterItem[]
}) {
  const [active, setActive] = useState<ServiceId | null>(null)
  const visible = active
    ? items.filter((item) => item.services.includes(active))
    : items

  const chipClass = (isActive: boolean) =>
    cn(
      'inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-[13px] font-medium transition duration-300 active:scale-[0.97]',
      isActive
        ? 'border-[rgba(61,221,196,0.45)] bg-[rgba(31,127,115,0.18)] text-[#8ceada] shadow-[0_0_24px_rgba(31,127,115,0.25)]'
        : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/85',
    )

  return (
    <div>
      <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => setActive(null)}
          className={chipClass(active === null)}
        >
          {allLabel}
        </button>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active === filter.id}
            onClick={() => setActive(filter.id)}
            className={chipClass(active === filter.id)}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2 md:gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.div
              key={item.id}
              layout
              data-testid="project-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="h-full"
            >
              {item.card}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
