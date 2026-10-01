import {
  currentMonth,
  monthGoals,
  PARTNERS,
  partnerLabel,
  type AccountStatus,
  type AdminBoard,
  type PartnerId,
} from '@/data/admin'
import {
  monthActuals,
  ownerCounts,
  pipelineCounts,
  partnerActuals,
  weekActions,
} from '@/lib/admin-kpis'
import {
  OwnerMark,
  ProgressTrack,
  StatusPill,
} from '@/pages/admin/admin-ui'

type AdminKpisProps = {
  board: AdminBoard
  me: PartnerId
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

export function AdminKpis({ board, me }: AdminKpisProps) {
  const month = currentMonth()
  const goals = monthGoals(board, month)
  const casa = monthActuals(board, month)
  const mine = partnerActuals(board, me, month)
  const pipeline = pipelineCounts(board.accounts)
  const owners = ownerCounts(board.accounts)
  const week = weekActions(board)

  return (
    <div className="space-y-10">
      <p className="max-w-2xl text-sm text-black/60">
        Números saem do CRM: abordagem com data, conversa e mandato. Meta mora na
        aba Metas — aqui é o realizado.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Abordagens do mês"
          value={casa.abordagens}
          goal={goals.casa.abordagens}
        />
        <Stat
          label="Reuniões / conversas"
          value={casa.reunioes}
          goal={goals.casa.reunioes}
        />
        <Stat
          label="Mandatos"
          value={casa.mandatos}
          goal={goals.casa.mandatos}
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
          <strong className="font-medium text-black">{mine.abordagens}</strong>{' '}
          abordagens,{' '}
          <strong className="font-medium text-black">{mine.reunioes}</strong>{' '}
          conversas e{' '}
          <strong className="font-medium text-black">{mine.mandatos}</strong>{' '}
          mandatos nas contas do seu nome.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl tracking-tight">Pipeline</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((status) => (
            <li key={status} className="admin-surface rounded-2xl px-4 py-4">
              <StatusPill status={status} />
              <p className="font-heading mt-3 text-3xl tracking-tight">
                {pipeline[status]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl tracking-tight">Quem carrega a carteira</h2>
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
                  {owners[partner.id]}
                </p>
              </div>
            </li>
          ))}
          <li className="admin-surface flex items-center gap-3 rounded-2xl px-4 py-4">
            <OwnerMark id={null} className="size-9 text-sm" />
            <div>
              <p className="text-sm text-black/50">Sem dono</p>
              <p className="font-heading text-2xl tracking-tight">{owners.livre}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  )
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
