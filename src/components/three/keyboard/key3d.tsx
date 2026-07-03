'use client'

import { RoundedBox, Text } from '@react-three/drei'
import type { Group, MeshStandardMaterial } from 'three'
import { KEY_UNIT, type KeyDef } from './layout'
import type { GpuTier } from './quality'

export const KEY_HEIGHT = 0.32

/** Ubicación inmutable de una tecla (mundo + columna, para ripple y barrido). */
export type KeyPlacement = {
  def: KeyDef
  /** Centro de la tecla en unidades de mundo (para falloff de ripple). */
  x: number
  z: number
  /** Centro en unidades de columna (para el barrido teal→naranja). */
  colCenter: number
  /** Backlight teal fijo "respirando" (espejo de las .lit del CSS). */
  lit: boolean
}

type Key3DProps = {
  placement: KeyPlacement
  tier: GpuTier
  /** Registran los nodos mutables en el registry (ref) del padre. */
  onGroup: (id: string, node: Group | null) => void
  onMaterial: (id: string, node: MeshStandardMaterial | null) => void
}

const FONT_URL = '/fonts/sora-600.ttf'

/**
 * Keycap paramétrica: RoundedBox biselada + legenda troika (solo tiers con
 * presupuesto). El material arranca apagado; toda la vida lumínica (respiración,
 * ripple, barrido, press) la maneja el padre en un único useFrame mutando los
 * nodos registrados — nada de React state por frame.
 */
export function Key3D({ placement, tier, onGroup, onMaterial }: Key3DProps) {
  const { def } = placement
  return (
    <group position={[placement.x, 0, placement.z]} ref={(node) => onGroup(def.id, node)}>
      <RoundedBox
        args={[def.w * KEY_UNIT * 0.92, KEY_HEIGHT, KEY_UNIT * 0.92]}
        radius={0.06}
        smoothness={3}
      >
        <meshStandardMaterial
          ref={(node) => onMaterial(def.id, node)}
          color="#122531"
          emissive="#1f7f73"
          emissiveIntensity={0.08}
          roughness={0.38}
          metalness={0.3}
          envMapIntensity={0.8}
        />
      </RoundedBox>
      {def.label !== '' && tier !== 'low' && (
        <Text
          position={[0, KEY_HEIGHT / 2 + 0.012, 0.02]}
          rotation={[-Math.PI / 2, 0, 0]}
          font={FONT_URL}
          fontSize={0.2}
          color={placement.lit ? '#04241f' : '#8ae2d0'}
          anchorX="center"
          anchorY="middle"
        >
          {def.label}
        </Text>
      )}
    </group>
  )
}
