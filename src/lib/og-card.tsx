import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

/** Recorta el subtítulo para que nunca desborde la placa (≈2 líneas). */
function clamp(text: string, max = 150) {
  if (text.length <= max) return text
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
}

/** Placa OG 1200×630 compartida por servicios/proyectos (es y en): misma
 *  estética que el opengraph-image global — azul noche + grilla sutil +
 *  acento cian de marca. */
export function ogCard({
  title,
  subtitle,
  badge = 'GALFREDEV',
}: {
  title: string
  subtitle: string
  badge?: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: 56,
          background:
            'radial-gradient(circle at top, rgba(61,221,196,0.22), transparent 30%), linear-gradient(180deg, #07101d 0%, #050810 65%)',
          color: 'white',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Grilla sutil sobre el fondo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div
          style={{
            // Satori (runtime nodejs) no acepta inline-flex: flex +
            // alignSelf logra el mismo pill auto-ancho.
            display: 'flex',
            alignSelf: 'flex-start',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '12px 18px',
            fontSize: 20,
            letterSpacing: '0.22em',
          }}
        >
          {badge}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.06em' }}>
            {clamp(title, 40)}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.72)',
              maxWidth: 980,
            }}
          >
            {clamp(subtitle)}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
