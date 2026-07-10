/** Límite diario de mensajes live del demo bot por visitante. */
export const DAILY_LIMIT = 15

export function evaluateLimit(currentCount: number): { allowed: boolean; remaining: number } {
  const count = Number.isFinite(currentCount) ? Math.max(0, currentCount) : 0
  const remaining = Math.max(0, DAILY_LIMIT - count)
  return { allowed: remaining > 0, remaining }
}
