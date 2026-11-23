import type { Page } from '@playwright/test'

export const HARDWARE_GPU = 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)'
export const SOFTWARE_GPU =
  'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)'

// Fija el renderer que reporta WebGL: el tier (y qué teclado se monta) deja de
// depender de la GPU de la máquina que corre la suite — CI y VMs rasterizan
// por software y detectTier los manda a 'low'.
export function emulateGpu(page: Page, renderer: string) {
  return page.addInitScript((name) => {
    const RENDERER = 0x1f01
    const UNMASKED_RENDERER_WEBGL = 0x9246
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const original = proto.getParameter
      proto.getParameter = function (this: WebGLRenderingContext, p: number) {
        return p === RENDERER || p === UNMASKED_RENDERER_WEBGL ? name : original.call(this, p)
      } as typeof proto.getParameter
    }
  }, renderer)
}
