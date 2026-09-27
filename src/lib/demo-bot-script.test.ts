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

// Contrato: las palabras clave matchean palabras, no fragmentos. «hi» dentro
// de «this»/«chica» o «app» dentro de «happy» no pueden disparar respuestas
// equivocadas (es el camino vivo del chat mientras no haya API key).
describe('scriptedReply · límites de palabra', () => {
  it('«this»/«chica» no son un saludo', () => {
    expect(scriptedReply('en', 'Is this for small shops?')).not.toMatch(/GalfreDev's assistant/)
    expect(scriptedReply('es', 'Tengo una tienda chica')).not.toMatch(/asistente de GalfreDev/)
  })

  it('«happy» no es una pregunta sobre apps', () => {
    expect(scriptedReply('en', 'I am happy')).toMatch(/continue on WhatsApp/)
  })

  it('«bottom» no es un bot', () => {
    expect(scriptedReply('en', 'bottom line?')).toMatch(/continue on WhatsApp/)
  })

  it('las formas derivadas siguen matcheando (plurales, acentos, compuestas)', () => {
    expect(scriptedReply('es', 'Necesito bots para mi negocio')).toMatch(/filtran leads/)
    expect(scriptedReply('en', 'We need a new website')).toMatch(/websites that sell/)
    expect(scriptedReply('es', 'Quiero una aplicación')).toMatch(/apps móviles/)
    expect(scriptedReply('en', 'Do you build apps?')).toMatch(/mobile apps/)
    expect(scriptedReply('es', 'Busco automatización de reportes')).toMatch(/tareas repetitivas/)
    expect(scriptedReply('es', 'Hola, buen día')).toMatch(/asistente de GalfreDev/)
  })

  it('«caro»/«expensive» son preguntas de precio', () => {
    expect(scriptedReply('es', '¿Es caro?')).toMatch(/rango real por WhatsApp/)
    expect(scriptedReply('en', 'Is this expensive?')).toMatch(/real range on WhatsApp/)
  })
})
