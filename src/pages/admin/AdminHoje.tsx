import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ChartColumnIncreasing,
  Handshake,
  Phone,
  Plus,
  Target,
  Users,
} from 'lucide-react'
import {
  currentMonth,
  formatDay,
  formatStamp,
  formatTodayHeading,
  listLabel,
  monthGoals,
  PARTNERS,
  partnerById,
  partnerLabel,
  statusLabel,
  todayIso,
  type Account,
  type AccountStatus,
  type Activity,
  type AdminBoard,
  type PartnerId,
} from '@/data/admin'
import {
  dueQueue,
  monthActuals,
  ownerCounts,
  pipelineCounts,
  weekActions,
} from '@/lib/admin-kpis'
import { OwnerMark, ProgressTrack, StatusPill } from '@/pages/admin/admin-ui'
import { cn } from '@/lib/utils'

const PIPELINE: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
  'mandato',
]

type AdminHojeProps = {
  board: AdminBoard
  me: PartnerId
  onOpen: (id: string) => void
  onCreate: () => void
  onExport: () => void
}

export function AdminHoje({
  board,
  me,
  onOpen,
  onCreate,
  onExport,
}: AdminHojeProps) {
  const today = todayIso()
  const month = currentMonth()
  const due = dueQueue(board.accounts, today)
  const mine = due.filter((account) => account.owner === me)
  const house = due.filter((account) => account.owner !== me)
  const week = weekActions(board)
  const goals = monthGoals(board, month)
  const casa = monthActuals(board, month)
  const pipeline = pipelineCounts(board.accounts)
  const owners = ownerCounts(board.accounts)
  const open = board.accounts.filter(
    (account) =>
      account.status === 'novo' ||
      account.status === 'abordar' ||
      account.status === 'em_conversa' ||
      account.status === 'follow_up',
  ).length
  const livre = owners.livre
  const incorporadoras = board.accounts.filter(
    (account) => account.list === 'incorporadora',
  ).length
  const construtoras = board.accounts.filter(
    (account) => account.list === 'construtora',
  ).length
  const prospeccao = board.accounts.filter(
    (account) => account.list === 'prospeccao',
  ).length
  const feed = board.activity.slice(0, 5)
  const ranked = [...PARTNERS]
    .map((partner) => ({
      partner,
      count: owners[partner.id],
    }))
    .sort((a, b) => b.count - a.count)
  const pipelineMax = Math.max(1, ...PIPELINE.map((status) => pipeline[status]))

  return (
    <div className="space-y-5">
      <section className="admin-welcome px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Bem-vindo de volta, {partnerById(me).name}
              </h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                {formatTodayHeading(today)}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/55">
              Um dono por conta. Quem pegou, registra a abordagem no mesmo dia.
            </p>
          </div>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/8"
          >
            Exportar
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <WelcomeStat label="Fila de hoje" value={String(due.length)} hint="Vencidas e do dia" />
          <WelcomeStat label="Abordagens na semana" value={String(week)} hint="Último contato" />
          <WelcomeStat label="Contas abertas" value={String(open)} hint="Pipeline ativo" />
          <WelcomeStat label="Sem dono" value={String(livre)} hint="Livres na mesa" />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Building2 size={16} />}
          label="Incorporadoras"
          value={String(incorporadoras)}
          hint={`${construtoras} construtoras na mesa`}
          progress={{
            value: incorporadoras,
            goal: Math.max(board.accounts.length, 1),
          }}
        />
        <MetricCard
          icon={<Users size={16} />}
          label="Novos / prospecção"
          value={String(prospeccao)}
          hint="Entradas ainda sem ativação"
          progress={{
            value: prospeccao,
            goal: Math.max(board.accounts.length, 1),
          }}
        />
        <MetricCard
          icon={<Phone size={16} />}
          label="Abordagens do mês"
          value={String(casa.abordagens)}
          hint={
            goals.casa.abordagens > 0
              ? `meta ${goals.casa.abordagens}`
              : 'sem meta ainda'
          }
          progress={{ value: casa.abordagens, goal: goals.casa.abordagens }}
        />
        <MetricCard
          icon={<Handshake size={16} />}
          label="Mandatos"
          value={String(casa.mandatos)}
          hint={
            goals.casa.mandatos > 0 ? `meta ${goals.casa.mandatos}` : 'sem meta ainda'
          }
          progress={{ value: casa.mandatos, goal: goals.casa.mandatos }}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <section className="admin-surface rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">Pipeline da praça</h3>
              <p className="text-xs text-black/45">Status das contas na mesa</p>
            </div>
            <Link
              to="/admin/kpis"
              className="text-xs tracking-wide text-[#9c8563] hover:text-black"
            >
              Ver KPIs
            </Link>
          </div>
          <ul className="mt-5 space-y-4">
            {PIPELINE.map((status) => {
              const count = pipeline[status]
              const pct = Math.round((count / pipelineMax) * 100)
              return (
                <li key={status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{statusLabel(status)}</span>
                    <span className="text-xs text-black/45">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/6">
                    <div
                      className="h-full rounded-full bg-[#9c8563]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="admin-surface rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Movimento ao vivo</h3>
            <span className="flex items-center gap-1.5 text-[11px] text-[#21553a]">
              <span className="size-1.5 rounded-full bg-[#21553a]" />
              Mesa
            </span>
          </div>
          {feed.length === 0 ? (
            <p className="mt-6 text-sm text-black/50">
              Ainda sem movimento. O primeiro cadastro aparece aqui.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {feed.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ol>
          )}
          <Link
            to="/admin/crm"
            className="mt-5 inline-flex items-center gap-1 text-sm text-[#9c8563]"
          >
            Abrir CRM <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <section className="admin-surface rounded-2xl p-5">
          <h3 className="font-medium">Atalhos da mesa</h3>
          <p className="text-xs text-black/45">O que os três usam o dia inteiro</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickTile
              title="Nova conta"
              hint="Já nasce com dono"
              className="bg-[#050505] text-white"
              icon={<Plus size={18} />}
              onClick={onCreate}
            />
            <Link
              to="/admin/crm"
              className="rounded-2xl bg-[#9c8563] p-4 text-white transition-transform hover:-translate-y-0.5"
            >
              <Building2 size={18} />
              <p className="mt-6 font-medium">Abrir CRM</p>
              <p className="mt-1 text-xs text-white/70">Lista da praça</p>
            </Link>
            <Link
              to="/admin/kpis"
              className="rounded-2xl bg-[#21553a] p-4 text-white transition-transform hover:-translate-y-0.5"
            >
              <ChartColumnIncreasing size={18} />
              <p className="mt-6 font-medium">Ver KPIs</p>
              <p className="mt-1 text-xs text-white/70">Realizado do mês</p>
            </Link>
            <Link
              to="/admin/metas"
              className="rounded-2xl bg-[#c4b49a] p-4 text-[#050505] transition-transform hover:-translate-y-0.5"
            >
              <Target size={18} />
              <p className="mt-6 font-medium">Ajustar metas</p>
              <p className="mt-1 text-xs text-black/55">Combinado da sexta</p>
            </Link>
          </div>
        </section>

        <section className="admin-surface rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Carteira por sócio</h3>
            <span className="text-xs text-black/40">contas no nome</span>
          </div>
          <ol className="mt-4 space-y-3">
            {ranked.map((row, index) => (
              <li
                key={row.partner.id}
                className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-3 py-2.5"
              >
                <span className="w-4 text-xs text-black/35">{index + 1}</span>
                <OwnerMark id={row.partner.id} />
                <span className="flex-1 text-sm">{row.partner.name}</span>
                <span className="font-heading text-lg tracking-tight">{row.count}</span>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-3 py-2.5">
              <span className="w-4 text-xs text-black/35">—</span>
              <OwnerMark id={null} />
              <span className="flex-1 text-sm">Sem dono</span>
              <span className="font-heading text-lg tracking-tight">{livre}</span>
            </li>
          </ol>
        </section>
      </div>

      <section className="admin-surface rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">Fila que pede ação</h3>
            <p className="text-xs text-black/45">Itens vencidos ou sem dono</p>
          </div>
          <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs">
            {due.length + livre} pendentes
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <PendingCard
            tone="warm"
            count={mine.length}
            title="Minha fila"
            body="Follow-ups no seu nome. Abra o card e registre hoje."
            action="Revisar agora"
            onAction={() => {
              if (mine[0]) {
                onOpen(mine[0].id)
              }
            }}
          />
          <PendingCard
            tone="cool"
            count={house.length}
            title="Fila da casa"
            body="Vencidos com os outros sócios — visível para os três."
            action="Ver contas"
            onAction={() => {
              if (house[0]) {
                onOpen(house[0].id)
              }
            }}
          />
          <PendingCard
            tone="alert"
            count={livre}
            title="Sem dono"
            body="Conta livre. Pegue uma antes de ligar em cima do outro."
            action="Abrir CRM"
            href="/admin/crm"
          />
        </div>
        {due.length > 0 ? (
          <ul className="mt-4 divide-y divide-black/6">
            {due.slice(0, 4).map((account) => (
              <QueueRow key={account.id} account={account} onOpen={onOpen} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}

function WelcomeStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <article className="admin-welcome-stat px-4 py-3">
      <p className="text-[10px] tracking-[0.14em] text-[#c4b49a] uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-3xl tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-white/45">{hint}</p>
    </article>
  )
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: ReactNode
  label: string
  value: string
  hint: string
  progress: { value: number; goal: number }
}) {
  return (
    <article className="admin-surface rounded-2xl px-5 py-5">
      <div className="flex items-center justify-between text-[#9c8563]">
        <p className="text-[10px] tracking-[0.16em] uppercase">{label}</p>
        {icon}
      </div>
      <p className="font-heading mt-3 text-3xl tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-black/45">{hint}</p>
      <ProgressTrack value={progress.value} goal={progress.goal} />
    </article>
  )
}

function QuickTile({
  title,
  hint,
  className,
  icon,
  onClick,
}: {
  title: string
  hint: string
  className: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      {icon}
      <p className="mt-6 font-medium">{title}</p>
      <p className="mt-1 text-xs opacity-70">{hint}</p>
    </button>
  )
}

function PendingCard({
  tone,
  count,
  title,
  body,
  action,
  onAction,
  href,
}: {
  tone: 'warm' | 'cool' | 'alert'
  count: number
  title: string
  body: string
  action: string
  onAction?: () => void
  href?: string
}) {
  const { surface, count: countClass } = pendingTone(tone)
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <CalendarClock size={18} className="text-black/35" />
        <span className={cn('font-heading text-3xl tracking-tight', countClass)}>
          {count}
        </span>
      </div>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-black/55">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
        {action} <ArrowRight size={14} />
      </span>
    </>
  )

  if (href) {
    return (
      <Link to={href} className={cn('rounded-2xl p-4', surface)}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onAction}
      className={cn('rounded-2xl p-4 text-left', surface)}
    >
      {inner}
    </button>
  )
}

function pendingTone(tone: 'warm' | 'cool' | 'alert'): {
  surface: string
  count: string
} {
  switch (tone) {
    case 'warm':
      return { surface: 'bg-[#f8efe2]', count: 'text-[#6b4e16]' }
    case 'cool':
      return { surface: 'bg-[#eef3f6]', count: 'text-[#1f4a63]' }
    case 'alert':
      return { surface: 'bg-[#f7e8e4]', count: 'text-[#7a2e24]' }
    default: {
      const exhaustive: never = tone
      return exhaustive
    }
  }
}

function QueueRow({
  account,
  onOpen,
}: {
  account: Account
  onOpen: (id: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(account.id)}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <OwnerMark id={account.owner} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{account.name}</span>
          <span className="text-xs text-black/45">
            {listLabel(account.list)} · {account.nextAction || 'Sem próximo passo'}
          </span>
        </span>
        <StatusPill status={account.status} />
        <span className="hidden text-xs text-black/40 sm:inline">
          {formatDay(account.nextActionAt)}
        </span>
      </button>
    </li>
  )
}

function ActivityRow({ item }: { item: Activity }) {
  return (
    <li className="flex items-start gap-3">
      <OwnerMark id={item.by} className="mt-0.5 size-6 text-[10px]" />
      <div className="min-w-0">
        <p className="text-sm leading-snug text-black/75">{item.text}</p>
        <p className="mt-1 text-xs text-black/40">
          {partnerLabel(item.by)} · {formatStamp(item.at)}
        </p>
      </div>
    </li>
  )
}
