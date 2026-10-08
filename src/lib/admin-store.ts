import {
  accountContactDefaults,
  currentMonth,
  emptyBoard,
  isPartnerId,
  monthGoals,
  type Account,
  type AccountList,
  type AccountStatus,
  type ActivityEntry,
  type AdminBoard,
  type GoalSet,
  type MonthGoal,
  type PartnerId,
} from '@/data/admin'
import {
  clearMesaPassword,
  createActivity,
  listActivity,
  listGoals,
  saveMesaPassword,
  upsertGoals as upsertGoalsApi,
} from '@/lib/mesa-api'

const BOARD_KEY = 'finamob-curitiba-admin-board-v1'
const SESSION_KEY = 'finamob-curitiba-admin-session'
const CHANNEL = 'finamob-curitiba-admin'

function isAccountList(value: unknown): value is AccountList {
  return (
    value === 'incorporadora' ||
    value === 'construtora' ||
    value === 'prospeccao'
  )
}

function isAccountStatus(value: unknown): value is AccountStatus {
  return (
    value === 'novo' ||
    value === 'abordar' ||
    value === 'em_conversa' ||
    value === 'follow_up' ||
    value === 'mandato' ||
    value === 'pausado' ||
    value === 'sem_fit'
  )
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function coerceAccount(value: unknown): Account | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const item = value as Account
  if (
    typeof item.id !== 'string' ||
    !item.id ||
    typeof item.name !== 'string' ||
    !item.name.trim() ||
    !isAccountList(item.list) ||
    !(item.owner === null || isPartnerId(item.owner)) ||
    !isAccountStatus(item.status)
  ) {
    return null
  }
  const contacts = accountContactDefaults()
  return {
    id: item.id,
    list: item.list,
    name: item.name,
    city: asString(item.city),
    uf: asString(item.uf),
    contactName: asString(item.contactName) || contacts.contactName,
    phone: asString(item.phone) || contacts.phone,
    email: asString(item.email) || contacts.email,
    document: asString(item.document) || contacts.document,
    source: asString(item.source) || contacts.source,
    externalId: asString(item.externalId) || contacts.externalId,
    owner: item.owner,
    status: item.status,
    nextAction: asString(item.nextAction),
    nextActionAt: asString(item.nextActionAt),
    lastContactAt: asString(item.lastContactAt),
    notes: asString(item.notes),
    createdAt: asString(item.createdAt),
    updatedAt: asString(item.updatedAt),
    updatedBy: isPartnerId(item.updatedBy) ? item.updatedBy : 'vini',
  }
}

function isGoalSet(value: unknown): value is GoalSet {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as GoalSet
  return (
    typeof item.abordagens === 'number' &&
    typeof item.reunioes === 'number' &&
    typeof item.mandatos === 'number'
  )
}

function isMonthGoals(value: unknown): value is MonthGoal {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as MonthGoal
  return (
    typeof item.month === 'string' &&
    isGoalSet(item.casa) &&
    isGoalSet(item.vini) &&
    isGoalSet(item.rafa) &&
    isGoalSet(item.tadeu)
  )
}

function isActivity(value: unknown): value is ActivityEntry {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as ActivityEntry
  return (
    typeof item.id === 'string' &&
    typeof item.at === 'string' &&
    isPartnerId(item.by) &&
    typeof item.text === 'string'
  )
}

export function parseBoard(raw: string): AdminBoard | null {
  try {
    return parseRemoteCrmPayload(JSON.parse(raw))
  } catch {
    return null
  }
}

export function parseRemoteCrmPayload(data: unknown): AdminBoard | null {
  if (Array.isArray(data)) {
    const accounts = data
      .map(coerceAccount)
      .filter((item): item is Account => item !== null)
    if (accounts.length === 0 && data.length > 0) {
      return null
    }
    return { version: 1, accounts, goals: [], activity: [] }
  }
  if (!data || typeof data !== 'object') {
    return null
  }
  const board = data as AdminBoard & { accounts?: unknown }
  if (!Array.isArray(board.accounts)) {
    return null
  }
  if (board.version !== 1 && board.version !== undefined) {
    return null
  }
  const accounts = board.accounts
    .map(coerceAccount)
    .filter((item): item is Account => item !== null)
  if (board.accounts.length > 0 && accounts.length === 0) {
    return null
  }
  return {
    version: 1,
    accounts,
    goals: Array.isArray(board.goals) ? board.goals.filter(isMonthGoals) : [],
    activity: Array.isArray(board.activity)
      ? board.activity.filter(isActivity)
      : [],
  }
}

