import { Link } from 'react-router-dom'
import {
  listLabel,
  partnerLabel,
  statusLabel,
  todayIso,
  type Account,
  type Activity,
  type PartnerId,
} from '@/data/admin'
import { dueQueue, weekActions } from '@/lib/admin-kpis'
import { Button } from '@/components/ui/button'
import type { AdminBoard } from '@/data/admin'

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
    <div className="space-y-8">
      <header>
        <p className="text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
          Hoje · {today}
        </p>
        <h1 className="font-heading mt-2 text-3xl tracking-tight">Fila da mesa</h1>
        <p className="mt-2 max-w-2xl text-sm text-black/60">
          Um dono por conta. Quem pegou, registra a abordagem no mesmo dia. Conta
          sem dono fica visível para os três.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Na fila de hoje" value={String(due.length)} />
        <KpiCard label="Abordagens na semana" value={String(week)} />
        <KpiCard label="Contas abertas" value={`${open} · ${livre} livres`} />
      </div>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="font-heading text-xl">Como os três trabalham</h2>
        <ul className="mt-3 space-y-2 text-sm text-black/70">
          <li>Manhã: cada um abre a própria fila antes de ligar para conta nova.</li>
          <li>Não abordar conta do outro sócio sem combinado no card.</li>
          <li>Call ou WhatsApp entra no mesmo dia: data, próximo passo, dono.</li>
          <li>Sexta: 15 minutos em KPIs e metas — o que fechou, o que travou.</li>
        </ul>
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
          <h2 className="font-heading text-xl">O que a mesa fez</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/crm">Abrir CRM</Link>
          </Button>
        </div>
        {feed.length === 0 ? (
          <p className="mt-3 text-sm text-black/55">
            Ainda sem movimento. O primeiro cadastro e a primeira abordagem
            aparecem aqui para Vini, Rafa e Tadeu.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {feed.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-black/10 bg-white px-4 py-4">
      <p className="text-[10px] tracking-[0.16em] text-[#9c8563] uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-2xl">{value}</p>
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
      <h2 className="font-heading text-xl">{title}</h2>
      {accounts.length === 0 ? (
        <p className="mt-3 text-sm text-black/55">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onOpen(account.id)}
                className="flex w-full flex-col gap-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-medium">{account.name}</span>
                  <span className="text-xs text-black/50">
                    {listLabel(account.list)} · {statusLabel(account.status)} ·{' '}
                    {partnerLabel(account.owner)}
                  </span>
                </span>
                <span className="text-sm text-black/70">
                  {account.nextAction || 'Sem próximo passo'} ·{' '}
                  {account.nextActionAt || 'sem data'}
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
    <li className="rounded-lg border border-black/8 bg-white px-4 py-3 text-sm">
      <p className="text-xs text-black/45">
        {partnerLabel(item.by)} · {item.at.slice(0, 16).replace('T', ' ')}
      </p>
      <p className="mt-1 text-black/75">{item.text}</p>
    </li>
  )
}
