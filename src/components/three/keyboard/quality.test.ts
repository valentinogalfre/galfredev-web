import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectTier } from './quality'

const GL_RENDERER = 0x1f01
const UNMASKED_RENDERER_WEBGL = 0x9246

type Device = {
  renderer?: string
  unmasked?: string | null
  webgl?: boolean
  mobile?: boolean
  memory?: number
  cores?: number
}

function stubDevice({
  renderer = 'WebKit WebGL',
  unmasked = null,
  webgl = true,
  mobile = false,
  memory = 8,
  cores = 8,
}: Device) {
  const gl = {
    RENDERER: GL_RENDERER,
    getExtension: (name: string) =>
      name === 'WEBGL_debug_renderer_info' && unmasked !== null ? { UNMASKED_RENDERER_WEBGL } : null,
    getParameter: (p: number) =>
      p === UNMASKED_RENDERER_WEBGL ? unmasked : p === GL_RENDERER ? renderer : null,
  }
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })
  vi.stubGlobal('document', { createElement: () => ({ getContext: () => (webgl ? gl : null) }) })
  vi.stubGlobal('navigator', {
    deviceMemory: memory,
    hardwareConcurrency: cores,
    userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' : 'Mozilla/5.0 (X11; Linux x86_64)',
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectTier', () => {
  it.each([
    ['SwiftShader (Chrome headless, Lighthouse/PSI)', 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)'],
    ['llvmpipe (Mesa sin GPU)', 'llvmpipe (LLVM 15.0.7, 256 bits)'],
    ['WARP (Windows sin driver)', 'ANGLE (Microsoft, Microsoft Basic Render Driver (0x0000008C) Direct3D11 vs_5_0 ps_5_0, D3D11)'],
    ['Apple Software Renderer', 'Apple Software Renderer'],
  ])('WebGL por software → low: %s', (_, unmasked) => {
    stubDevice({ unmasked })
    expect(detectTier()).toBe('low')
  })

  it('sin WEBGL_debug_renderer_info usa RENDERER', () => {
    stubDevice({ renderer: 'llvmpipe (LLVM 15.0.7, 256 bits)' })
    expect(detectTier()).toBe('low')
  })

  it('GPU real en desktop potente → high', () => {
    stubDevice({ unmasked: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)' })
    expect(detectTier()).toBe('high')
  })

  it('GPU real en desktop modesto → mid', () => {
    stubDevice({ unmasked: 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)', cores: 4 })
    expect(detectTier()).toBe('mid')
  })

  it('GPU real en mobile → mid', () => {
    stubDevice({ unmasked: 'Apple GPU', mobile: true })
    expect(detectTier()).toBe('mid')
  })

  it('sin WebGL → low', () => {
    stubDevice({ webgl: false })
    expect(detectTier()).toBe('low')
  })
})
