/** alternates.languages para una página con equivalente en ambos idiomas.
 *  esPath/enPath SIN prefijo de locale (el de en se prefija acá). */
export function hreflangAlternates(esPath: string, enPath: string) {
  return {
    languages: {
      'es-AR': esPath,
      en: enPath === '/' ? '/en' : `/en${enPath}`,
      'x-default': esPath,
    },
  }
}
