/**
 * Capa LIVIANA del switcher de idioma para el bundle cliente: este módulo no
 * importa contenido ni diccionarios (a diferencia de lib/locale-switch.ts).
 * El mapa de pares de rutas es↔en se computa server-side (ver
 * buildLocaleSwitchMap en lib/locale-switch.ts) y llega como prop plana.
 */
export type SwitchMap = Record<string, string>

/** Lookup exacto de la ruta equivalente en el otro idioma; fallback: home destino. */
export function switchByMap(map: SwitchMap, pathname: string, targetHome: string): string {
  return map[pathname] ?? targetHome
}
