export type GpuTier = 'high' | 'mid' | 'low'

export function detectTier(): GpuTier {
  if (typeof window === 'undefined') return 'low'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!gl) return 'low'
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  if (memory <= 4 || cores <= 4) return mobile ? 'low' : 'mid'
  return mobile ? 'mid' : 'high'
}
