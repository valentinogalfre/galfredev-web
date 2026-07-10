'use client'

import { UserAvatar } from '@/components/layout/user-avatar'
import { deriveInitials } from '@/lib/profile'
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useId, useRef, useState } from 'react'

type AvatarUploaderProps = {
  value: string
  displayName: string
  fallbackAvatarUrl?: string | null
  onChange: (value: string) => void
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('La imagen no es válida.'))
    image.src = src
  })
}

async function optimizeAvatar(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Subí una imagen válida en PNG, JPG o WEBP.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen es muy pesada. Usá un archivo menor a 5 MB.')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)
  const maxSize = 320
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('No se pudo preparar la imagen.')
  }

  context.drawImage(image, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/webp', 0.9)

  if (dataUrl.length > 220_000) {
    throw new Error('La imagen sigue siendo muy pesada. Probá con una más liviana.')
  }

  return dataUrl
}

export function AvatarUploader({
  value,
  displayName,
  fallbackAvatarUrl,
  onChange,
}: AvatarUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const previewValue = value || fallbackAvatarUrl || ''

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const optimized = await optimizeAvatar(file)
      onChange(optimized)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'No se pudo procesar la imagen.',
      )
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="rounded-[1.7rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar
          user={{
            avatarUrl: previewValue || null,
            displayName,
            initials: deriveInitials(displayName),
          }}
          size="lg"
        />

        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-white">Avatar o logo</p>
            <p className="text-sm leading-6 text-white/56">
              Podés subir una foto personal o el logo de tu empresa. Si no cargás nada,
              mostramos un avatar limpio con tus iniciales.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.12)] px-4 py-2 text-sm text-[#8ceada] transition duration-300 hover:border-[rgba(61,221,196,0.45)] hover:bg-[rgba(31,127,115,0.2)] hover:text-white"
            >
              {loading ? <LoaderCircle size={16} aria-hidden className="animate-spin" /> : <ImagePlus size={16} aria-hidden />}
              {previewValue ? 'Cambiar imagen' : 'Subir imagen'}
            </button>

            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-4 py-2 text-sm text-white/66 transition duration-300 hover:border-white/24 hover:text-white"
              >
                <Trash2 size={16} aria-hidden />
                Quitar imagen
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
    </div>
  )
}
