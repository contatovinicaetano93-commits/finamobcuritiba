import { parseRemoteCrmPayload } from '@/lib/admin-store'
import type { AdminBoard } from '@/data/admin'

const CONFIG_KEY = 'finamob-curitiba-crm-api-v1'

export type CrmApiConfig = {
  url: string
  token: string
}

export type CrmPullReason =
  | 'empty_url'
  | 'bad_url'
  | 'unauthorized'
  | 'not_found'
  | 'cors'
  | 'network'
  | 'bad_payload'
  | 'http'

export type CrmPullResult =
  | { ok: true; board: AdminBoard; count: number }
  | { ok: false; reason: CrmPullReason; status?: number }

export function emptyCrmApiConfig(): CrmApiConfig {
  return { url: '', token: '' }
}

export function envCrmApiConfig(): CrmApiConfig {
  const url =
    typeof import.meta.env.VITE_CRM_API_URL === 'string'
      ? import.meta.env.VITE_CRM_API_URL.trim()
      : ''
  const token =
    typeof import.meta.env.VITE_CRM_API_TOKEN === 'string'
      ? import.meta.env.VITE_CRM_API_TOKEN.trim()
      : ''
  return { url, token }
}

export function loadCrmApiConfig(): CrmApiConfig {
  const fromEnv = envCrmApiConfig()
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    if (!raw) {
      return fromEnv
    }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return fromEnv
    }
    const item = parsed as CrmApiConfig
    return {
      url: typeof item.url === 'string' && item.url.trim() ? item.url.trim() : fromEnv.url,
      token:
        typeof item.token === 'string' && item.token.trim()
          ? item.token.trim()
          : fromEnv.token,
    }
  } catch {
    return fromEnv
  }
}

export function saveCrmApiConfig(config: CrmApiConfig): void {
  try {
    window.localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        url: config.url.trim(),
        token: config.token.trim(),
      }),
    )
  } catch {
    return
  }
}

export function normalizeCrmApiUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol === 'https:') {
    return parsed.toString()
  }
  if (
    parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
  ) {
    return parsed.toString()
  }
  return null
}

export async function pullCrmBoard(config: CrmApiConfig): Promise<CrmPullResult> {
  const url = normalizeCrmApiUrl(config.url)
  if (!config.url.trim()) {
    return { ok: false, reason: 'empty_url' }
  }
  if (!url) {
    return { ok: false, reason: 'bad_url' }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (config.token.trim()) {
    headers.Authorization = `Bearer ${config.token.trim()}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
    })
  } catch {
    return { ok: false, reason: 'cors' }
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, reason: 'unauthorized', status: response.status }
  }
  if (response.status === 404) {
    return { ok: false, reason: 'not_found', status: response.status }
  }
  if (!response.ok) {
    return { ok: false, reason: 'http', status: response.status }
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    return { ok: false, reason: 'bad_payload' }
  }

  const board = parseRemoteCrmPayload(data)
  if (!board) {
    return { ok: false, reason: 'bad_payload' }
  }
  return { ok: true, board, count: board.accounts.length }
}

export function crmPullMessage(result: Extract<CrmPullResult, { ok: false }>): string {
  switch (result.reason) {
    case 'empty_url':
      return 'Cole a URL que a casa passar. Sem endereço e token oficiais, não há o que ligar.'
    case 'bad_url':
      return 'URL inválida. Use https (ou http só em localhost).'
    case 'unauthorized':
      return 'A API recusou o acesso. Confiram o token com quem emitiu a chave.'
    case 'not_found':
      return 'Esse endereço não devolveu a lista. Peçam o caminho certo do contrato.'
    case 'cors':
      return 'O navegador bloqueou a chamada (CORS). A casa precisa liberar este site ou mandar o JSON.'
    case 'network':
      return 'Não foi possível alcançar a API.'
    case 'bad_payload':
      return 'A resposta não está no JSON da mesa. Peçam o contrato no formato abaixo.'
    case 'http':
      return `A API respondeu ${result.status ?? 'com erro'}.`
    default: {
      const exhaustive: never = result.reason
      return exhaustive
    }
  }
}
