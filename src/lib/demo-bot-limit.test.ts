import { describe, it, expect } from 'vitest'
import { evaluateLimit, DAILY_LIMIT } from './demo-bot-limit'

describe('evaluateLimit', () => {
  it('permite bajo el límite y reporta restantes', () => {
    expect(evaluateLimit(0)).toEqual({ allowed: true, remaining: DAILY_LIMIT })
    expect(evaluateLimit(DAILY_LIMIT - 1)).toEqual({ allowed: true, remaining: 1 })
  })
  it('bloquea al llegar al límite', () => {
    expect(evaluateLimit(DAILY_LIMIT)).toEqual({ allowed: false, remaining: 0 })
    expect(evaluateLimit(DAILY_LIMIT + 5)).toEqual({ allowed: false, remaining: 0 })
  })
  it('tolera counts negativos o raros', () => {
    expect(evaluateLimit(-1)).toEqual({ allowed: true, remaining: DAILY_LIMIT })
    expect(evaluateLimit(Number.NaN)).toEqual({ allowed: true, remaining: DAILY_LIMIT })
  })
})
