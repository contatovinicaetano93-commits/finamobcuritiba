import { Link } from 'react-router-dom'
import {
  formatDay,
  formatStamp,
  formatTodayHeading,
  listLabel,
  todayIso,
  type Account,
  type Activity,
  type AdminBoard,
  type PartnerId,
} from '@/data/admin'
import { dueQueue, weekActions } from '@/lib/admin-kpis'
import { Button } from '@/components/ui/button'
import { OwnerMark, PageIntro, StatusPill } from '@/pages/admin/admin-ui'

const RITUAL = [
  {
    n: '01',
    title: 'Manhã',
    text: 'Abra a própria fila antes de ligar para conta nova.',
  },
  {
    n: '02',
    title: 'Dono',
    text: 'Não abordar conta do outro sócio sem combinado no card.',
  },
  {
    n: '03',
    title: 'Registro',
    text: 'Call ou WhatsApp entra no mesmo dia: data, próximo passo, dono.',
  },
  {
    n: '04',
    title: 'Sexta',
    text: 'Quinze minutos em KPIs e metas — o que fechou, o que travou.',
  },
] as const

type AdminHojeProps = {
  board: AdminBoard
  me: PartnerId
  onOpen: (id: string) => void
}

export function AdminHoje({ board, me, onOpen }: AdminHojeProps) {
  const today = todayIso()
  const due = dueQueue(board.accounts, today)
  const mine = due.filter((account) => account.owner === me)
  const house = due.filter((account) => account.owner !== me)
  const week = weekActions(board)
  const open = board.accounts.filter(
    (account) =>
      account.status === 'novo' ||
      account.status === 'abordar' ||
      account.status === 'em_conversa' ||
      account.status === 'follow_up',
  ).length
  const livre = board.accounts.filter((account) => !account.owner).length
  const feed = board.activity.slice(0, 8)

  return (
    <div className="space-y-10">
      <PageIntro kicker={`Hoje · ${formatTodayHeading(today)}`} title="Fila da mesa">
        Um dono por conta. Quem pegou, registra a abordagem no mesmo dia. Conta
        sem dono fica visível para os três.
      </PageIntro>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Na fila de hoje" value={String(due.length)} hint="Vencidas e do dia" />
        <KpiCard label="Abordagens na semana" value={String(week)} hint="Último contato esta semana" />
        <KpiCard
          label="Contas abertas"
          value={String(open)}
          hint={`${livre} livres na mesa`}
        />
      </div>

      <section className="admin-surface overflow-hidden rounded-2xl">
        <div className="border-b border-black/6 px-5 py-4">
          <h2 className="font-heading text-xl tracking-tight">Como os três trabalham</h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {RITUAL.map((step) => (
            <li
              key={step.n}
              className="border-b border-black/6 px-5 py-5 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
            >
              <p className="text-[10px] tracking-[0.2em] text-[#9c8563]">{step.n}</p>
              <p className="mt-2 font-medium">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-black/60">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <QueueBlock
        title="Minha fila"
        empty="Nada vencido no seu nome. Pegue uma conta livre no CRM ou marque o próximo passo."
        accounts={mine}
        onOpen={onOpen}
      />
      <QueueBlock
        title="Fila da casa"
        empty="Ninguém da mesa tem follow-up vencido fora da sua lista."
        accounts={house}
        onOpen={onOpen}
      />

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl tracking-tight">O que a mesa fez</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/crm">Abrir CRM</Link>
          </Button>
        </div>
        {feed.length === 0 ? (
          <p className="mt-4 text-sm text-black/55">
            Ainda sem movimento. O primeiro cadastro e a primeira abordagem
            aparecem aqui para Vini, Rafa e Tadeu.
          </p>
        ) : (
          <ol className="relative mt-5 space-y-3 border-l border-black/10 pl-5">
            {feed.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <article className="admin-surface rounded-2xl px-5 py-5">
      <p className="text-[10px] tracking-[0.16em] text-[#9c8563] uppercase">
        {label}
      </p>
      <p className="font-heading mt-3 text-4xl tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-black/45">{hint}</p>
    </article>
  )
}

function QueueBlock({
  title,
  empty,
  accounts,
  onOpen,
}: {
  title: string
  empty: string
  accounts: Account[]
  onOpen: (id: string) => void
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-xl tracking-tight">{title}</h2>
        <span className="text-xs tracking-[0.12em] text-black/40 uppercase">
          {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
        </span>
      </div>
      {accounts.length === 0 ? (
        <p className="admin-surface mt-4 rounded-2xl px-5 py-6 text-sm leading-relaxed text-black/55">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onOpen(account.id)}
                className="admin-card flex w-full flex-col gap-3 rounded-2xl px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex min-w-0 items-start gap-3">
                  <OwnerMark id={account.owner} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="block font-medium">{account.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/50">
                      {listLabel(account.list)}
                      <StatusPill status={account.status} />
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-3 text-sm text-black/70 sm:shrink-0">
                  <span className="max-w-[16rem]">
                    {account.nextAction || 'Sem próximo passo'}
                  </span>
                  <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs tracking-wide">
                    {formatDay(account.nextActionAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ActivityRow({ item }: { item: Activity }) {
  return (
    <li className="relative">
      <span className="absolute top-1.5 -left-[1.41rem] size-2 rounded-full bg-[#9c8563]" />
      <div className="flex items-start gap-3">
        <OwnerMark id={item.by} className="mt-0.5 size-6 text-[10px]" />
        <div>
          <p className="text-xs text-black/45">{formatStamp(item.at)}</p>
          <p className="mt-1 text-sm text-black/75">{item.text}</p>
        </div>
      </div>
    </li>
  )
}
