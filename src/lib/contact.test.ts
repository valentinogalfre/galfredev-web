import { describe, it, expect } from 'vitest'
import { createInitialLeadFormState, validateLeadForm, type LeadFormState } from './contact'

const validLead: LeadFormState = {
  ...createInitialLeadFormState(),
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  phone: '+54 9 351 555 1234',
  primaryNeed: 'automatizacion-interna',
  challenge: 'Cargo pedidos a mano todos los días y quiero automatizarlo.',
  consentPrivacy: true,
}

// Contrato: el email se valida en tiempo lineal. /api/lead es público y sin
// límite de payload propio: un email patológico no puede tomar la CPU.
describe('validateLeadForm · email', () => {
  it('rechaza un email patológico de 100k caracteres sin backtracking', () => {
    const hostile = `a@${'.'.repeat(100_000)}@`
    const started = performance.now()
    const result = validateLeadForm({ ...validLead, email: hostile })
    const elapsed = performance.now() - started

    expect(result.errors.email).toBeDefined()
    // El regex anterior tardaba >1 s con 40k caracteres; lineal tarda <1 ms.
    expect(elapsed).toBeLessThan(100)
  })

  it('acepta emails comunes, con subdominios y TLD compuestos', () => {
    for (const email of ['ana@example.com', 'valentino.galfre@gmail.com', 'x@sub.dominio.com.ar']) {
      expect(validateLeadForm({ ...validLead, email }).errors.email).toBeUndefined()
    }
  })

  it('rechaza emails sin dominio, sin TLD o con puntos vacíos', () => {
    for (const email of ['ana@', 'ana@dominio', 'ana@.com', 'ana@dominio.', 'ana@dominio..com', 'a b@c.com']) {
      expect(validateLeadForm({ ...validLead, email }).errors.email).toBeDefined()
    }
  })

  it('un email demasiado largo se informa como largo, no como inválido', () => {
    const long = `${'a'.repeat(170)}@example.com`
    expect(validateLeadForm({ ...validLead, email: long }).errors.email).toMatch(/largo/)
  })
})
