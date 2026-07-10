import type { ProjectContent, ProjectId } from '@/types/content'
import Image from 'next/image'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export type ProjectFrameKind = 'browser' | 'phone' | 'chat'

/** Marco canónico por proyecto (home y páginas de servicio comparten esto). */
export const PROJECT_FRAME_KINDS: Record<ProjectId, ProjectFrameKind> = {
  pyron: 'browser',
  pulso: 'phone',
  'bot-ime': 'chat',
  orbita: 'browser',
}

type FrameProject = Pick<ProjectContent, 'id' | 'name' | 'image'>

type ProjectFrameProps = {
  project: FrameProject
  kind: ProjectFrameKind
  /** Alt localizado para la captura real (el placeholder es decorativo). */
  captureAlt: string
  /**
   * Cards compactas del carousel mobile de la home: el iPhone baja a un ancho
   * contenido (~alto de los frames browser/chat) por debajo de lg. Desktop
   * queda idéntico. Solo afecta al kind 'phone'.
   */
  compactOnMobile?: boolean
}

/**
 * Tinte por proyecto para los placeholders — siempre tenue, sobre la base
 * oscura del sitio (pyron fuego, pulso azul, bot-ime verde, orbita violeta).
 */
const TINTS: Record<
  ProjectId,
  { accent: string; soft: string; glow: string; shadow: string }
> = {
  pyron: {
    accent: 'rgba(255, 122, 74, 0.85)',
    soft: 'rgba(255, 110, 60, 0.12)',
    glow: 'rgba(255, 110, 60, 0.2)',
    shadow: 'rgba(255, 110, 60, 0.22)',
  },
  pulso: {
    accent: 'rgba(96, 152, 255, 0.9)',
    soft: 'rgba(84, 140, 255, 0.13)',
    glow: 'rgba(84, 140, 255, 0.22)',
    shadow: 'rgba(84, 140, 255, 0.24)',
  },
  'bot-ime': {
    accent: 'rgba(37, 211, 102, 0.85)',
    soft: 'rgba(37, 211, 102, 0.12)',
    glow: 'rgba(37, 211, 102, 0.18)',
    shadow: 'rgba(37, 211, 102, 0.2)',
  },
  orbita: {
    accent: 'rgba(150, 112, 255, 0.9)',
    soft: 'rgba(140, 102, 255, 0.13)',
    glow: 'rgba(140, 102, 255, 0.22)',
    shadow: 'rgba(140, 102, 255, 0.24)',
  },
}

const BROWSER_URLS: Partial<Record<ProjectId, string>> = {
  pyron: 'app.pyron.lat',
  orbita: 'orbita.galfredev.com',
}

/* ------------------------------------------------------------------ */
/* Mini-UI abstracta por kind (solo placeholder)                       */
/* ------------------------------------------------------------------ */

