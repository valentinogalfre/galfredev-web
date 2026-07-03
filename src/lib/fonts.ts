import { Instrument_Serif, Sora } from 'next/font/google'

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const fontVariables = `${sora.variable} ${instrumentSerif.variable}`
