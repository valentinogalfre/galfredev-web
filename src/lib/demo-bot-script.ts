import type { Locale } from '@/types/content'

type Rule = { match: RegExp; reply: { es: string; en: string } }

// El orden importa: la primera regla que matchea gana.
// «plazos» va antes que «precio» («¿cuánto tarda?» no es una pregunta de precio),
// y «precio» antes que «bot» («¿cuánto sale un bot?» pregunta por el precio).
const RULES: Rule[] = [
  { match: /cu[aá]nto (tarda|demora|lleva)|plazos?|entrega|how long|timeline|deadline/i, reply: {
    es: 'Un bot de WhatsApp suele estar andando en 2-3 semanas; una web o sistema a medida depende del alcance. Contame tu caso por WhatsApp y te doy una fecha concreta 👉',
    en: "A WhatsApp bot is usually live in 2-3 weeks; a website or custom system depends on scope. Tell me your case on WhatsApp and I'll give you a concrete date 👉" } },
  { match: /precio|costo|cu[aá]nto|sale|price|cost|how much/i, reply: {
    es: 'Depende del alcance: un bot de WhatsApp arranca más accesible que un sistema a medida. Contame qué necesitás y te paso un rango real por WhatsApp 👉',
    en: "It depends on scope: a WhatsApp bot starts cheaper than a full custom system. Tell me what you need and I'll send you a real range on WhatsApp 👉" } },
  { match: /whatsapp|bot/i, reply: {
    es: 'Armo bots de WhatsApp que atienden consultas, filtran leads y agendan turnos — como este que estás probando. ¿Para qué rubro lo necesitás?',
    en: "I build WhatsApp bots that answer questions, qualify leads and book appointments — like the one you're trying. What industry is it for?" } },
  { match: /web|p[aá]gina|site|landing/i, reply: {
    es: 'Hago webs que venden: rápidas, animadas y con SEO. Esta misma página es la demo 😉 ¿Tenés algo online hoy?',
    en: "I build websites that sell: fast, animated, SEO-ready. This very site is the demo 😉 Do you have something online today?" } },
  { match: /app|aplicaci[oó]n/i, reply: {
    es: 'Desarrollo apps móviles y sistemas web a medida. Pulso, mi app de iOS, está en el portfolio. ¿Qué tenés en mente?',
    en: 'I build mobile apps and custom web systems. Pulso, my iOS app, is in the portfolio. What do you have in mind?' } },
  { match: /automatiza|automation|automate|manual|repetitiv/i, reply: {
    es: 'Automatizo tareas repetitivas con IA: cargar datos, responder consultas, generar reportes. Probá la calculadora de ROI acá arriba y después me contás cuántas horas se van en eso 😉',
    en: 'I automate repetitive tasks with AI: data entry, answering enquiries, generating reports. Try the ROI calculator above and then tell me how many hours go into that 😉' } },
  { match: /hola|buenas|hey|hello|hi/i, reply: {
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
