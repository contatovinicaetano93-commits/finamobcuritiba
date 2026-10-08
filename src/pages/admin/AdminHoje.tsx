import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
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
  formatDay,
  formatStamp,
  formatTodayHeading,
  listLabel,
  partnerById,
  partnerLabel,
  statusLabel,
  todayIso,
  type Account,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'
import { dueQueue, ownerCounts, pipelineCounts } from '@/lib/admin-kpis'
import {
  createMesaActivity,
  fetchMesaActivity,
  fetchMesaKpis,
  fetchMesaSummary,
  type MesaActivity,
  type MesaAccount,
  type MesaKpis,
  type MesaSummary,
} from '@/lib/mesa-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  me: PartnerId
  dueAccounts: MesaAccount[]
  reloadToken: number
  onOpen: (id: string) => void
  onCreate: () => void
  onExport: () => void
  onActivityLogged?: () => void
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
  const [activity, setActivity] = useState<MesaActivity[]>([])
  const [kpis, setKpis] = useState<MesaKpis | null>(null)
  const [summary, setSummary] = useState<MesaSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      const [activityResult, kpisResult, summaryResult] = await Promise.all([
        fetchMesaActivity({ partnerId: me, day: today, limit: 40 }),
        fetchMesaKpis(today.slice(0, 7)),
        fetchMesaSummary({ scope: 'praca' }),
      ])
      if (cancelled) {
        return
      }
      if (!activityResult.ok && !kpisResult.ok && !summaryResult.ok) {
        setError(
          activityResult.ok
            ? kpisResult.ok
              ? summaryResult.error
              : kpisResult.error
            : activityResult.error,
        )
        setLoading(false)
        return
      }
      setError('')
      if (activityResult.ok) {
        setActivity(activityResult.data.activity)
      }
      if (kpisResult.ok) {
        setKpis(kpisResult.data)
      }
      if (summaryResult.ok) {
        setSummary(summaryResult.data)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [me, today, reloadToken])

  const due = dueQueue(dueAccounts, today)
  const mine = due.filter((account) => account.owner === me)
  const house = due.filter((account) => account.owner !== me)
  const owners = ownerCounts(dueAccounts)
  const pipeline = pipelineCounts(dueAccounts)
  const livre = summary?.livre ?? owners.livre
  const open =
    (summary?.novo ?? 0) +
    (summary?.abordar ?? 0) +
    (summary?.em_conversa ?? 0) +
    (summary?.follow_up ?? 0)
  const goals = kpis?.goals
  const casa = kpis?.actuals.casa
  const week = kpis?.week.casa ?? 0
  const pipelineMax = Math.max(1, ...PIPELINE.map((status) => pipeline[status]))
  const logOptions = dueAccounts.filter(
    (account) => account.owner === me || account.owner === null,
  )

  async function handleLog(event: FormEvent) {
    event.preventDefault()
    const text = note.trim()
    if (!text) {
      setSaveError('Escreva o que foi falado na abordagem.')
      return
    }
    setSaving(true)
    setSaveError('')
    setSaveOk('')
    const result = await createMesaActivity({
      by: me,
      note: text,
      companyId: companyId || undefined,
      kind: 'abordagem',
    })
    setSaving(false)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    setNote('')
    setSaveOk('Abordagem registrada.')
    setActivity((current) => [result.data.activity, ...current])
    onActivityLogged?.()
  }

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
          <WelcomeStat label="Abordagens na semana" value={String(week)} hint="Log da mesa" />
          <WelcomeStat label="Contas abertas" value={String(open)} hint="Pipeline ativo" />
          <WelcomeStat label="Sem dono" value={String(livre)} hint="Livres na mesa" />
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl bg-[#f7e8e4] px-4 py-3 text-sm text-[#7a2e24]" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-black/50">Carregando movimento do Neon…</p>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <section className="admin-surface rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">Sua atividade de hoje</h3>
              <p className="text-xs text-black/45">
                Abordagens de {partnerById(me).name} neste dia
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs">
              {activity.length}
            </span>
          </div>
          {activity.length === 0 && !loading ? (
            <p className="mt-6 text-sm text-black/50">
              Ainda sem registro hoje. Logue a primeira abordagem ao lado.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ol>
          )}
        </section>

        <section className="admin-surface rounded-2xl p-5">
          <h3 className="font-medium">Registrar abordagem</h3>
          <p className="text-xs text-black/45">Fica no log do Neon no seu nome</p>
          <form className="mt-4 space-y-3" onSubmit={(event) => void handleLog(event)}>
            <div className="space-y-2">
              <Label>Conta (opcional)</Label>
              <Select
                value={companyId || 'none'}
                onValueChange={(value) =>
                  setCompanyId(value === 'none' ? '' : value)
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Sem conta vinculada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem conta vinculada</SelectItem>
                  {logOptions.slice(0, 40).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoje-note">O que foi falado</Label>
              <Textarea
                id="hoje-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Quem atendeu, combinado, próximo passo."
                className="min-h-24 bg-white"
              />
            </div>
            {saveError ? (
              <p className="text-sm text-red-700" role="alert">
                {saveError}
              </p>
            ) : null}
            {saveOk ? (
              <p className="text-sm text-[#21553a]" role="status">
                {saveOk}
              </p>
            ) : null}
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Salvando…' : 'Logar abordagem'}
            </Button>
          </form>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Building2 size={16} />}
          label="Incorporadoras"
          value={String(summary?.incorporadora ?? 0)}
          hint={`${summary?.construtora ?? 0} construtoras na mesa`}
          progress={{
            value: summary?.incorporadora ?? 0,
            goal: Math.max(summary?.total ?? 1, 1),
          }}
        />
        <MetricCard
          icon={<Users size={16} />}
          label="Novos / prospecção"
          value={String(summary?.prospeccao ?? 0)}
          hint="Entradas ainda sem ativação"
          progress={{
            value: summary?.prospeccao ?? 0,
            goal: Math.max(summary?.total ?? 1, 1),
          }}
        />
        <MetricCard
          icon={<Phone size={16} />}
          label="Abordagens do mês"
          value={String(casa?.abordagens ?? 0)}
          hint={
            goals && goals.casa.abordagens > 0
              ? `meta ${goals.casa.abordagens}`
              : 'sem meta ainda'
          }
          progress={{
            value: casa?.abordagens ?? 0,
            goal: goals?.casa.abordagens ?? 0,
          }}
        />
        <MetricCard
          icon={<Handshake size={16} />}
          label="Mandatos"
          value={String(casa?.mandatos ?? 0)}
          hint={
            goals && goals.casa.mandatos > 0
              ? `meta ${goals.casa.mandatos}`
              : 'sem meta ainda'
          }
          progress={{
            value: casa?.mandatos ?? 0,
            goal: goals?.casa.mandatos ?? 0,
          }}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <section className="admin-surface rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">Pipeline da praça</h3>
              <p className="text-xs text-black/45">Status das contas na fila</p>
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
              const count =
                summary?.[status as keyof MesaSummary] !== undefined
                  ? Number(summary[status as keyof MesaSummary])
                  : pipeline[status]
              const pct = Math.round((count / Math.max(pipelineMax, count, 1)) * 100)
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

function ActivityRow({ item }: { item: MesaActivity }) {
  return (
    <li className="flex items-start gap-3">
      <OwnerMark id={item.by} className="mt-0.5 size-6 text-[10px]" />
      <div className="min-w-0">
        <p className="text-sm leading-snug text-black/75">{item.text}</p>
        <p className="mt-1 text-xs text-black/40">
          {item.companyName ? `${item.companyName} · ` : ''}
          {partnerLabel(item.by)} · {formatStamp(item.at)}
        </p>
      </div>
    </li>
  )
}
