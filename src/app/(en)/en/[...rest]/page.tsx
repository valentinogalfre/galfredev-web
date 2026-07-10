import { notFound } from 'next/navigation'

// Catch-all: URLs bajo /en sin ruta real caen al not-found del group (en)
// (lang="en"); sin esto ganaba el fallback global en español.
export default function EnCatchAll() {
  notFound()
}
