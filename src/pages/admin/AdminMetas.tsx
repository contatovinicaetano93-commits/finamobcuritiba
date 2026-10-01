import {
  currentMonth,
  EMPTY_GOALS,
  monthGoals,
  PARTNERS,
  type AdminBoard,
  type GoalSet,
  type MonthGoals,
  type PartnerId,
} from '@/data/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AdminMetasProps = {
  board: AdminBoard
  me: PartnerId
  onSave: (goals: MonthGoals) => void
}

export function AdminMetas({ board, me, onSave }: AdminMetasProps) {
  const month = currentMonth()
  const current = monthGoals(board, month)

  function patch(who: 'casa' | PartnerId, field: keyof GoalSet, value: number) {
    const next: MonthGoals = {
      ...current,
      [who]: { ...current[who], [field]: Number.isFinite(value) ? value : 0 },
    }
    onSave(next)
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
          Metas · {month}
        </p>
        <h1 className="font-heading mt-2 text-3xl tracking-tight">
          O combinado do mês
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/60">
          Casa primeiro, depois o recorte de cada sócio. Número redondo e
          revisável na sexta. Você está logado como{' '}
          {PARTNERS.find((item) => item.id === me)?.name}.
        </p>
      </header>

      <GoalBlock
        title="Meta da casa"
        goals={current.casa}
        onChange={(field, value) => patch('casa', field, value)}
      />
      {PARTNERS.map((partner) => (
        <GoalBlock
          key={partner.id}
          title={partner.name}
          goals={current[partner.id]}
          onChange={(field, value) => patch(partner.id, field, value)}
        />
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onSave({
              month,
              casa: { ...EMPTY_GOALS },
              vini: { ...EMPTY_GOALS },
              rafa: { ...EMPTY_GOALS },
              tadeu: { ...EMPTY_GOALS },
            })
          }
        >
          Zerar metas do mês
        </Button>
      </div>
    </div>
  )
}

function GoalBlock({
  title,
  goals,
  onChange,
}: {
  title: string
  goals: GoalSet
  onChange: (field: keyof GoalSet, value: number) => void
}) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5">
      <h2 className="font-heading text-xl">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <NumberField
          label="Abordagens"
          value={goals.abordagens}
          onChange={(value) => onChange('abordagens', value)}
        />
        <NumberField
          label="Reuniões"
          value={goals.reunioes}
          onChange={(value) => onChange('reunioes', value)}
        />
        <NumberField
          label="Mandatos"
          value={goals.mandatos}
          onChange={(value) => onChange('mandatos', value)}
        />
      </div>
    </section>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="bg-[#f3efe6]"
      />
    </div>
  )
}
