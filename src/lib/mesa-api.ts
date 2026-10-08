import {
  ADMIN_PASSWORD,
  type Account,
  type AccountList,
  type AccountStatus,
  type ActivityEntry,
  type GoalSet,
  type MonthGoal,
  type PartnerId,
} from '@/data/admin'

export const MESA_SCOPES = ['praca', 'pr', 'sul', 'brasil'] as const
export type MesaScope = (typeof MESA_SCOPES)[number]

const MESA_PASSWORD_KEY = 'finamob-curitiba-admin-password'

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

/** Activity row from `/api/crm/activity` (Neon activity_log). */
export type MesaActivity = ActivityEntry

/** Month goals payload from `/api/crm/goals`. */
export type MesaMonthGoals = MonthGoal

export type MesaPartner = {
  id: PartnerId
  name: string
  short: string
}

export type MesaKpis = {
  month: string
  goals: MonthGoal
  actuals: {
    casa: GoalSet
    vini: GoalSet
    rafa: GoalSet
    tadeu: GoalSet
  }
  week: {
    casa: number
    vini: number
    rafa: number
    tadeu: number
  }
}

export function loadMesaPassword(): string {
  try {
    const stored = window.sessionStorage.getItem(MESA_PASSWORD_KEY)
    if (stored && stored.trim()) {
      return stored.trim()
    }
  } catch {
    // ignore storage errors
  }
  return ADMIN_PASSWORD
}

export function saveMesaPassword(password: string): void {
  try {
    window.sessionStorage.setItem(MESA_PASSWORD_KEY, password.trim())
  } catch {
    return
  }
}

export function clearMesaPassword(): void {
  try {
    window.sessionStorage.removeItem(MESA_PASSWORD_KEY)
  } catch {
    return
  }
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
    const headers = new Headers(init.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    if (!headers.has('x-mesa-password')) {
      headers.set('x-mesa-password', loadMesaPassword())
    }
    const response = await fetch(path, {
      ...init,
      headers,
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

/** Session login: partnerId + password. Persists password for later mesa calls. */
export async function loginSession(partnerId: PartnerId, password: string) {
  const typed = password.trim()
  const result = await mesaFetch<{
    ok: true
    partner: MesaPartner
  }>('/api/crm/session', {
    method: 'POST',
    body: JSON.stringify({ partnerId, password: typed }),
    headers: {
      'x-mesa-password': typed,
    },
  })
  if (result.ok) {
    saveMesaPassword(typed)
  }
  return result
}

export const loginMesaSession = loginSession

export async function listPartners() {
  return mesaFetch<{ partners: MesaPartner[] }>('/api/crm/partners')
}

export const fetchMesaPartners = listPartners

export async function listActivity(query: {
  companyId?: string
  partnerId?: PartnerId
  day?: string
  month?: string
  limit?: number
} = {}) {
  const params = new URLSearchParams()
  if (query.companyId) {
    params.set('company_id', query.companyId)
  }
  if (query.partnerId) {
    params.set('partner_id', query.partnerId)
  }
  if (query.day) {
    params.set('day', query.day)
  }
  if (query.month) {
    params.set('month', query.month)
  }
  if (query.limit) {
    params.set('limit', String(query.limit))
  }
  const qs = params.toString()
  return mesaFetch<{ activity: ActivityEntry[] }>(
    `/api/crm/activity${qs ? `?${qs}` : ''}`,
  )
}

export const fetchMesaActivity = listActivity

export async function createActivity(input: {
  by: PartnerId
  text: string
  accountId?: string
  kind?: string
  meta?: Record<string, unknown>
}) {
  return mesaFetch<{ activity: ActivityEntry }>('/api/crm/activity', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export const createMesaActivity = createActivity

export async function listGoals(yearMonth: string) {
  return mesaFetch<{ goals: MonthGoal }>(
    `/api/crm/goals?year_month=${encodeURIComponent(yearMonth)}`,
  )
}

export const fetchMesaGoals = listGoals

export async function upsertGoals(goals: MonthGoal) {
  return mesaFetch<{ goals: MonthGoal }>('/api/crm/goals', {
    method: 'PUT',
    body: JSON.stringify(goals),
  })
}

export const saveMesaGoals = upsertGoals

export async function fetchMesaKpis(yearMonth: string) {
  return mesaFetch<MesaKpis>(
    `/api/crm/kpis?year_month=${encodeURIComponent(yearMonth)}`,
  )
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
