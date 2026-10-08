import { useEffect, useState } from 'react'
import {
  currentMonth,
  PARTNERS,
  partnerLabel,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'
import {
  fetchMesaKpis,
  fetchMesaSummary,
  type MesaKpis,
  type MesaSummary,
} from '@/lib/mesa-api'
import {
  OwnerMark,
  ProgressTrack,
  StatusPill,
} from '@/pages/admin/admin-ui'

type AdminKpisProps = {
  me: PartnerId
  reloadToken?: number
}

const PIPELINE: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
  'mandato',
  'pausado',
  'sem_fit',
]

export function AdminKpis({ me, reloadToken = 0 }: AdminKpisProps) {
  const month = currentMonth()
  const [kpis, setKpis] = useState<MesaKpis | null>(null)
  const [summary, setSummary] = useState<MesaSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      const [kpisResult, summaryResult] = await Promise.all([
        fetchMesaKpis(month),
        fetchMesaSummary({ scope: 'praca' }),
      ])
      if (cancelled) {
        return
      }
      if (!kpisResult.ok) {
        setError(kpisResult.error)
        setKpis(null)
        setLoading(false)
        return
      }
      setError('')
      setKpis(kpisResult.data)
      if (summaryResult.ok) {
        setSummary(summaryResult.data)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [month, reloadToken])

  const goals = kpis?.goals
  const casa = kpis?.actuals.casa
  const mine = kpis?.actuals[me]
  const week = kpis?.week.casa ?? 0

  return (
    <div className="space-y-10">
      <p className="max-w-2xl text-sm text-black/60">
        Números saem do Neon: activity_log (abordagem, reunião, mandato) contra
        as metas do mês. Nada inventado no navegador.
      </p>

      {loading ? (
        <p className="text-sm text-black/50">Carregando KPIs…</p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-[#f7e8e4] px-4 py-3 text-sm text-[#7a2e24]" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && kpis ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Abordagens do mês"
              value={casa?.abordagens ?? 0}
              goal={goals?.casa.abordagens ?? 0}
            />
            <Stat
              label="Reuniões / conversas"
              value={casa?.reunioes ?? 0}
              goal={goals?.casa.reunioes ?? 0}
            />
            <Stat
              label="Mandatos"
              value={casa?.mandatos ?? 0}
              goal={goals?.casa.mandatos ?? 0}
            />
          </div>

          <section className="admin-surface overflow-hidden rounded-2xl">
            <div className="flex items-center gap-3 border-b border-black/6 px-5 py-4">
              <OwnerMark id={me} />
              <h2 className="font-heading text-xl tracking-tight">
                Sua semana, {partnerLabel(me)}
              </h2>
            </div>
            <p className="px-5 py-5 text-sm leading-relaxed text-black/65">
              {week} abordagens na casa nesta semana. No mês, você tem{' '}
              <strong className="font-medium text-black">
                {mine?.abordagens ?? 0}
              </strong>{' '}
              abordagens,{' '}
              <strong className="font-medium text-black">
                {mine?.reunioes ?? 0}
              </strong>{' '}
              conversas e{' '}
              <strong className="font-medium text-black">
                {mine?.mandatos ?? 0}
              </strong>{' '}
              mandatos no seu log.
            </p>
            <ul className="grid gap-2 border-t border-black/6 px-5 py-4 sm:grid-cols-3">
              {PARTNERS.map((partner) => {
                const actual = kpis.actuals[partner.id]
                const goal = kpis.goals[partner.id]
                return (
                  <li key={partner.id} className="rounded-xl bg-black/[0.03] px-3 py-3">
                    <div className="flex items-center gap-2">
                      <OwnerMark id={partner.id} className="size-7 text-[11px]" />
                      <span className="text-sm">{partner.name}</span>
                    </div>
                    <p className="mt-2 text-xs text-black/50">
                      {actual.abordagens}/{goal.abordagens || '—'} abord. ·{' '}
                      {actual.reunioes}/{goal.reunioes || '—'} reun. ·{' '}
                      {actual.mandatos}/{goal.mandatos || '—'} mand.
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      ) : null}

      <section>
        <h2 className="font-heading text-xl tracking-tight">Pipeline</h2>
        {!summary ? (
          <p className="mt-3 text-sm text-black/50">
            Pipeline da praça indisponível no momento.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((status) => (
              <li key={status} className="admin-surface rounded-2xl px-4 py-4">
                <StatusPill status={status} />
                <p className="font-heading mt-3 text-3xl tracking-tight">
                  {pipelineCount(summary, status)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-heading text-xl tracking-tight">Quem carrega a carteira</h2>
        {!summary ? (
          <p className="mt-3 text-sm text-black/50">Carteira indisponível.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-4">
            {PARTNERS.map((partner) => (
              <li
                key={partner.id}
                className="admin-surface flex items-center gap-3 rounded-2xl px-4 py-4"
              >
                <OwnerMark id={partner.id} className="size-9 text-sm" />
                <div>
                  <p className="text-sm text-black/50">{partner.name}</p>
                  <p className="font-heading text-2xl tracking-tight">
                    {summary[partner.id]}
                  </p>
                </div>
              </li>
            ))}
            <li className="admin-surface flex items-center gap-3 rounded-2xl px-4 py-4">
              <OwnerMark id={null} className="size-9 text-sm" />
              <div>
                <p className="text-sm text-black/50">Sem dono</p>
                <p className="font-heading text-2xl tracking-tight">{summary.livre}</p>
              </div>
            </li>
          </ul>
        )}
      </section>
    </div>
  )
}

function pipelineCount(summary: MesaSummary, status: AccountStatus): number {
  switch (status) {
    case 'novo':
      return summary.novo
    case 'abordar':
      return summary.abordar
    case 'em_conversa':
      return summary.em_conversa
    case 'follow_up':
      return summary.follow_up
    case 'mandato':
      return summary.mandato
    case 'pausado':
    case 'sem_fit':
      return 0
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

function Stat({
  label,
  value,
  goal,
}: {
  label: string
  value: number
  goal: number
}) {
  const caption = goal > 0 ? `${value} de ${goal}` : 'sem meta ainda'
  return (
    <article className="admin-surface rounded-2xl px-5 py-5">
      <p className="text-[10px] tracking-[0.16em] text-[#9c8563] uppercase">
        {label}
      </p>
      <p className="font-heading mt-3 text-4xl tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-black/50">{caption}</p>
      <ProgressTrack value={value} goal={goal} />
    </article>
  )
}
