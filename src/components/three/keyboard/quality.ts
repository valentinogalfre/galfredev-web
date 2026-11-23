export type GpuTier = 'high' | 'mid' | 'low'

// Rasterizadores por CPU (Chrome headless/Lighthouse, VMs, Mesa y Windows sin
// driver): exponen WebGL pero la escena 3D bloquea el main thread por segundos.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render driver/i

function rendererName(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '')
}

export function detectTier(): GpuTier {
  if (typeof window === 'undefined') return 'low'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!gl || SOFTWARE_RENDERER.test(rendererName(gl))) return 'low'
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  if (memory <= 4 || cores <= 4) return mobile ? 'low' : 'mid'
  return mobile ? 'mid' : 'high'
}
