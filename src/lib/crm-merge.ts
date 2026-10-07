import { newId, type Account, type AdminBoard, type PartnerId } from '@/data/admin'
import { normalizeCompanyName } from '@/lib/crm-import'

export type MergeReport = {
  board: AdminBoard
  added: number
  kept: number
  filled: number
}

function accountKey(account: Account): string {
  if (account.externalId.trim()) {
    return `id:${account.externalId.trim().toLowerCase()}`
  }
  const name = normalizeCompanyName(account.name)
  const city = normalizeCompanyName(account.city)
  return city ? `n:${name}|${city}` : `n:${name}`
}

function fillBlank(current: string, incoming: string): string {
  return current.trim() ? current : incoming.trim()
}

function enrichAccount(current: Account, incoming: Account): Account {
  const filled: Account = {
    ...current,
    city: fillBlank(current.city, incoming.city),
    uf: fillBlank(current.uf, incoming.uf),
    contactName: fillBlank(current.contactName, incoming.contactName),
    phone: fillBlank(current.phone, incoming.phone),
    email: fillBlank(current.email, incoming.email),
    document: fillBlank(current.document, incoming.document),
    source: fillBlank(current.source, incoming.source),
    externalId: fillBlank(current.externalId, incoming.externalId),
    nextAction: fillBlank(current.nextAction, incoming.nextAction),
    nextActionAt: fillBlank(current.nextActionAt, incoming.nextActionAt),
    lastContactAt: fillBlank(current.lastContactAt, incoming.lastContactAt),
    notes: current.notes.trim()
      ? current.notes
      : incoming.notes,
  }
  return filled
}

function didFill(before: Account, after: Account): boolean {
  return (
    before.phone !== after.phone ||
    before.email !== after.email ||
    before.contactName !== after.contactName ||
    before.city !== after.city ||
    before.document !== after.document
  )
}

export function mergeImportedAccounts(
  board: AdminBoard,
  incoming: Account[],
  by: PartnerId,
): MergeReport {
  const index = new Map<string, number>()
  const accounts = board.accounts.map((account, position) => {
    index.set(accountKey(account), position)
    const nameKey = `n:${normalizeCompanyName(account.name)}`
    if (!index.has(nameKey)) {
      index.set(nameKey, position)
    }
    return account
  })

  let added = 0
  let filled = 0
  const now = new Date().toISOString()

  for (const item of incoming) {
    const keys = [accountKey(item), `n:${normalizeCompanyName(item.name)}`]
    const matchAt = keys
      .map((key) => index.get(key))
      .find((position) => position !== undefined)
    if (matchAt === undefined) {
      const next: Account = { ...item, updatedBy: by, updatedAt: now }
      index.set(accountKey(next), accounts.length)
      index.set(`n:${normalizeCompanyName(next.name)}`, accounts.length)
      accounts.push(next)
      added += 1
      continue
    }
    const current = accounts[matchAt]
    const enriched = enrichAccount(current, item)
    if (didFill(current, enriched)) {
      accounts[matchAt] = { ...enriched, updatedAt: now, updatedBy: by }
      filled += 1
    }
  }

  return {
    board: {
      ...board,
      accounts,
      activity: [
        {
          id: newId(),
          at: now,
          by,
          text: `Importou base: ${added} novas, ${filled} completadas, ${accounts.length - added} já estavam na mesa.`,
        },
        ...board.activity,
      ],
    },
    added,
    kept: accounts.length - added,
    filled,
  }
}
