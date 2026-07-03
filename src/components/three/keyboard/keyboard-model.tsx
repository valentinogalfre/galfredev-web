'use client'

import type { TypingState } from '@/components/hero/use-typing-loop'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Color, type Group, type MeshStandardMaterial } from 'three'
import { KEY_HEIGHT, Key3D, type KeyPlacement } from './key3d'
import { BOARD_COLS, KEYS, KEY_UNIT } from './layout'
import type { GpuTier } from './quality'

/** Teclas con backlight teal fijo "respirando" (espejo de las .lit del CSS). */
const LIT_IDS = new Set(['W', 'S', 'A', 'P', 'E', 'ENTER', 'SPACE', 'GD'])

const ROW_COUNT = 5
const PAD = 0.42
const CASE_W = BOARD_COLS * KEY_UNIT + PAD * 2
const CASE_D = ROW_COUNT * KEY_UNIT + PAD * 2
const CASE_H = 0.34

/** Colores compartidos solo de lectura: nada de `new Color()` en el useFrame. */
const TEAL = new Color('#1f7f73')
const TEAL_HOT = new Color('#3dddc4')
const WARM = new Color('#ffb46a')

const SWEEP_PERIOD = 9 // s entre barridos teal→naranja
const SWEEP_TRAVEL = 2.4 // s que tarda la franja en cruzar el board
const RIPPLE_LIFE = 0.45 // s de vida de cada onda
const RIPPLE_RADIUS = 2.2 // teclas
const PRESS_HOLD = 0.13 // s que la tecla queda hundida
const PRESS_TRAVEL = 0.12

type Ripple = { x: number; z: number; t0: number }
type KeyNodes = { group: Group | null; material: MeshStandardMaterial | null }

function resolveKeyId(pressedKey: string | null): string | null {
  if (!pressedKey) return null
  if (pressedKey === ' ') return 'SPACE'
  return pressedKey.toUpperCase()
}

type KeyboardModelProps = {
  typing: TypingState
  tier: GpuTier
}

/**
 * Teclado paramétrico completo: carcasa símil aluminio + plancha emisiva +
 * keycaps. TODA la animación (respiración, ripple, barrido, press) vive en un
 * solo useFrame que muta los nodos del registry — React no re-renderiza por frame.
 */
