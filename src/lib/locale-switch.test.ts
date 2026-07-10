import { describe, it, expect } from 'vitest'
import { buildLocaleSwitchMap, switchLocalePath } from './locale-switch'
import { switchByMap } from './route-pairs'

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

// Contrato del de-bloat: el switcher del cliente resuelve con un mapa plano
// computado server-side (sin cargar diccionarios en el bundle). El mapa debe
// ser equivalente a la referencia switchLocalePath y cubrir todas las rutas.
describe('buildLocaleSwitchMap + switchByMap', () => {
  const map = buildLocaleSwitchMap()

  it('cubre home + estáticas + servicios + proyectos en ambos idiomas (24 entradas)', () => {
    expect(Object.keys(map)).toHaveLength(24)
    expect(map['/']).toBe('/en')
    expect(map['/en']).toBe('/')
    expect(map['/proyectos']).toBe('/en/projects')
    expect(map['/servicios/bots-whatsapp']).toBe('/en/services/whatsapp-bots')
    expect(map['/en/services/whatsapp-bots']).toBe('/servicios/bots-whatsapp')
  })

  it('es↔en es involutivo: la equivalente de la equivalente es la ruta original', () => {
    for (const [from, to] of Object.entries(map)) {
      expect(map[to]).toBe(from)
    }
  })

  it('cada entrada coincide con la referencia server-side switchLocalePath', () => {
    for (const [from, to] of Object.entries(map)) {
      const locale = from === '/en' || from.startsWith('/en/') ? 'en' : 'es'
      expect(switchLocalePath(locale, from)).toBe(to)
      expect(switchByMap(map, from, locale === 'es' ? '/en' : '/')).toBe(to)
    }
  })

  it('ruta desconocida cae al home del idioma destino', () => {
    expect(switchByMap(map, '/xyz', '/en')).toBe('/en')
    expect(switchByMap(map, '/en/xyz', '/')).toBe('/')
  })
})
