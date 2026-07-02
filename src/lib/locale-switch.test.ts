import { describe, it, expect } from 'vitest'
import { switchLocalePath } from './locale-switch'

// Contrato: dada la ruta actual y su locale, switchLocalePath devuelve la ruta
// equivalente en el otro idioma (slugs localizados incluidos); rutas
// desconocidas caen al home del idioma destino.
describe('switchLocalePath', () => {
  it('home: es → /en y en → /', () => {
    expect(switchLocalePath('es', '/')).toBe('/en')
    expect(switchLocalePath('en', '/en')).toBe('/')
  })

  it('rutas estáticas: /proyectos ↔ /en/projects', () => {
    expect(switchLocalePath('es', '/proyectos')).toBe('/en/projects')
    expect(switchLocalePath('en', '/en/projects')).toBe('/proyectos')
  })

  it('servicio con slug distinto por idioma', () => {
    expect(switchLocalePath('es', '/servicios/bots-whatsapp')).toBe('/en/services/whatsapp-bots')
    expect(switchLocalePath('en', '/en/services/whatsapp-bots')).toBe('/servicios/bots-whatsapp')
  })

  it('proyecto con slug compartido', () => {
    expect(switchLocalePath('es', '/proyectos/pyron')).toBe('/en/projects/pyron')
  })

  it('ruta desconocida cae al home del idioma destino', () => {
    expect(switchLocalePath('es', '/xyz')).toBe('/en')
  })
})

it('ruta que empieza con "en" pero no es /en: no se recorta y cae al fallback home es', () => {
  expect(switchLocalePath('en', '/energy')).toBe('/')
})
