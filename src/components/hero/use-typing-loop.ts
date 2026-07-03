'use client'
import { useEffect, useRef, useState } from 'react'

export type TypingState = {
  word: string
  typed: string
  pressedKey: string | null
  wordIndex: number
}

const TYPO_RATE = 0.06

export function useTypingLoop(words: string[], opts?: { paused?: boolean }): TypingState {
  const [state, setState] = useState<TypingState>({ word: words[0], typed: '', pressedKey: null, wordIndex: 0 })
  const ref = useRef({ i: 0, pos: 0, phase: 'typing' as 'typing' | 'holding' | 'deleting', typoAt: -1 })
  useEffect(() => {
    if (opts?.paused) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Con reduced-motion el loop no corre: se fija la palabra completa una única vez.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduced) { setState({ word: words[0], typed: words[0], pressedKey: null, wordIndex: 0 }); return }
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const r = ref.current
      const word = words[r.i % words.length]
      let delay = 90 + Math.random() * 120
      if (r.phase === 'typing') {
        if (r.typoAt === -1 && r.pos > 1 && r.pos < word.length - 1 && Math.random() < TYPO_RATE) {
          r.typoAt = r.pos
          setState({ word, typed: word.slice(0, r.pos) + '·', pressedKey: '·', wordIndex: r.i % words.length })
        } else if (r.typoAt !== -1) {
          r.typoAt = -1
          setState({ word, typed: word.slice(0, r.pos), pressedKey: 'BACKSPACE', wordIndex: r.i % words.length })
          delay = 180
        } else {
          r.pos += 1
          const ch = word[r.pos - 1]
          setState({ word, typed: word.slice(0, r.pos), pressedKey: ch, wordIndex: r.i % words.length })
          if (r.pos >= word.length) { r.phase = 'holding'; delay = 1600 }
        }
      } else if (r.phase === 'holding') {
        r.phase = 'deleting'; delay = 60
      } else {
        r.pos -= 1
        setState({ word, typed: word.slice(0, r.pos), pressedKey: 'BACKSPACE', wordIndex: r.i % words.length })
        delay = 45
        if (r.pos <= 0) { r.phase = 'typing'; r.i += 1; delay = 500 }
      }
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 600)
    return () => clearTimeout(timer)
  }, [words, opts?.paused])
  return state
}
