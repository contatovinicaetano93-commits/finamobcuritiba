import type { ReactNode } from 'react'
import {
  currentMonth,
  EMPTY_GOALS,
  formatMonthLabel,
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
import { OwnerMark, PageIntro } from '@/pages/admin/admin-ui'

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
      <PageIntro kicker={`Metas · ${formatMonthLabel(month)}`} title="O combinado do mês">
        Casa primeiro, depois o recorte de cada sócio. Número redondo e
        revisável na sexta. Você está logado como{' '}
        {PARTNERS.find((item) => item.id === me)?.name}.
      </PageIntro>

      <GoalBlock
        title="Meta da casa"
        mark={
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#9c8563] text-[11px] font-medium text-white">
            C
          </span>
        }
        goals={current.casa}
        onChange={(field, value) => patch('casa', field, value)}
      />
      {PARTNERS.map((partner) => (
        <GoalBlock
          key={partner.id}
          title={partner.name}
          mark={<OwnerMark id={partner.id} className="size-8" />}
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
  mark,
  goals,
  onChange,
}: {
  title: string
  mark: ReactNode
  goals: GoalSet
  onChange: (field: keyof GoalSet, value: number) => void
}) {
  return (
    <section className="admin-surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3">
        {mark}
        <h2 className="font-heading text-xl tracking-tight">{title}</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
        className="h-12 bg-white font-heading text-2xl tracking-tight"
      />
    </div>
  )
}