function BrowserMiniUi({ tint }: { tint: (typeof TINTS)[ProjectId] }) {
  const rows = ['82%', '58%', '70%', '46%']
  const bars = [38, 62, 46, 78, 58, 92, 68]

  return (
    <div className="absolute inset-0 flex gap-3 p-4 pb-16 sm:p-5 sm:pb-[4.5rem]">
      <div className="hidden w-[26%] flex-col gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 sm:flex">
        <div className="mb-1 h-2 w-2/3 rounded-full" style={{ background: tint.accent }} />
        {rows.map((width, i) => (
          <div key={i} className="h-1.5 rounded-full bg-white/10" style={{ width }} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="space-y-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5"
            >
              <div
                className="h-1.5 w-1/2 rounded-full"
                style={{ background: i === 0 ? tint.accent : 'rgba(255,255,255,0.14)' }}
              />
              <div className="h-1.5 w-3/4 rounded-full bg-white/[0.08]" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
          {bars.map((height, i) => (
            <div
              key={i}
              className="w-full rounded-t-[3px]"
              style={{
                height: `${height}%`,
                background: i === 5 ? tint.accent : 'rgba(255,255,255,0.09)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PhoneMiniUi({ tint }: { tint: (typeof TINTS)[ProjectId] }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-4 px-4 pb-14 pt-10 sm:gap-5 sm:pt-14">
      <div
        className="relative h-14 w-14 shrink-0 rounded-full sm:h-20 sm:w-20"
        style={{
          background: `conic-gradient(${tint.accent} 0 68%, rgba(255,255,255,0.09) 68% 100%)`,
        }}
      >
        <div className="absolute inset-[7px] rounded-full bg-[#081120]" />
        <div
          className="absolute left-1/2 top-1/2 h-2 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: tint.soft }}
        />
      </div>
      <div className="w-full space-y-2">
        {['74%', '52%', '64%'].map((width, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5"
          >
            <div
              className="h-5 w-5 shrink-0 rounded-md"
              style={{ background: i === 0 ? tint.soft : 'rgba(255,255,255,0.07)' }}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-1.5 rounded-full bg-white/12" style={{ width }} />
              <div className="h-1 w-1/3 rounded-full bg-white/[0.07]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({
  incoming,
  tint,
  width,
  lines,
}: {
  incoming: boolean
  tint: (typeof TINTS)[ProjectId]
  width: string
  lines: string[]
}) {
  return (
    <div
      className={
        incoming
          ? 'space-y-1.5 self-start rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.05] p-3'
          : 'space-y-1.5 self-end rounded-2xl rounded-br-md border p-3'
      }
      style={
        incoming
          ? { width }
          : { width, background: tint.soft, borderColor: tint.glow }
      }
    >
      {lines.map((lineWidth, i) => (
        <div key={i} className="h-1.5 rounded-full bg-white/[0.16]" style={{ width: lineWidth }} />
      ))}
    </div>
  )
}

function ChatMiniUi({ tint }: { tint: (typeof TINTS)[ProjectId] }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-2.5 p-4 sm:p-5">
      <ChatBubble incoming tint={tint} width="66%" lines={['92%', '58%']} />
      <ChatBubble incoming={false} tint={tint} width="44%" lines={['80%']} />
      <ChatBubble incoming tint={tint} width="72%" lines={['95%', '70%', '40%']} />
      <ChatBubble incoming={false} tint={tint} width="36%" lines={['65%']} />
      <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: i === 0 ? tint.accent : 'rgba(255,255,255,0.3)' }}
          />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Visual interno: captura real si existe el PNG, placeholder si no    */
/* ------------------------------------------------------------------ */

function Visual({ project, kind, captureAlt }: ProjectFrameProps) {
  // Contrato: commitear el PNG a public/images/projects/ lo activa en el
  // próximo deploy, sin tocar código. La detección corre en build/render
  // server-side — en Vercel el filesystem es inmutable, así que rutas
  // estáticas (p. ej. /en) lo toman al rebuildear, nunca en runtime.
  const hasImage = existsSync(join(process.cwd(), 'public', project.image))

  if (hasImage) {
    return (
      <Image
        src={project.image}
        alt={captureAlt}
        fill
        sizes="(min-width: 1024px) 45vw, 92vw"
        className="object-cover object-top"
      />
    )
  }

  const tint = TINTS[project.id]

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 18% -12%, ${tint.glow}, transparent 55%), radial-gradient(circle at 92% 112%, ${tint.soft}, transparent 58%), linear-gradient(165deg, #0a1524 0%, #060b14 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.3))',
        }}
      />

      {kind === 'browser' ? <BrowserMiniUi tint={tint} /> : null}
      {kind === 'phone' ? <PhoneMiniUi tint={tint} /> : null}
      {kind === 'chat' ? <ChatMiniUi tint={tint} /> : null}

      {/* En chat el nombre ya vive en el header de la ventana */}
      {kind !== 'chat' ? (
        <div
          className={
            kind === 'phone'
              ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,8,14,0.88)] to-transparent p-4 pt-10 text-center'
              : 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,8,14,0.88)] to-transparent p-4 pt-12 sm:p-5'
          }
        >
          <span
            className={
              kind === 'phone'
                ? 'text-xl italic leading-none text-white/90 [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-2xl'
                : 'text-2xl italic leading-none text-white/90 [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-3xl'
            }
          >
            {project.name}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Marcos de dispositivo                                               */
/* ------------------------------------------------------------------ */

/**
 * Server component: marco de dispositivo (navegador / iPhone / chat) para la
 * captura de cada proyecto. Mientras no existan los PNG reales renderiza un
 * placeholder tintado por proyecto con mini-UI abstracta según el kind.
 */
export function ProjectFrame({ project, kind, captureAlt, compactOnMobile }: ProjectFrameProps) {
  const tint = TINTS[project.id]
  const glowShadow = { boxShadow: `0 32px 90px -30px ${tint.shadow}` }

  if (kind === 'phone') {
    return (
      <div
        className={
          compactOnMobile
            ? 'mx-auto w-[104px] lg:w-[200px]'
            : 'mx-auto w-[156px] sm:w-[190px] lg:w-[200px]'
        }
      >
        <div
          className="overflow-hidden rounded-[2.6rem] border border-white/12 bg-[#0a0f1a] p-[7px]"
          style={glowShadow}
        >
          <div className="relative aspect-[9/18.5] overflow-hidden rounded-[2.1rem] bg-[#060b14]">
            <Visual project={project} kind={kind} captureAlt={captureAlt} />
            <div
              aria-hidden
              className="absolute left-1/2 top-1.5 z-10 h-[18px] w-[74px] -translate-x-1/2 rounded-full border border-white/[0.05] bg-black/95"
            />
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'chat') {
    return (
      <div
        className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070d17]"
        style={glowShadow}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.035] px-4 py-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white/90"
            style={{
              background: `linear-gradient(140deg, ${tint.accent}, ${tint.soft})`,
            }}
          >
            {project.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-tight text-white/90">
              {project.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] leading-none text-white/45">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#25d366]" />
              en línea
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/10]">
          <Visual project={project} kind={kind} captureAlt={captureAlt} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070d17]"
      style={glowShadow}
    >
      <div aria-hidden className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.035] px-3.5 py-2.5">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <span className="truncate rounded-full border border-white/[0.07] bg-white/[0.04] px-4 py-1 font-mono text-[10px] tracking-wide text-white/55">
            {BROWSER_URLS[project.id] ?? 'galfredev.com'}
          </span>
        </div>
        <div aria-hidden className="w-[46px] shrink-0" />
      </div>
      <div className="relative aspect-[16/10]">
        <Visual project={project} kind={kind} captureAlt={captureAlt} />
      </div>
    </div>
  )
}
