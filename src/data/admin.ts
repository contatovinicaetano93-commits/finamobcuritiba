export const PARTNER_IDS = ['vini', 'rafa', 'tadeu'] as const

export type PartnerId = (typeof PARTNER_IDS)[number]

export type AccountList = 'incorporadora' | 'prospeccao'

export type AccountStatus =
  | 'novo'
  | 'abordar'
  | 'em_conversa'
  | 'follow_up'
  | 'mandato'
  | 'pausado'
  | 'sem_fit'

export interface Partner {
  id: PartnerId
  name: string
  short: string
}

export interface Account {
  id: string
  list: AccountList
  name: string
  city: string
  uf: string
  owner: PartnerId | null
  status: AccountStatus
  nextAction: string
  nextActionAt: string
  lastContactAt: string
  notes: string
  createdAt: string
  updatedAt: string
  updatedBy: PartnerId
}

export interface GoalSet {
  abordagens: number
  reunioes: number
  mandatos: number
}

export interface MonthGoals {
  month: string
  casa: GoalSet
  vini: GoalSet
  rafa: GoalSet
  tadeu: GoalSet
}

export interface Activity {
  id: string
  at: string
  by: PartnerId
  text: string
  accountId?: string
}

export interface AdminBoard {
  version: 1
  accounts: Account[]
  goals: MonthGoals[]
  activity: Activity[]
}

export const PARTNERS: Partner[] = [
  { id: 'vini', name: 'Vini', short: 'V' },
  { id: 'rafa', name: 'Rafa', short: 'R' },
  { id: 'tadeu', name: 'Tadeu', short: 'T' },
]

export const EMPTY_GOALS: GoalSet = {
  abordagens: 0,
  reunioes: 0,
  mandatos: 0,
}

export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || 'cwb-socios'

export function isPartnerId(value: string | null): value is PartnerId {
  return value === 'vini' || value === 'rafa' || value === 'tadeu'
}

export function partnerById(id: PartnerId): Partner {
  switch (id) {
    case 'vini':
      return PARTNERS[0]
    case 'rafa':
      return PARTNERS[1]
    case 'tadeu':
      return PARTNERS[2]
    default: {
      const exhaustive: never = id
      return exhaustive
    }
  }
}

export function partnerLabel(id: PartnerId | null): string {
  if (!id) {
    return 'Sem dono'
  }
  return partnerById(id).name
}

export function listLabel(list: AccountList): string {
  switch (list) {
    case 'incorporadora':
      return 'Incorporadora'
    case 'prospeccao':
      return 'Prospecção'
    default: {
      const exhaustive: never = list
      return exhaustive
    }
  }
}

export function statusLabel(status: AccountStatus): string {
  switch (status) {
    case 'novo':
      return 'Novo'
    case 'abordar':
      return 'Abordar'
    case 'em_conversa':
      return 'Em conversa'
    case 'follow_up':
      return 'Follow-up'
    case 'mandato':
      return 'Mandato'
    case 'pausado':
      return 'Pausado'
    case 'sem_fit':
      return 'Sem fit'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

export function emptyBoard(): AdminBoard {
  return { version: 1, accounts: [], goals: [], activity: [] }
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function monthGoals(board: AdminBoard, month = currentMonth()): MonthGoals {
  const found = board.goals.find((item) => item.month === month)
  if (found) {
    return found
  }
  return {
    month,
    casa: { ...EMPTY_GOALS },
    vini: { ...EMPTY_GOALS },
    rafa: { ...EMPTY_GOALS },
    tadeu: { ...EMPTY_GOALS },
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
