import type { Locale } from '@/types/content'

type Rule = { match: RegExp; reply: { es: string; en: string } }

// Límites de palabra con soporte Unicode (\b de JS es solo ASCII y no ve la
// «á» de «aplicación» como letra). `word` exige palabra completa (hi, app,
// bot: si no, «this», «happy» y «bottom» disparaban respuestas); `stem` solo
// ancla el inicio para aceptar plurales y derivados (webs, website, automatización).
const NOT_LETTER_BEFORE = '(?<![\\p{L}\\p{N}])'
const NOT_LETTER_AFTER = '(?![\\p{L}\\p{N}])'
const word = (...alternatives: string[]) =>
  `${NOT_LETTER_BEFORE}(?:${alternatives.join('|')})${NOT_LETTER_AFTER}`
const stem = (...alternatives: string[]) => `${NOT_LETTER_BEFORE}(?:${alternatives.join('|')})`
const keywords = (...patterns: string[]) => new RegExp(patterns.join('|'), 'iu')

// El orden importa: la primera regla que matchea gana.
// «plazos» va antes que «precio» («¿cuánto tarda?» no es una pregunta de precio),
// y «precio» antes que «bot» («¿cuánto sale un bot?» pregunta por el precio).
const RULES: Rule[] = [
  { match: keywords(word('cu[aá]nto (?:tarda|demora|lleva)', 'plazos?', 'how long'), stem('entreg', 'timeline', 'deadline')), reply: {
    es: 'Un bot de WhatsApp suele estar andando en 2-3 semanas; una web o sistema a medida depende del alcance. Contame tu caso por WhatsApp y te doy una fecha concreta 👉',
    en: "A WhatsApp bot is usually live in 2-3 weeks; a website or custom system depends on scope. Tell me your case on WhatsApp and I'll give you a concrete date 👉" } },
  { match: keywords(word('cu[aá]nto', 'sale', 'caro', 'cara', 'how much'), stem('precio', 'costo', 'cuesta', 'presupuest', 'cotiz', 'pric', 'cost', 'expensive', 'budget', 'quote')), reply: {
    es: 'Depende del alcance: un bot de WhatsApp arranca más accesible que un sistema a medida. Contame qué necesitás y te paso un rango real por WhatsApp 👉',
    en: "It depends on scope: a WhatsApp bot starts cheaper than a full custom system. Tell me what you need and I'll send you a real range on WhatsApp 👉" } },
  { match: keywords(word('bots?', 'chatbots?'), stem('whatsapp')), reply: {
    es: 'Armo bots de WhatsApp que atienden consultas, filtran leads y agendan turnos — como este que estás probando. ¿Para qué rubro lo necesitás?',
    en: "I build WhatsApp bots that answer questions, qualify leads and book appointments — like the one you're trying. What industry is it for?" } },
  { match: keywords(word('sites?', 'sitios?'), stem('web', 'p[aá]gina', 'landing')), reply: {
    es: 'Hago webs que venden: rápidas, animadas y con SEO. Esta misma página es la demo 😉 ¿Tenés algo online hoy?',
    en: "I build websites that sell: fast, animated, SEO-ready. This very site is the demo 😉 Do you have something online today?" } },
  { match: keywords(word('apps?'), stem('aplicaci[oó]n', 'aplicaciones', 'application')), reply: {
    es: 'Desarrollo apps móviles y sistemas web a medida. Pulso, mi app de iOS, está en el portfolio. ¿Qué tenés en mente?',
    en: 'I build mobile apps and custom web systems. Pulso, my iOS app, is in the portfolio. What do you have in mind?' } },
  { match: keywords(stem('automat', 'manual', 'repetitiv')), reply: {
    es: 'Automatizo tareas repetitivas con IA: cargar datos, responder consultas, generar reportes. Probá la calculadora de ROI acá arriba y después me contás cuántas horas se van en eso 😉',
    en: 'I automate repetitive tasks with AI: data entry, answering enquiries, generating reports. Try the ROI calculator above and then tell me how many hours go into that 😉' } },
  { match: keywords(word('hola', 'buenas', 'buen d[ií]a', 'hey', 'hello', 'hi')), reply: {
    es: '¡Hola! 👋 Soy el asistente de GalfreDev. Preguntame por bots de WhatsApp, webs, apps o automatizaciones — o contame qué problema tiene tu negocio.',
    en: "Hey! 👋 I'm GalfreDev's assistant. Ask me about WhatsApp bots, websites, apps or automations — or tell me what problem your business has." } },
]

const FALLBACK = {
  es: 'Buena pregunta 👌 Para darte una respuesta en serio, mejor seguimos por WhatsApp — tocá el botón verde y te respondo en el día.',
  en: "Good question 👌 To answer properly, let's continue on WhatsApp — tap the green button and I'll reply today.",
}

export function scriptedReply(locale: Locale, userText: string): string {
  return (RULES.find((r) => r.match.test(userText))?.reply ?? FALLBACK)[locale]
}
