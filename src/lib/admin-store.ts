import {
  currentMonth,
  emptyBoard,
  isPartnerId,
  monthGoals,
  type Account,
  type AccountList,
  type AccountStatus,
  type Activity,
  type AdminBoard,
  type GoalSet,
  type MonthGoals,
  type PartnerId,
} from '@/data/admin'

const BOARD_KEY = 'finamob-curitiba-admin-board-v1'
const SESSION_KEY = 'finamob-curitiba-admin-session'
const CHANNEL = 'finamob-curitiba-admin'

function isAccountList(value: unknown): value is AccountList {
  return value === 'incorporadora' || value === 'prospeccao'
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

function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as Account
  return (
    typeof item.id === 'string' &&
    isAccountList(item.list) &&
    typeof item.name === 'string' &&
    (item.owner === null || isPartnerId(item.owner)) &&
    isAccountStatus(item.status)
  )
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

function isMonthGoals(value: unknown): value is MonthGoals {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as MonthGoals
  return (
    typeof item.month === 'string' &&
    isGoalSet(item.casa) &&
    isGoalSet(item.vini) &&
    isGoalSet(item.rafa) &&
    isGoalSet(item.tadeu)
  )
}

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as Activity
  return (
    typeof item.id === 'string' &&
    typeof item.at === 'string' &&
    isPartnerId(item.by) &&
    typeof item.text === 'string'
  )
}

export function parseBoard(raw: string): AdminBoard | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    const board = parsed as AdminBoard
    if (board.version !== 1 || !Array.isArray(board.accounts)) {
      return null
    }
    return {
      version: 1,
      accounts: board.accounts.filter(isAccount),
      goals: Array.isArray(board.goals) ? board.goals.filter(isMonthGoals) : [],
      activity: Array.isArray(board.activity)
        ? board.activity.filter(isActivity)
        : [],
    }
  } catch {
    return null
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

export function saveSession(id: PartnerId): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, id)
  } catch {
    return
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    return
  }
}

export function upsertGoals(board: AdminBoard, next: MonthGoals): AdminBoard {
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
