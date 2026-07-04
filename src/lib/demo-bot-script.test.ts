import { describe, it, expect } from 'vitest'
import { scriptedReply } from './demo-bot-script'

// Contrato: el motor guionado elige la regla correcta según prioridad
// (plazos > precio > bot > web > app > automatización > saludo > fallback).
describe('scriptedReply', () => {
  it('precio gana sobre bot («cuánto sale un bot»)', () => {
    expect(scriptedReply('es', 'cuánto sale un bot de whatsapp?')).toMatch(/rango real por WhatsApp/)
    expect(scriptedReply('en', 'how much is a whatsapp bot?')).toMatch(/real range on WhatsApp/)
  })

  it('plazos gana sobre precio («cuánto tarda»)', () => {
    expect(scriptedReply('es', '¿Cuánto tarda un proyecto?')).toMatch(/2-3 semanas/)
    expect(scriptedReply('en', 'how long does it take?')).toMatch(/2-3 weeks/)
  })

  it('bot responde con el pitch de bots', () => {
    expect(scriptedReply('es', '¿Qué hace un bot?')).toMatch(/filtran leads/)
    expect(scriptedReply('en', 'What can a bot do?')).toMatch(/qualify leads/)
  })

  it('web matchea web/página/site', () => {
    expect(scriptedReply('es', 'Quiero una web')).toMatch(/webs que venden/)
    expect(scriptedReply('en', 'I want a website')).toMatch(/websites that sell/)
  })

  it('automatización tiene regla propia (no cae al fallback)', () => {
    expect(scriptedReply('es', 'necesito automatizar tareas')).toMatch(/tareas repetitivas/)
    expect(scriptedReply('en', 'can you automate my reports?')).toMatch(/repetitive tasks/)
  })

  it('saludo simple responde con la bienvenida', () => {
    expect(scriptedReply('es', 'hola!')).toMatch(/asistente de GalfreDev/)
  })

  it('texto sin match cae al fallback que deriva a WhatsApp', () => {
    expect(scriptedReply('es', 'me gusta el fútbol')).toMatch(/seguimos por WhatsApp/)
    expect(scriptedReply('en', 'I enjoy soccer')).toMatch(/continue on WhatsApp/)
  })
})
