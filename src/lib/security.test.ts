import { describe, it, expect } from 'vitest'
import { isJsonRequest } from './security'

const withType = (contentType?: string) =>
  new Request('https://galfredev.com/api/lead', {
    method: 'POST',
    headers: contentType ? { 'content-type': contentType } : {},
  })

// Contrato: las APIs solo aceptan JSON declarado como tal. Un content-type
// "simple" (sin preflight CORS) que solo MENCIONA json no pasa el filtro.
describe('isJsonRequest', () => {
  it('acepta application/json, con o sin charset y en cualquier caja', () => {
    expect(isJsonRequest(withType('application/json'))).toBe(true)
    expect(isJsonRequest(withType('application/json; charset=utf-8'))).toBe(true)
    expect(isJsonRequest(withType('Application/JSON'))).toBe(true)
  })

  it('rechaza media types que solo contienen «application/json» como texto', () => {
    expect(isJsonRequest(withType('text/plain; x=application/json'))).toBe(false)
    expect(isJsonRequest(withType('application/jsonp'))).toBe(false)
    expect(isJsonRequest(withType())).toBe(false)
  })
})
