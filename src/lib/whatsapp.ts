import { partnerById, type PartnerId } from '@/data/admin'

/** Brazilian phone helpers for WhatsApp deep links. */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizePhoneBr(phone: string): string | null {
  let digits = digitsOnly(phone)
  if (!digits) return null
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('55') && digits.length >= 12) return digits.slice(0, 13)
  if (digits.startsWith('0') && digits.length >= 11) digits = digits.slice(1)
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if (digits.length >= 12 && digits.length <= 13) return digits
  return null
}

export function buildWhatsAppUrl(phone: string, message = ''): string | null {
  const normalized = normalizePhoneBr(phone)
  if (!normalized) return null
  const base = `https://wa.me/${normalized}`
  const text = message.trim()
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/** Activation opener personalized with the logged-in partner. */
export function defaultWhatsAppMessage(partnerId: PartnerId): string {
  const name = partnerById(partnerId).introName
  return [
    `Olá, tudo bem? Sou o ${name}, da Finamob Curitiba.`,
    '',
    'Conectamos incorporadoras a uma rede de mais de 200 fundos de investimento, buscando soluções de capital para financiar obras e viabilizar novos empreendimentos.',
    '',
    'Gostaria de conhecer os projetos de vocês e avaliar alternativas de financiamento alinhadas à fase e à necessidade de cada empreendimento.',
    '',
    'Podemos agendar uma conversa breve? Se esse assunto estiver com outra pessoa, poderia me indicar quem cuida da captação de recursos?',
  ].join('\n')
}
