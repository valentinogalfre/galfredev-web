'use client'

import type { TypingState } from '@/components/hero/use-typing-loop'
import { ContactShadows, Environment, Float } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { AdditiveBlending, CanvasTexture, type Group } from 'three'
import { KeyboardModel } from './keyboard-model'
import type { GpuTier } from './quality'

/**
 * Halo teal difuso bajo el teclado (equivalente WebGL del deck::after del CSS):
 * plano con gradiente radial generado en canvas, blending aditivo.
 */
function UnderGlow() {
  const texture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(42, 145, 132, 0.28)')
    g.addColorStop(0.35, 'rgba(31, 127, 115, 0.16)')
    g.addColorStop(0.65, 'rgba(31, 127, 115, 0.06)')
    g.addColorStop(0.88, 'rgba(31, 127, 115, 0.012)')
    g.addColorStop(1, 'rgba(31, 127, 115, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new CanvasTexture(canvas)
  }, [])
  if (!texture) return null
  return (
    <mesh position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[9.5, 6.5, 1]}>
      <planeGeometry />
      <meshBasicMaterial
        map={texture}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Pose + escala responsiva del teclado: el ancho del canvas define la escala
 * (equivalente al --kb-scale del CSS: chico en mobile, 1.08 en desktop).
 */
function KeyboardRig({ children }: { children: ReactNode }) {
  const width = useThree((s) => s.size.width)
  const scale = Math.min(1.08, Math.max(0.8, width / 760))
  return (
    <group rotation={[0.1, 0.3, 0.02]} position={[0, -0.16, 0]} scale={scale}>
      {children}
    </group>
  )
}

/**
 * Avisa arriba cuando la escena ya cargó sus assets (fonts + HDR: vive dentro
 * del Suspense) y renderizó su primer frame — dispara el crossfade CSS→WebGL.
 */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    if (onReady) setTimeout(onReady, 0)
  })
  return null
}

/**
 * Parallax al mouse (solo pointer 'mouse'; en touch el gesto equivalente es el
 * tap-wave del modelo): lerp de la rotación del grupo hacia el puntero
 * normalizado, máx ~4°.
 */
function MouseParallax({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null)
  const target = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const max = 0.07 // ~4°
    const k = 1 - Math.exp(-delta * 4)
    g.rotation.y += (target.current.x * max - g.rotation.y) * k
    g.rotation.x += (target.current.y * max * 0.55 - g.rotation.x) * k
  })
  return <group ref={group}>{children}</group>
}

type KeyboardSceneProps = {
  typing: TypingState
  tier: GpuTier
  egg?: boolean
  onReady?: () => void
  /** Contexto WebGL perdido en runtime: el orquestador vuelve al teclado CSS. */
  onContextLost?: () => void
}

/**
 * Escena WebGL del teclado: versión premium del teclado CSS aprobado — mismo
 * encuadre teal, pero con profundidad real, reflejos metálicos y sombra de
 * contacto. Fondo transparente: el glow/grid del hero CSS queda detrás.
 */
export function KeyboardScene({ typing, tier, egg = false, onReady, onContextLost }: KeyboardSceneProps) {
  return (
    <Canvas
      dpr={[1, tier === 'high' ? 2 : 1.5]}
      camera={{ position: [0, 5.2, 6.5], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, -0.2, 0)
        // `once`: al primer context lost el padre desmonta este Canvas entero,
        // así que no hay listener que sacar después (muere con el elemento).
        if (onContextLost) {
          gl.domElement.addEventListener('webglcontextlost', () => onContextLost(), { once: true })
        }
      }}
    >
      <ambientLight intensity={0.35} color="#12303a" />
      <pointLight position={[3.5, 4.5, 2.5]} intensity={44} color="#3dddc4" />
      <pointLight position={[-4.5, 1.4, 3.5]} intensity={11} color="#ffb46a" />
      <Suspense fallback={null}>
        <MouseParallax>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
            {/* Pose equivalente al CSS aprobado (rotateX 56° rotateZ -14°):
                cámara elevada + yaw del grupo. */}
            <KeyboardRig>
              <KeyboardModel typing={typing} tier={tier} egg={egg} />
              <UnderGlow />
            </KeyboardRig>
          </Float>
        </MouseParallax>
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.62}
          scale={13}
          blur={2.4}
          far={3.2}
          color="#02070a"
        />
        <Environment files="/hdr/city.hdr" />
        <ReadySignal onReady={onReady} />
      </Suspense>
      {tier === 'high' && (
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.45} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