export function loadBoard(): AdminBoard {
  try {
    const raw = window.localStorage.getItem(BOARD_KEY)
    if (!raw) {
      return emptyBoard()
    }
    return parseBoard(raw) ?? emptyBoard()
  } catch {
    return emptyBoard()
  }
}

export function saveBoard(board: AdminBoard): void {
  const trimmed: AdminBoard = {
    ...board,
    activity: board.activity.slice(0, 80),
  }
  try {
    window.localStorage.setItem(BOARD_KEY, JSON.stringify(trimmed))
    window.dispatchEvent(new Event('finamob-admin-board'))
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL)
      channel.postMessage({ type: 'board' })
      channel.close()
    }
  } catch {
    return
  }
}

export function loadSession(): PartnerId | null {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY)
    return isPartnerId(stored) ? stored : null
  } catch {
    return null
  }
}

export function saveSession(id: PartnerId, password?: string): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, id)
  } catch {
    // ignore
  }
  if (typeof password === 'string' && password.trim()) {
    saveMesaPassword(password)
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
  clearMesaPassword()
}

/** Merge a MonthGoal into the in-memory board (local cache shape). */
export function upsertGoals(board: AdminBoard, next: MonthGoal): AdminBoard {
  const rest = board.goals.filter((item) => item.month !== next.month)
  return { ...board, goals: [...rest, next] }
}

export function ensureMonth(board: AdminBoard): AdminBoard {
  const month = currentMonth()
  if (board.goals.some((item) => item.month === month)) {
    return board
  }
  return upsertGoals(board, monthGoals(board, month))
}

/**
 * Pull goals + activity from Neon via `/api/crm`.
 * On network/API failure, keeps whatever is already in the localStorage cache.
 */
export async function hydrateMesaBoard(
  board: AdminBoard,
  month = currentMonth(),
): Promise<AdminBoard> {
  let next = ensureMonth(board)
  const [goalsResult, activityResult] = await Promise.all([
    listGoals(month),
    listActivity({ limit: 80 }),
  ])
  if (goalsResult.ok) {
    next = upsertGoals(next, goalsResult.data.goals)
  }
  if (activityResult.ok) {
    next = {
      ...next,
      activity: activityResult.data.activity.filter(isActivity),
    }
  }
  saveBoard(next)
  return next
}

/** Persist month goals to Neon; always updates the localStorage cache. */
export async function saveGoalsRemote(
  board: AdminBoard,
  goals: MonthGoal,
): Promise<
  | { ok: true; board: AdminBoard; goals: MonthGoal }
  | { ok: false; board: AdminBoard; error: string }
> {
  const cached = upsertGoals(board, goals)
  saveBoard(cached)
  const result = await upsertGoalsApi(goals)
  if (!result.ok) {
    return { ok: false, board: cached, error: result.error }
  }
  const synced = upsertGoals(cached, result.data.goals)
  saveBoard(synced)
  return { ok: true, board: synced, goals: result.data.goals }
}

/** Append an activity row to Neon; caches optimistically on failure. */
export async function saveActivityRemote(
  board: AdminBoard,
  input: {
    by: PartnerId
    text: string
    accountId?: string
    kind?: string
  },
): Promise<
  | { ok: true; board: AdminBoard; activity: ActivityEntry }
  | { ok: false; board: AdminBoard; error: string }
> {
  const result = await createActivity(input)
  if (!result.ok) {
    const fallback: ActivityEntry = {
      id: `local-${Date.now()}`,
      at: new Date().toISOString(),
      by: input.by,
      text: input.text,
      accountId: input.accountId,
      kind: input.kind,
    }
    const cached: AdminBoard = {
      ...board,
      activity: [fallback, ...board.activity].slice(0, 80),
    }
    saveBoard(cached)
    return { ok: false, board: cached, error: result.error }
  }
  const entry = result.data.activity
  const synced: AdminBoard = {
    ...board,
    activity: [entry, ...board.activity.filter((item) => item.id !== entry.id)].slice(
      0,
      80,
    ),
  }
  saveBoard(synced)
  return { ok: true, board: synced, activity: entry }
}
