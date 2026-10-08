export const PARTNER_IDS = ['vini', 'rafa', 'tadeu'] as const

export type PartnerId = (typeof PARTNER_IDS)[number]

export type AccountList = 'incorporadora' | 'construtora' | 'prospeccao'

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
  contactName: string
  phone: string
  email: string
  document: string
  source: string
  externalId: string
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
  kind?: string
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

export const ADMIN_PASSWORD = resolveAdminPassword()

function resolveAdminPassword(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_PASSWORD
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim()
  }
  return 'cwb-socios'
}

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
    case 'construtora':
      return 'Construtora'
    case 'prospeccao':
      return 'Prospecção'
    default: {
      const exhaustive: never = list
      return exhaustive
    }
  }
}

export function accountContactDefaults(): Pick<
  Account,
  'contactName' | 'phone' | 'email' | 'document' | 'source' | 'externalId'
> {
  return {
    contactName: '',
    phone: '',
    email: '',
    document: '',
    source: '',
    externalId: '',
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

export function statusTone(status: AccountStatus): string {
  switch (status) {
    case 'novo':
      return 'bg-black/[0.06] text-black/70'
    case 'abordar':
      return 'bg-[#9c8563]/18 text-[#6a5438]'
    case 'em_conversa':
      return 'bg-[#d7e6ef] text-[#1f4a63]'
    case 'follow_up':
      return 'bg-[#f3e2c4] text-[#6b4e16]'
    case 'mandato':
      return 'bg-[#d7eadc] text-[#21553a]'
    case 'pausado':
      return 'bg-black/[0.05] text-black/45'
    case 'sem_fit':
      return 'bg-[#f3d6d2] text-[#7a2e24]'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

export function partnerTone(id: PartnerId | null): string {
  if (!id) {
    return 'bg-black/10 text-black/50'
  }
  switch (id) {
    case 'vini':
      return 'bg-[#9c8563] text-white'
    case 'rafa':
      return 'bg-[#050505] text-white'
    case 'tadeu':
      return 'bg-[#c4b49a] text-[#050505]'
    default: {
      const exhaustive: never = id
      return exhaustive
    }
  }
}

export function formatDay(iso: string): string {
  if (!iso) {
    return 'sem data'
  }
  const parts = iso.slice(0, 10).split('-')
  if (parts.length !== 3) {
    return iso
  }
  return `${parts[2]}/${parts[1]}`
}

export function formatMonthLabel(month: string): string {
  const [year, mm] = month.split('-')
  const names = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]
  const index = Number(mm) - 1
  if (index < 0 || index > 11) {
    return month
  }
  return `${names[index]}/${year}`
}

export function formatTodayHeading(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) {
    return iso
  }
  const date = new Date(year, month - 1, day)
  const weekdays = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ]
  return `${weekdays[date.getDay()]} · ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

export function formatStamp(iso: string): string {
  if (!iso) {
    return ''
  }
  const day = formatDay(iso)
  const time = iso.length >= 16 ? iso.slice(11, 16) : ''
  return time ? `${day} · ${time}` : day
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
