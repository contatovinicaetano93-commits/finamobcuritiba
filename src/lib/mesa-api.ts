import {
  ADMIN_PASSWORD,
  type Account,
  type AccountList,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'

export const MESA_SCOPES = ['praca', 'pr', 'sul', 'brasil'] as const
export type MesaScope = (typeof MESA_SCOPES)[number]

export interface Development {
  id: string
  name: string
  stage: string
  kind: string
  purpose: string
  city: string
  uf: string
  neighborhood: string
  units: number | null
  launch: string
  delivery: string
  mcmv: boolean | null
  link: string
}

export type MesaAccount = Account & {
  region: string
  inCuritibaRadius: boolean
  empCount: number
  distKm: number | null
  site: string
  porte: string
  atuacao: string
  developments?: Development[]
}

export type MesaQuery = {
  scope: MesaScope
  region: string
  uf: string
  city: string
  list: AccountList | 'todas'
  status: AccountStatus | 'todos'
  owner: PartnerId | 'todos' | 'livre'
  q: string
  page: number
  limit?: number
}

export type MesaListResponse = {
  scope: MesaScope
  total: number
  page: number
  limit: number
  counts: {
    incorporadora: number
    construtora: number
    prospeccao: number
  }
  accounts: MesaAccount[]
}

export type MesaFacets = {
  ufs: Array<{ uf: string; total: number }>
  cities: Array<{ city: string; uf: string; total: number }>
  regions: string[]
}

export type MesaSummary = {
  total: number
  praca: number
  parana: number
  sul: number
  incorporadora: number
  construtora: number
  prospeccao: number
  novo: number
  abordar: number
  em_conversa: number
  follow_up: number
  mandato: number
  vini: number
  rafa: number
  tadeu: number
  livre: number
}

function queryString(query: Partial<MesaQuery>, extra: Record<string, string> = {}) {
  const params = new URLSearchParams(extra)
  if (query.scope) {
    params.set('scope', query.scope)
  }
  if (query.region) {
    params.set('region', query.region)
  }
  if (query.uf) {
    params.set('uf', query.uf)
  }
  if (query.city) {
    params.set('city', query.city)
  }
  if (query.list && query.list !== 'todas') {
    params.set('list', query.list)
  }
  if (query.status && query.status !== 'todos') {
    params.set('status', query.status)
  }
  if (query.owner && query.owner !== 'todos') {
    params.set('owner', query.owner)
  }
  if (query.q) {
    params.set('q', query.q)
  }
  if (typeof query.page === 'number') {
    params.set('page', String(query.page))
  }
  if (query.limit) {
    params.set('limit', String(query.limit))
  }
  return params.toString()
}

async function mesaFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-mesa-password': ADMIN_PASSWORD,
        ...(init.headers ?? {}),
      },
    })
    const data = (await response.json()) as T & { error?: string }
    if (!response.ok) {
      return { ok: false, error: data.error || 'Falha na mesa.' }
    }
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Não conectou no banco da mesa.' }
  }
}

export async function fetchMesaCompanies(query: MesaQuery) {
  return mesaFetch<MesaListResponse>(`/api/crm/companies?${queryString(query)}`)
}

export async function fetchMesaCompany(id: string) {
  return mesaFetch<{ account: MesaAccount }>(
    `/api/crm/companies/${encodeURIComponent(id)}`,
  )
}

export async function fetchMesaFacets(query: Pick<MesaQuery, 'scope' | 'region' | 'uf'>) {
  return mesaFetch<MesaFacets>(`/api/crm/facets?${queryString(query)}`)
}

export async function fetchMesaSummary(query: Pick<MesaQuery, 'scope'>) {
  return mesaFetch<MesaSummary>(`/api/crm/summary?${queryString(query)}`)
}

export async function fetchMesaDue(query: Pick<MesaQuery, 'scope'>) {
  return mesaFetch<{ accounts: MesaAccount[] }>(`/api/crm/due?${queryString(query)}`)
}

export async function createMesaCompany(
  draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>,
  by: PartnerId,
) {
  return mesaFetch<{ account: MesaAccount }>('/api/crm/companies', {
    method: 'POST',
    body: JSON.stringify({ ...draft, updatedBy: by }),
  })
}

export async function saveMesaCompany(
  account: Account,
  note: string,
  by: PartnerId,
) {
  return mesaFetch<{ account: MesaAccount }>(
    `/api/crm/companies/${encodeURIComponent(account.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ ...account, note, updatedBy: by }),
    },
  )
}

export async function deleteMesaCompany(id: string) {
  return mesaFetch<{ ok: true }>(`/api/crm/companies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function scopeLabel(scope: MesaScope): string {
  switch (scope) {
    case 'praca':
      return 'Praça Curitiba'
    case 'pr':
      return 'Paraná'
    case 'sul':
      return 'Sul'
    case 'brasil':
      return 'Brasil'
    default: {
      const exhaustive: never = scope
      return exhaustive
    }
  }
}
