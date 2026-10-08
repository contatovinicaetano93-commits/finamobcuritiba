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

export function defaultWhatsAppMessage(companyName: string, city = '', uf = ''): string {
  const place = [city, uf].filter(Boolean).join('/')
  const where = place ? ` (${place})` : ''
  return `Olá! Aqui é da Finamob Curitiba. Gostaria de falar com alguém de ${companyName.trim()}${where} sobre funding imobiliário.`
}
