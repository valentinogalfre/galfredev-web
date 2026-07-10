'use client'

import { Reveal } from '@/components/motion/reveal'
import {
  profileBusinessTypeOptions,
  profileChannelOptions,
  profileInterestOptions,
  profileNeedOptions,
  profileTeamSizeOptions,
} from '@/content/profile-content'
import { deriveInitials } from '@/lib/profile'
import type { AuthUserSummary, ProfileBundle } from '@/types/site'
import { motion } from 'framer-motion'
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type ProfileViewProps = {
  authUser: AuthUserSummary
  bundle: ProfileBundle
}

function resolveLabel(
  options: { value: string; label: string }[],
  value: string | null,
  other?: string | null,
): string | null {
  if (!value) return null
  if (value === 'otro') return other || 'Otro'
  return options.find((opt) => opt.value === value)?.label ?? value
}

function resolveInterestLabels(values: string[], other?: string | null): string[] {
  const labels = values.map(
    (v) => profileInterestOptions.find((opt) => opt.value === v)?.label ?? v,
  )
  if (other?.trim()) labels.push(other.trim())
  return labels
}

type InfoCardProps = {
  icon: React.ReactNode
  label: string
  value: string | null
  empty?: string
}

function InfoCard({ icon, label, value, empty = 'No especificado' }: InfoCardProps) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--surface-border)] bg-white/[0.03] p-4 transition duration-300 hover:border-[rgba(61,221,196,0.18)] hover:bg-white/[0.05] sm:p-5">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-[0.85rem] border border-white/10 bg-black/20 text-[#3dddc4] sm:size-9">
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(61,221,196,0.66)] sm:text-[11px]">
          {label}
        </p>
      </div>
      <p
        className={[
          'mt-3 text-[0.92rem] font-medium leading-snug sm:text-[1.02rem]',
          value ? 'text-white' : 'text-white/28',
        ].join(' ')}
      >
        {value ?? empty}
      </p>
    </div>
  )
}

function ConsentRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {active ? (
        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#3dddc4]" />
      ) : (
        <XCircle size={15} className="mt-0.5 shrink-0 text-white/22" />
      )}
      <p
        className={[
          'text-sm leading-6',
          active ? 'text-white/68' : 'text-white/28',
        ].join(' ')}
      >
        {label}
      </p>
    </div>
  )
}

export function ProfileView({ authUser, bundle }: ProfileViewProps) {
  const initials = deriveInitials(authUser.displayName)
  const avatarSrc = bundle.avatarUrl ?? authUser.avatarUrl

  const businessTypeLabel = resolveLabel(profileBusinessTypeOptions, bundle.businessType, bundle.businessTypeOther)
  const teamSizeLabel = resolveLabel(profileTeamSizeOptions, bundle.teamSize, bundle.teamSizeOther)
  const primaryNeedLabel = resolveLabel(profileNeedOptions, bundle.primaryNeed, bundle.primaryNeedOther)
  const channelLabel = resolveLabel(profileChannelOptions, bundle.preferredContactChannel, bundle.preferredContactChannelOther)
  const interestLabels = resolveInterestLabels(bundle.interests, bundle.interestsOther)

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Header card ─────────────────────────────── */}
      <Reveal variant="section">
        <div className="page-panel p-5 sm:p-8">

          {/* Avatar row — always horizontal */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">

              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative shrink-0"
              >
                <div className="absolute inset-[-3px] rounded-full bg-[conic-gradient(from_180deg,rgba(61,221,196,0.5),rgba(61,221,196,0.08),rgba(61,221,196,0.5))] opacity-60" />
                <div className="relative size-[68px] overflow-hidden rounded-full border border-white/12 bg-[rgba(8,12,20,0.9)] sm:size-[88px]">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={authUser.displayName}
                      fill
                      className="object-cover"
                      unoptimized={avatarSrc.startsWith('data:')}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xl font-semibold text-white sm:text-2xl">
                      {initials}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Name + meta */}
              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="truncate text-[1.45rem] font-semibold leading-tight tracking-[-0.05em] text-white sm:text-[2rem] lg:text-[2.4rem]"
                >
                  {authUser.displayName}
                </motion.h1>

                {bundle.companyName ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.14 }}
                    className="flex min-w-0 items-center gap-1.5 truncate text-sm text-white/60"
                  >
                    <Building2 size={13} aria-hidden className="shrink-0 text-[#3dddc4]" />
                    <span className="truncate">{bundle.companyName}</span>
                  </motion.p>
                ) : null}

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="flex min-w-0 items-center gap-1.5 text-sm text-white/44"
                >
                  <Mail size={13} className="shrink-0 text-white/28" />
                  <span className="min-w-0 truncate">{authUser.email}</span>
                </motion.p>
              </div>
            </div>

            {/* Edit button — top-right always */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              <Link
                href="/perfil?edit=1"
                className="group inline-flex items-center gap-2 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.12)] px-3 py-2.5 text-xs font-medium text-[#8ceada] transition duration-300 hover:border-[rgba(61,221,196,0.45)] hover:bg-[rgba(31,127,115,0.2)] hover:text-white active:scale-[0.985] sm:px-5 sm:py-3 sm:text-sm"
              >
                <Pencil
                  size={13}
                  className="transition duration-300 group-hover:rotate-[-6deg] sm:size-[15px]"
                />
                <span className="hidden sm:inline">Editar perfil</span>
                <span className="sm:hidden">Editar</span>
              </Link>
            </motion.div>
          </div>

          {/* Meta row: phone + provider */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3"
          >
            {bundle.phone ? (
              <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-white/54">
                <Phone size={12} className="text-white/32" />
                {bundle.phone}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/40">
              {authUser.providerLabel}
            </span>
          </motion.div>
        </div>
      </Reveal>

      {/* ── Info grid ───────────────────────────────── */}
      <Reveal variant="surface" delay={0.06}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InfoCard icon={<BriefcaseBusiness size={15} />} label="Rubro" value={businessTypeLabel} />
          <InfoCard icon={<Users size={15} />} label="Equipo" value={teamSizeLabel} />
          <InfoCard icon={<Zap size={15} />} label="Necesidad" value={primaryNeedLabel} />
          <InfoCard icon={<MessageCircle size={15} />} label="Canal preferido" value={channelLabel} />
        </div>
      </Reveal>

      {/* ── Interests ───────────────────────────────── */}
      {interestLabels.length > 0 ? (
        <Reveal variant="surface" delay={0.1}>
          <div className="rounded-[1.6rem] border border-[var(--surface-border)] bg-white/[0.03] p-4 sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-[0.85rem] border border-white/10 bg-black/20 text-[#3dddc4] sm:size-9">
                <Sparkles size={15} />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(61,221,196,0.66)] sm:text-[11px]">
                Intereses
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {interestLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.06)] px-3 py-1.5 text-sm text-white/80 sm:px-4 sm:py-2"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* ── Consents ────────────────────────────────── */}
      <Reveal variant="surface" delay={0.14}>
        <div className="rounded-[1.6rem] border border-[var(--surface-border)] bg-white/[0.025] p-4 sm:rounded-[1.8rem] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(61,221,196,0.66)] sm:text-[11px]">
            Preferencias de contacto
          </p>
          <div className="mt-4 space-y-3">
            <ConsentRow label="Seguimiento comercial autorizado" active={bundle.commercialFollowUp} />
            <ConsentRow label="Novedades y newsletter por email" active={bundle.newsletterOptIn} />
            <ConsentRow label="Información usada para personalizar diagnósticos" active={bundle.profilingConsent} />
          </div>
        </div>
      </Reveal>

    </div>
  )
}
