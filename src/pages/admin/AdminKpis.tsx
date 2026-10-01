import {
  currentMonth,
  monthGoals,
  PARTNERS,
  partnerLabel,
  statusLabel,
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
    <div className="space-y-8">
      <header>
        <p className="text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
          KPIs · {month}
        </p>
        <h1 className="font-heading mt-2 text-3xl tracking-tight">
          O que a casa está produzindo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/60">
          Números saem do CRM: abordagem com data, conversa e mandato. Meta
          mora na aba Metas — aqui é o realizado.
        </p>
      </header>

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

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="font-heading text-xl">Sua semana, {partnerLabel(me)}</h2>
        <p className="mt-2 text-sm text-black/60">
          {week} abordagens na casa nesta semana. No mês, você tem{' '}
          {mine.abordagens} abordagens, {mine.reunioes} conversas e{' '}
          {mine.mandatos} mandatos nas contas do seu nome.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl">Pipeline</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((status) => (
            <li
              key={status}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
            >
              <p className="text-[10px] tracking-[0.14em] text-[#9c8563] uppercase">
                {statusLabel(status)}
              </p>
              <p className="font-heading mt-1 text-2xl">{pipeline[status]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl">Quem carrega a carteira</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-4">
          {PARTNERS.map((partner) => (
            <li
              key={partner.id}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
            >
              <p className="text-sm text-black/50">{partner.name}</p>
              <p className="font-heading mt-1 text-2xl">{owners[partner.id]}</p>
            </li>
          ))}
          <li className="rounded-xl border border-black/10 bg-white px-4 py-3">
            <p className="text-sm text-black/50">Sem dono</p>
            <p className="font-heading mt-1 text-2xl">{owners.livre}</p>
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
  const caption = goal > 0 ? `de ${goal}` : 'sem meta ainda'
  return (
    <article className="rounded-xl border border-black/10 bg-white px-4 py-4">
      <p className="text-[10px] tracking-[0.16em] text-[#9c8563] uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-3xl">{value}</p>
      <p className="mt-1 text-xs text-black/50">{caption}</p>
    </article>
  )
}
