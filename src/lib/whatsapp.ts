/** Brazilian phone helpers for WhatsApp deep links. */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Normalize a BR phone to digits with country code 55 when possible.
 * Returns null when too short/invalid for wa.me.
 */
export function normalizePhoneBr(phone: string): string | null {
  let digits = digitsOnly(phone)
  if (!digits) {
    return null
  }
  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits.slice(0, 13)
  }
  // local mobile with leading 0: 04199999...
  if (digits.startsWith('0') && digits.length >= 11) {
    digits = digits.slice(1)
  }
  // DDD + number (10 landline or 11 mobile)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  if (digits.length >= 12 && digits.length <= 13) {
    return digits
  }
  return null
}

/** Build https://wa.me/<digits>?text=... or null if phone is invalid. */
export function buildWhatsAppUrl(
  phone: string,
  message = '',
): string | null {
  const normalized = normalizePhoneBr(phone)
  if (!normalized) {
    return null
  }
  const base = `https://wa.me/${normalized}`
  const text = message.trim()
  if (!text) {
    return base
  }
  return `${base}?text=${encodeURIComponent(text)}`
}

/** Short prefill: brand + company name (+ city/UF when known). No invented HQ. */
export function defaultWhatsAppMessage(
  companyName: string,
  city = '',
  uf = '',
): string {
  const name = companyName.trim() || 'a empresa'
  const place = [city.trim(), uf.trim()].filter(Boolean).join('/')
  const where = place ? ` (${place})` : ''
  return `Olá! Aqui é da Finamob Curitiba. Gostaria de falar com alguém de ${name}${where} sobre funding imobiliário.`
}
