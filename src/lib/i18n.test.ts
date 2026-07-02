import { describe, it, expect } from 'vitest'
import { getDictionary, serviceByLocalizedSlug, projectByLocalizedSlug, localizedPath } from './i18n'

describe('getDictionary', () => {
  it('devuelve diccionarios completos para es y en', () => {
    const es = getDictionary('es')
    const en = getDictionary('en')
    expect(es.common.brand).toBe('GalfreDev')
    expect(en.common.brand).toBe('GalfreDev')
    expect(Object.keys(en.services).sort()).toEqual(Object.keys(es.services).sort())
    expect(Object.keys(en.projects).sort()).toEqual(Object.keys(es.projects).sort())
  })
  it('ningún string queda vacío en ningún idioma', () => {
    for (const locale of ['es', 'en'] as const) {
      const walk = (v: unknown, path: string) => {
        if (typeof v === 'string') expect(v.trim(), path).not.toBe('')
        else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
        else if (v && typeof v === 'object')
          Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`))
      }
      walk(getDictionary(locale), locale)
    }
  })
})

describe('slugs localizados', () => {
  it('resuelve servicio por slug en cada idioma', () => {
    expect(serviceByLocalizedSlug('es', 'bots-whatsapp')?.id).toBe('bots-whatsapp')
    expect(serviceByLocalizedSlug('en', 'whatsapp-bots')?.id).toBe('bots-whatsapp')
    expect(serviceByLocalizedSlug('es', 'no-existe')).toBeUndefined()
  })
  it('resuelve proyecto por slug', () => {
    expect(projectByLocalizedSlug('es', 'pyron')?.id).toBe('pyron')
  })
})

describe('localizedPath', () => {
  it('arma rutas con prefijo /en solo para inglés', () => {
    expect(localizedPath('es', '/proyectos')).toBe('/proyectos')
    expect(localizedPath('en', '/projects')).toBe('/en/projects')
    expect(localizedPath('en', '/')).toBe('/en')
  })
})
