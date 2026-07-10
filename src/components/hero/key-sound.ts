/**
 * Click mecánico sintetizado con WebAudio (cero assets): oscilador square corto
 * (~2 kHz, 8 ms) + burst de ruido con envelope exponencial (~35 ms total).
 * APAGADO por defecto; la preferencia persiste en localStorage ('kb-sound').
 *
 * Los browsers bloquean AudioContext sin gesto de usuario: `ensureAudioContext()`
 * debe llamarse desde un handler de gesto real (click/keydown). `playClick()`
 * nunca crea el contexto por sí solo — si no existe o está suspendido, es no-op
 * silencioso (así los ticks del loop automático no ensucian la consola).
 */

const STORAGE_KEY = 'kb-sound'
const CLICK_GAIN = 0.15

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext }

export function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext
  if (!Ctor) return null
  ctx ??= new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // localStorage bloqueado (modo privado): el toggle vive solo en memoria.
  }
}

function getNoiseBuffer(ac: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer
  const length = Math.floor(ac.sampleRate * 0.03)
  noiseBuffer = ac.createBuffer(1, length, ac.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

export function playClick(): void {
  if (!ctx || ctx.state !== 'running') return
  const t0 = ctx.currentTime

  const out = ctx.createGain()
  out.gain.setValueAtTime(CLICK_GAIN, t0)
  out.gain.exponentialRampToValueAtTime(0.001, t0 + 0.035)
  out.connect(ctx.destination)

  // Cuerpo del click: square agudo, cortito, con ±10% de pitch para realismo.
  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 2000 * (0.9 + Math.random() * 0.2)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.5, t0)
  oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.01)
  osc.connect(oscGain)
  oscGain.connect(out)
  osc.start(t0)
  osc.stop(t0 + 0.008)

  // "Thock": burst de ruido blanco con decaimiento exponencial corto.
  const noise = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.8, t0)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03)
  noise.connect(noiseGain)
  noiseGain.connect(out)
  noise.start(t0)
  noise.stop(t0 + 0.035)
}