export function KeyboardModel({ typing, tier }: KeyboardModelProps) {
  // Ubicaciones inmutables: cada fila centrada (como un teclado real
  // estilizado); el falloff del ripple usa estas mismas coordenadas.
  const placements = useMemo<KeyPlacement[]>(() => {
    const rowWidths = new Map<number, number>()
    for (const k of KEYS) rowWidths.set(k.row, Math.max(rowWidths.get(k.row) ?? 0, k.col + k.w))
    return KEYS.map((def) => {
      const rowW = rowWidths.get(def.row) ?? BOARD_COLS
      const colCenter = def.col + def.w / 2
      return {
        def,
        x: (colCenter - rowW / 2) * KEY_UNIT,
        z: (def.row - (ROW_COUNT - 1) / 2) * KEY_UNIT,
        colCenter,
        lit: LIT_IDS.has(def.id),
      }
    })
  }, [])

  // Extensión (en unidades de mundo) de cada fila para las tiras de backlight.
  const rowStrips = useMemo(() => {
    const widths = new Map<number, number>()
    for (const k of KEYS) widths.set(k.row, Math.max(widths.get(k.row) ?? 0, k.col + k.w))
    return Array.from(widths.entries()).map(([row, w]) => ({
      row,
      width: w * KEY_UNIT + 0.06,
      z: (row - (ROW_COUNT - 1) / 2) * KEY_UNIT,
    }))
  }, [])

  // Registry mutable de nodos three (fuera del modelo de datos de React).
  const registry = useRef(new Map<string, KeyNodes>())
  const nodesFor = (id: string): KeyNodes => {
    let entry = registry.current.get(id)
    if (!entry) {
      entry = { group: null, material: null }
      registry.current.set(id, entry)
    }
    return entry
  }
  const onGroup = useCallback((id: string, node: Group | null) => {
    nodesFor(id).group = node
  }, [])
  const onMaterial = useCallback((id: string, node: MeshStandardMaterial | null) => {
    nodesFor(id).material = node
  }, [])

  const plateMats = useRef<(MeshStandardMaterial | null)[]>([])
  const ripples = useRef<Ripple[]>([])
  const press = useRef<{ id: string | null; at: number }>({ id: null, at: -1 })
  const clockNow = useRef(0)
  const tmpColor = useRef(new Color())

  // Cada tick del loop de tipeo crea un objeto TypingState nuevo → un efecto
  // por identidad detecta cada pulsación (aunque repita el mismo carácter).
  useEffect(() => {
    const id = resolveKeyId(typing.pressedKey)
    if (!id) return
    const placement = placements.find((k) => k.def.id === id)
    if (!placement) return
    press.current = { id, at: clockNow.current }
    ripples.current.push({ x: placement.x, z: placement.z, t0: clockNow.current })
    if (ripples.current.length > 10) ripples.current.shift()
  }, [typing, placements])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    clockNow.current = t

    // Franja del barrido en unidades de columna (arranca fuera del board).
    const sweepAge = t % SWEEP_PERIOD
    const sweepPos = (sweepAge / SWEEP_TRAVEL) * (BOARD_COLS + 6) - 3
    const sweeping = sweepAge < SWEEP_TRAVEL

    ripples.current = ripples.current.filter((r) => t - r.t0 < RIPPLE_LIFE)
    const pressActive = press.current.id !== null && t - press.current.at < PRESS_HOLD

    for (const p of placements) {
      const nodes = registry.current.get(p.def.id)
      if (!nodes?.group || !nodes.material) continue
      const { group, material } = nodes
      const phase = p.def.row * 2.1 + p.def.col * 0.55

      // 1) Respiración base (seno global; las lit con piso mucho más alto).
      let intensity = p.lit
        ? 0.7 + 0.3 * Math.sin(t * 1.7 + phase)
        : 0.07 + 0.035 * Math.sin(t * 1.7 + phase)

      // 2) Ripple: falloff gaussiano en distancia y decaimiento temporal.
      for (const r of ripples.current) {
        const age = t - r.t0
        const dx = (p.x - r.x) / KEY_UNIT
        const dz = (p.z - r.z) / KEY_UNIT
        const d2 = dx * dx + dz * dz
        intensity +=
          1.25 *
          Math.exp(-d2 / (RIPPLE_RADIUS * RIPPLE_RADIUS * 0.55)) *
          Math.exp(-age / (RIPPLE_LIFE * 0.4))
      }

      // 3) Barrido teal→naranja recorriendo columnas (offset temporal por col).
      let sweep = 0
      if (sweeping) {
        const sd = p.colCenter - sweepPos
        sweep = Math.exp(-(sd * sd) / 2.6)
      }
      if (sweep > 0.01) {
        tmpColor.current.lerpColors(TEAL, WARM, sweep)
        material.emissive.copy(tmpColor.current)
        intensity += sweep * 0.9
      } else {
        material.emissive.copy(p.lit ? TEAL_HOT : TEAL)
      }

      // 4) Press: hundimiento con bajada rápida y retorno suave.
      const isPressed = pressActive && press.current.id === p.def.id
      const targetY = isPressed ? -PRESS_TRAVEL : 0
      const k = 1 - Math.exp(-delta * (isPressed ? 34 : 11))
      group.position.y += (targetY - group.position.y) * k
      if (isPressed) {
        material.emissive.copy(TEAL_HOT)
        intensity += 1.4
      }

      material.emissiveIntensity = Math.min(intensity, 1.7)
    }

    const plateGlow = 0.42 + 0.18 * Math.sin(t * 1.7)
    for (const mat of plateMats.current) {
      if (mat) mat.emissiveIntensity = plateGlow
    }
  })

  return (
    <group>
      {/* Carcasa símil aluminio, cantos pulidos. */}
      <RoundedBox
        args={[CASE_W, CASE_H, CASE_D]}
        radius={0.1}
        smoothness={4}
        position={[0, -KEY_HEIGHT / 2 - CASE_H / 2 + 0.1, 0]}
      >
        <meshStandardMaterial
          color="#0e1c26"
          metalness={0.85}
          roughness={0.3}
          envMapIntensity={1.4}
        />
      </RoundedBox>
      {/* Tiras emisivas bajo cada fila (por encima del techo de la carcasa,
          y = -0.05 > -0.06): backlight teal que asoma solo por los gaps entre
          keycaps, dejando ver el bisel de aluminio alrededor. */}
      {rowStrips.map((strip, i) => (
        <mesh key={strip.row} position={[0, -0.05, strip.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[strip.width, KEY_UNIT * 0.98]} />
          <meshStandardMaterial
            ref={(node) => {
              plateMats.current[i] = node
            }}
            color="#000000"
            emissive="#1f7f73"
            emissiveIntensity={0.42}
            roughness={0.9}
            metalness={0}
            envMapIntensity={0.1}
          />
        </mesh>
      ))}
      {placements.map((placement) => (
        <Key3D
          key={placement.def.id}
          placement={placement}
          tier={tier}
          onGroup={onGroup}
          onMaterial={onMaterial}
        />
      ))}
    </group>
  )
}
