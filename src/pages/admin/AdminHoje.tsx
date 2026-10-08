import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatDay,
  formatTodayHeading,
  partnerById,
  statusLabel,
  todayIso,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'
import {
  fetchMesaCompanies,
  fetchMesaDue,
  saveMesaCompany,
  type MesaAccount,
  type MesaQuery,
} from '@/lib/mesa-api'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  FilterChip,
  OwnerMark,
  StatusPill,
} from '@/pages/admin/admin-ui'
import { cn } from '@/lib/utils'

const OPEN_STATUSES: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
]

const STATUS_CHIPS: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
  'mandato',
  'pausado',
  'sem_fit',
]

const QUEUE_LIMIT = 120

type QueueView = 'eu' | 'casa'

type AdminHojeProps = {
  me: PartnerId
  dueAccounts: MesaAccount[]
  reloadToken: number
  onOpen: (id: string) => void
  onCreate: () => void
  onExport: () => void
  onActivityLogged?: () => void
}

function baseQuery(overrides: Partial<MesaQuery> = {}): MesaQuery {
  return {
    scope: 'praca',
    region: '',
    uf: '',
    city: '',
    list: 'todas',
    status: 'todos',
    owner: 'todos',
    q: '',
    page: 1,
    limit: QUEUE_LIMIT,
    ...overrides,
  }
}

function mergeAccounts(...groups: MesaAccount[][]): MesaAccount[] {
  const byId = new Map<string, MesaAccount>()
  for (const group of groups) {
    for (const account of group) {
      byId.set(account.id, account)
    }
  }
  return [...byId.values()]
}

function isOpenStatus(status: AccountStatus): boolean {
  return (OPEN_STATUSES as readonly AccountStatus[]).includes(status)
}

function inMinhaFila(account: MesaAccount, me: PartnerId): boolean {
  if (account.owner === me) {
    return true
  }
  return account.owner === null && isOpenStatus(account.status)
}

function inCasaFila(account: MesaAccount): boolean {
  return isOpenStatus(account.status)
}

function sortQueue(accounts: MesaAccount[]): MesaAccount[] {
  return [...accounts].sort((a, b) => {
    const aDue = a.nextActionAt || '9999-99-99'
    const bDue = b.nextActionAt || '9999-99-99'
    if (aDue !== bDue) {
      return aDue.localeCompare(bDue)
    }
    return a.name.localeCompare(b.name, 'pt-BR')
  })
}

function placeLabel(account: MesaAccount): string {
  const parts = [account.city, account.uf].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : 'Sem cidade'
}

function firstError(
  ...results: Array<{ ok: true } | { ok: false; error: string }>
): string {
  for (const result of results) {
    if (!result.ok) {
      return result.error
    }
  }
  return 'Falha na fila da mesa.'
}

