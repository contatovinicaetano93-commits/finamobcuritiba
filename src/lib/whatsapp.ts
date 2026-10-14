import { partnerById, type PartnerId } from '@/data/admin'

/** Brazilian phone helpers for WhatsApp deep links. */

export type WhatsAppPhoneKind = 'mobile' | 'landline' | 'invalid'

export type WhatsAppPhoneResolution = {
  /** Digits for wa.me (country code + DDD + local), or null when unusable. */
  digits: string | null
  kind: WhatsAppPhoneKind
  /** True when we inserted the mobile 9th digit on an 8-digit local number. */
  addedNinthDigit: boolean
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Normalize to 55 + DDD + local (10 or 11 national digits → 12/13 with 55). */
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

/**
 * Resolve the best WhatsApp target for a BR number.
 * Celular antigo com 8 dígitos (local 6–9): insere o 9 após o DDD.
 * Fixo (local 2–5): mantém e marca como possível sem WhatsApp.
 */
export function resolveWhatsAppPhoneBr(phone: string): WhatsAppPhoneResolution {
  const base = normalizePhoneBr(phone)
  if (!base || !base.startsWith('55') || base.length < 12) {
    return { digits: null, kind: 'invalid', addedNinthDigit: false }
  }

  const ddd = base.slice(2, 4)
  const local = base.slice(4)

  if (local.length === 9 && local.startsWith('9')) {
    return { digits: base.slice(0, 13), kind: 'mobile', addedNinthDigit: false }
  }

  if (local.length === 8) {
    const head = local.charAt(0)
    // Old mobile locals typically started with 6–9; landlines with 2–5.
    if (head >= '6' && head <= '9') {
      return {
        digits: `55${ddd}9${local}`,
        kind: 'mobile',
        addedNinthDigit: true,
      }
    }
    return { digits: base, kind: 'landline', addedNinthDigit: false }
  }

  if (local.length === 9) {
    return { digits: base.slice(0, 13), kind: 'landline', addedNinthDigit: false }
  }

  return { digits: base, kind: 'mobile', addedNinthDigit: false }
}

export function buildWhatsAppUrl(phone: string, message = ''): string | null {
  const { digits } = resolveWhatsAppPhoneBr(phone)
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  const text = message.trim()
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/** Short UI hint under the WhatsApp action. */
export function whatsAppPhoneHint(phone: string): string | null {
  const resolved = resolveWhatsAppPhoneBr(phone)
  switch (resolved.kind) {
    case 'invalid':
      return 'Sem telefone válido para WhatsApp.'
    case 'landline':
      return 'Possível sem WhatsApp (fix).'
    case 'mobile':
      return resolved.addedNinthDigit
        ? 'Abrindo com 9º dígito (celular de 8 dígitos no CRM).'
        : null
    default: {
      const exhaustive: never = resolved.kind
      return exhaustive
    }
  }
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
