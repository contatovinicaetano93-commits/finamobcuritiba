import { useEffect, useState, type ReactNode } from 'react'
import {
  currentMonth,
  EMPTY_GOALS,
  PARTNERS,
  type GoalSet,
  type MonthGoal,
  type PartnerId,
} from '@/data/admin'
import { listGoals, upsertGoals } from '@/lib/mesa-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OwnerMark } from '@/pages/admin/admin-ui'

type AdminMetasProps = {
  me: PartnerId
  reloadToken?: number
  onSaved?: () => void
}

function blankGoals(month: string): MonthGoal {
  return {
    month,
    casa: { ...EMPTY_GOALS },
    vini: { ...EMPTY_GOALS },
    rafa: { ...EMPTY_GOALS },
    tadeu: { ...EMPTY_GOALS },
  }
}

export function AdminMetas({ me, reloadToken = 0, onSaved }: AdminMetasProps) {
  const month = currentMonth()
  const [draft, setDraft] = useState<MonthGoal>(() => blankGoals(month))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      const result = await listGoals(month)
      if (cancelled) {
        return
      }
      if (!result.ok) {
        setError(result.error)
        setDraft(blankGoals(month))
        setLoading(false)
        return
      }
      setError('')
      setDraft(result.data.goals)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [month, reloadToken])

  function patch(who: 'casa' | PartnerId, field: keyof GoalSet, value: number) {
    setDraft((current) => ({
      ...current,
      [who]: {
        ...current[who],
        [field]: Number.isFinite(value) ? Math.max(0, value) : 0,
      },
    }))
    setOk('')
  }

  async function persist(next: MonthGoal) {
    setSaving(true)
    setError('')
    setOk('')
    const result = await upsertGoals({ ...next, month })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDraft(result.data.goals)
    setOk('Metas salvas no Neon.')
    onSaved?.()
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-black/60">
        Casa primeiro, depois o recorte de cada sócio. Número redondo e
        revisável na sexta. Você está logado como{' '}
        {PARTNERS.find((item) => item.id === me)?.name}. Metas de {month}{' '}
        persistem no Neon.
      </p>

      {loading ? (
        <p className="text-sm text-black/50">Carregando metas…</p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-[#f7e8e4] px-4 py-3 text-sm text-[#7a2e24]" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-2xl bg-[#e8f1eb] px-4 py-3 text-sm text-[#21553a]" role="status">
          {ok}
        </p>
      ) : null}

      <GoalBlock
        title="Meta da casa"
        mark={
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#9c8563] text-[11px] font-medium text-white">
            C
          </span>
        }
        goals={draft.casa}
        onChange={(field, value) => patch('casa', field, value)}
      />
      {PARTNERS.map((partner) => (
        <GoalBlock
          key={partner.id}
          title={partner.name}
          mark={<OwnerMark id={partner.id} className="size-8" />}
          goals={draft[partner.id]}
          onChange={(field, value) => patch(partner.id, field, value)}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={saving || loading}
          onClick={() => void persist(draft)}
        >
          {saving ? 'Salvando…' : 'Salvar metas'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || loading}
          onClick={() => {
            const cleared = blankGoals(month)
            setDraft(cleared)
            void persist(cleared)
          }}
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