export function AdminHoje({
  me,
  dueAccounts,
  reloadToken,
  onOpen,
  onCreate,
  onExport,
  onActivityLogged,
}: AdminHojeProps) {
  const today = todayIso()
  const [view, setView] = useState<QueueView>('eu')
  const [accounts, setAccounts] = useState<MesaAccount[]>(dueAccounts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    const [dueResult, mineResult, livreResult, casaResult] = await Promise.all([
      fetchMesaDue({ scope: 'praca' }),
      fetchMesaCompanies(baseQuery({ owner: me })),
      fetchMesaCompanies(baseQuery({ owner: 'livre' })),
      fetchMesaCompanies(baseQuery()),
    ])

    if (
      !dueResult.ok &&
      !mineResult.ok &&
      !livreResult.ok &&
      !casaResult.ok
    ) {
      setError(firstError(dueResult, mineResult, livreResult, casaResult))
      setAccounts(dueAccounts)
      setLoading(false)
      return
    }

    setError('')
    const merged = mergeAccounts(
      dueResult.ok ? dueResult.data.accounts : [],
      mineResult.ok ? mineResult.data.accounts : [],
      livreResult.ok ? livreResult.data.accounts : [],
      casaResult.ok ? casaResult.data.accounts : [],
      dueAccounts,
    )
    setAccounts(merged)
    setLoading(false)
  }, [dueAccounts, me])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await loadQueue()
      if (cancelled) {
        return
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadQueue, reloadToken])

  const queue = useMemo(() => {
    const filtered =
      view === 'eu'
        ? accounts.filter((account) => inMinhaFila(account, me))
        : accounts.filter((account) => inCasaFila(account))
    return sortQueue(filtered)
  }, [accounts, me, view])

  const minhaCount = useMemo(
    () => accounts.filter((account) => inMinhaFila(account, me)).length,
    [accounts, me],
  )
  const casaCount = useMemo(
    () => accounts.filter((account) => inCasaFila(account)).length,
    [accounts],
  )

  async function handleStatus(
    account: MesaAccount,
    nextStatus: AccountStatus,
  ) {
    if (account.status === nextStatus || savingId) {
      return
    }
    const previous = account.status
    setSavingId(account.id)
    setAccounts((current) =>
      current.map((item) =>
        item.id === account.id ? { ...item, status: nextStatus } : item,
      ),
    )
    const result = await saveMesaCompany(
      { ...account, status: nextStatus },
      '',
      me,
    )
    setSavingId(null)
    if (!result.ok) {
      window.alert(result.error)
      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id ? { ...item, status: previous } : item,
        ),
      )
      await loadQueue()
      return
    }
    setAccounts((current) =>
      current.map((item) =>
        item.id === account.id ? result.data.account : item,
      ),
    )
    onActivityLogged?.()
  }

  return (
    <div className="space-y-5">
      <section className="admin-welcome px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Minha fila · {partnerById(me).name}
              </h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                {formatTodayHeading(today)}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/55">
              Praça Curitiba. Um toque no status atualiza a conta no Neon.
              Sem inventar contato — só o que já está na mesa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/8"
            >
              Exportar
            </button>
            <Button
              type="button"
              onClick={onCreate}
              className="rounded-full bg-white text-[#050505] hover:bg-white/90"
            >
              Nova conta
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={view === 'eu'}
            label={`Eu · ${minhaCount}`}
            onClick={() => setView('eu')}
          />
          <FilterChip
            active={view === 'casa'}
            label={`Casa · ${casaCount}`}
            onClick={() => setView('casa')}
          />
        </div>
        <Link
          to="/admin/crm"
          className="text-sm text-[#9c8563] hover:text-black"
        >
          Abrir CRM
        </Link>
      </div>

      {error ? (
        <p
          className="rounded-2xl bg-[#f7e8e4] px-4 py-3 text-sm text-[#7a2e24]"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => void loadQueue()}
          >
            Tentar de novo
          </button>
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-black/50">Carregando fila da praça…</p>
      ) : null}

      {!loading && !error && queue.length === 0 ? (
        <EmptyState
          title={view === 'eu' ? 'Fila limpa' : 'Nada aberto na casa'}
          body={
            view === 'eu'
              ? 'Nenhuma conta sua nem livre (novo / abordar / em conversa / follow-up) na praça agora.'
              : 'Não há contas em ativação (novo → follow-up) na praça Curitiba.'
          }
          action={
            <Button type="button" onClick={onCreate}>
              Pegar uma conta nova
            </Button>
          }
        />
      ) : null}

      {!loading && queue.length > 0 ? (
        <ul className="space-y-3">
          {queue.map((account) => (
            <QueueCard
              key={account.id}
              account={account}
              busy={savingId === account.id}
              onOpen={onOpen}
              onStatus={(status) => void handleStatus(account, status)}
            />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function QueueCard({
  account,
  busy,
  onOpen,
  onStatus,
}: {
  account: MesaAccount
  busy: boolean
  onOpen: (id: string) => void
  onStatus: (status: AccountStatus) => void
}) {
  return (
    <li className="admin-surface rounded-2xl px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <OwnerMark id={account.owner} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpen(account.id)}
              className="min-w-0 text-left"
            >
              <span className="block truncate font-medium">{account.name}</span>
              <span className="text-xs text-black/45">{placeLabel(account)}</span>
            </button>
            <StatusPill status={account.status} />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/50">
            <span>
              Próximo:{' '}
              <span className="text-black/70">
                {account.nextAction || '—'}
                {account.nextActionAt
                  ? ` · ${formatDay(account.nextActionAt)}`
                  : ''}
              </span>
            </span>
            <span>
              Último contato:{' '}
              <span className="text-black/70">
                {account.lastContactAt
                  ? formatDay(account.lastContactAt)
                  : '—'}
              </span>
            </span>
          </div>

          <div
            className="mt-3 flex flex-wrap gap-1.5"
            role="group"
            aria-label={`Status de ${account.name}`}
          >
            {STATUS_CHIPS.map((status) => {
              const active = account.status === status
              return (
                <button
                  key={status}
                  type="button"
                  disabled={busy || active}
                  onClick={() => onStatus(status)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                    active
                      ? 'bg-[#050505] text-white'
                      : 'border border-black/10 bg-white text-black/65 hover:border-[#9c8563] hover:text-black',
                    busy && !active ? 'opacity-50' : '',
                  )}
                >
                  {statusLabel(status)}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </li>
  )
}
