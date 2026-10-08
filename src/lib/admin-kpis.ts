import {
  currentMonth,
  todayIso,
  type Account,
  type AccountStatus,
  type AdminBoard,
  type GoalSet,
  type PartnerId,
} from '@/data/admin'

const OPEN: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
]

function inMonth(iso: string, month: string): boolean {
  return iso.startsWith(month)
}

function weekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  now.setDate(now.getDate() - diff)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function isOpenStatus(status: AccountStatus): boolean {
  return OPEN.includes(status)
}

export function pipelineCounts(accounts: Account[]): Record<AccountStatus, number> {
  const counts: Record<AccountStatus, number> = {
    novo: 0,
    abordar: 0,
    em_conversa: 0,
    follow_up: 0,
    mandato: 0,
    pausado: 0,
    sem_fit: 0,
  }
  for (const account of accounts) {
    counts[account.status] += 1
  }
  return counts
}

export function ownerCounts(accounts: Account[]): Record<PartnerId | 'livre', number> {
  const counts: Record<PartnerId | 'livre', number> = {
    vini: 0,
    rafa: 0,
    tadeu: 0,
    livre: 0,
  }
  for (const account of accounts) {
    if (!account.owner) {
      counts.livre += 1
    } else {
      counts[account.owner] += 1
    }
  }
  return counts
}

export function dueQueue(accounts: Account[], today = todayIso()): Account[] {
  return accounts
    .filter((account) => isOpenStatus(account.status) && account.nextActionAt)
    .filter((account) => account.nextActionAt <= today)
    .sort((a, b) => a.nextActionAt.localeCompare(b.nextActionAt))
}

export function weekActions(board: AdminBoard): number {
  const start = weekStart()
  const fromActivity = board.activity.filter((item) => {
    const day = item.at.slice(0, 10)
    return day >= start && (item.kind === 'abordagem' || item.kind === 'whatsapp' || !item.kind)
  }).length
  if (fromActivity > 0) {
    return fromActivity
  }
  return board.accounts.filter(
    (account) => account.lastContactAt && account.lastContactAt >= start,
  ).length
}

function activityInMonth(board: AdminBoard, month: string, kinds: string[]) {
  return board.activity.filter(
    (item) =>
      inMonth(item.at.slice(0, 10), month) &&
      kinds.includes(item.kind || 'abordagem'),
  ).length
}

export function monthActuals(board: AdminBoard, month = currentMonth()): GoalSet {
  const accounts = board.accounts
  const fromLogAbordagens = activityInMonth(board, month, [
    'abordagem',
    'nota',
  ])
  const fromLogReunioes = activityInMonth(board, month, [
    'reuniao',
    'reuniao_conversa',
  ])
  const fromLogMandatos = activityInMonth(board, month, ['mandato'])

  const abordagens =
    fromLogAbordagens > 0
      ? fromLogAbordagens
      : accounts.filter((account) => inMonth(account.lastContactAt, month)).length
  const reunioes =
    fromLogReunioes > 0
      ? fromLogReunioes
      : accounts.filter(
          (account) =>
            (account.status === 'em_conversa' || account.status === 'follow_up') &&
            inMonth(account.updatedAt.slice(0, 10), month),
        ).length
  const mandatos =
    fromLogMandatos > 0
      ? fromLogMandatos
      : accounts.filter(
          (account) =>
            account.status === 'mandato' &&
            inMonth(account.updatedAt.slice(0, 10), month),
        ).length
  return { abordagens, reunioes, mandatos }
}

export function partnerActuals(
  board: AdminBoard,
  partner: PartnerId,
  month = currentMonth(),
): GoalSet {
  const partnerActivity = board.activity.filter((item) => item.by === partner)
  const mine = board.accounts.filter((account) => account.owner === partner)
  return monthActuals(
    { ...board, accounts: mine, activity: partnerActivity },
    month,
  )
}
