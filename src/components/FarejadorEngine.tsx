import { useMemo, useState, type ReactNode } from 'react'
import { FarejadorScoreCard } from '@/components/FarejadorScoreCard'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CITIES,
  cityLabel,
  distanceFromSp,
  findCity,
  searchCities,
  type City,
} from '@/data/cities'
import {
  CONCEPT_FIELDS,
  EMPTY_INPUT,
  GOVERNANCE_FIELDS,
  MESA_SAMPLE_INPUT,
  NECESSIDADE_OPTIONS,
  parseNecessidade,
  scoreFarejador,
  type FarejadorInput,
  type Intensity,
} from '@/lib/farejador'
import { cn } from '@/lib/utils'

const INTENSITY: { value: Intensity; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
]

export function FarejadorEngine({
  onLead,
}: {
  onLead?: (result: ReturnType<typeof scoreFarejador>) => void
}) {
  const [cityId, setCityId] = useState('curitiba-pr')
  const [cityQuery, setCityQuery] = useState('Curitiba · PR')
  const [openCities, setOpenCities] = useState(false)
  const [input, setInput] = useState<FarejadorInput>(() =>
    inputFromCity(findCity('curitiba-pr'), EMPTY_INPUT),
  )

  const matches = useMemo(() => searchCities(cityQuery), [cityQuery])
  const result = useMemo(() => scoreFarejador(input), [input])
  const empty = input.vgv <= 0 && input.population <= 0

  function patch(partial: Partial<FarejadorInput>) {
    setInput((current) => ({ ...current, ...partial }))
  }

  function applyCity(city: City) {
    setCityId(city.id)
    setCityQuery(cityLabel(city))
    setOpenCities(false)
    setInput((current) => inputFromCity(city, current))
  }

  function loadSample() {
    setCityId('')
    setCityQuery('Exemplo da mesa')
    setInput(MESA_SAMPLE_INPUT)
  }

  function reset() {
    const curitiba = findCity('curitiba-pr')
    setCityId('curitiba-pr')
    setCityQuery(curitiba ? cityLabel(curitiba) : '')
    setInput(inputFromCity(curitiba, EMPTY_INPUT))
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-sm border border-black/10 bg-white p-5 text-black sm:p-7">
          <SectionKicker index="00" title="Informações do projeto" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Cidade principal" htmlFor="city">
              <div className="relative">
                <Input
                  id="city"
                  value={cityQuery}
                  onChange={(event) => {
                    setCityQuery(event.target.value)
                    setOpenCities(true)
                  }}
                  onFocus={() => setOpenCities(true)}
                  onBlur={() => {
                    window.setTimeout(() => setOpenCities(false), 120)
                  }}
                  placeholder="Digite a cidade"
                  className="h-10"
                  autoComplete="off"
                />
                {openCities ? (
                  <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg">
                    {(matches.length > 0 ? matches : CITIES).map((city) => (
                      <li key={city.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full px-3 py-2 text-left text-sm hover:bg-black/5',
                            city.id === cityId && 'bg-black/5',
                          )}
                          onMouseDown={() => applyCity(city)}
                        >
                          {cityLabel(city)}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Field>
            <NumberField
              label="VGV do empreendimento (R$)"
              id="vgv"
              value={input.vgv}
              onChange={(vgv) => patch({ vgv })}
            />
            <NumberField
              label="Total de unidades"
              id="units"
              value={input.units}
              onChange={(units) => patch({ units })}
            />
            <Field label="Necessidade (prioridade de uso)" htmlFor="necessidade">
              <select
                id="necessidade"
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={input.necessidade}
                onChange={(event) =>
                  patch({ necessidade: parseNecessidade(event.target.value) })
                }
              >
                {NECESSIDADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-5 text-black sm:p-7">
          <SectionKicker
            index="01"
            title="Praça"
            hint="Pop, PIB e distância de SP entram automaticamente pela cidade. Dá para ajustar na mão."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <NumberField
              label="População (habitantes)"
              id="population"
              value={input.population}
              onChange={(population) => patch({ population })}
            />
            <NumberField
              label="PIB municipal (R$ bi)"
              id="pib"
              value={input.pibBi}
              step="0.1"
              onChange={(pibBi) => patch({ pibBi })}
            />
            <NumberField
              label="Distância de SP (km)"
              id="distance"
              value={input.distanceKm}
              step="1"
              onChange={(distanceKm) => patch({ distanceKm })}
            />
          </div>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-5 text-black sm:p-7">
          <SectionKicker
            index="02"
            title="Produto"
            hint="Conceito: 5 dimensões × Baixa 0 / Média 1 / Alta 2 = máximo 10."
          />
          <div className="mt-5 space-y-4">
            {CONCEPT_FIELDS.map((field) => (
              <div
                key={field.key}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm">{field.label}</p>
                <Segmented
                  value={input.concept[field.key]}
                  options={INTENSITY}
                  onChange={(value) =>
                    patch({
                      concept: { ...input.concept, [field.key]: value },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-5 text-black sm:p-7">
          <SectionKicker
            index="03"
            title="Economics"
            hint="Margem cap 10 em 30%. Equity cap 10 em 10%. Vendas e obras cap 10 em 30%."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Margem líquida (%)"
              id="margin"
              value={input.marginPct}
              step="0.1"
              onChange={(marginPct) => patch({ marginPct })}
            />
            <NumberField
              label="Equity (% do VGV)"
              id="equity"
              value={input.equityPct}
              step="0.1"
              onChange={(equityPct) => patch({ equityPct })}
            />
            <NumberField
              label="Vendas (% do VGV)"
              id="sales"
              value={input.salesPct}
              step="0.1"
              onChange={(salesPct) => patch({ salesPct })}
            />
            <NumberField
              label="% obras executadas"
              id="works"
              value={input.worksPct}
              step="0.1"
              onChange={(worksPct) => patch({ worksPct })}
            />
          </div>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-5 text-black sm:p-7">
          <SectionKicker
            index="04"
            title="Player / Sponsor"
            hint="Robustez = (PL incorporadora + PL sócios) ÷ VGV. Cap 10 em 50%. Governança: 5 itens × 2 pts."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <NumberField
              label="Nº de entregas"
              id="deliveries"
              value={input.deliveries}
              onChange={(deliveries) => patch({ deliveries })}
            />
            <NumberField
              label="PL incorporadora (R$)"
              id="pl-inc"
              value={input.plIncorporadora}
              onChange={(plIncorporadora) => patch({ plIncorporadora })}
            />
            <NumberField
              label="PL sócios (R$)"
              id="pl-soc"
              value={input.plSocios}
              onChange={(plSocios) => patch({ plSocios })}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {GOVERNANCE_FIELDS.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() =>
                  patch({
                    governance: {
                      ...input.governance,
                      [field.key]: !input.governance[field.key],
                    },
                  })
                }
                className={cn(
                  'rounded-[3px] border px-3 py-2 text-sm tracking-[0.04em] transition-colors',
                  input.governance[field.key]
                    ? 'border-black bg-[#050505] text-white'
                    : 'border-black/15 text-black/70 hover:border-black/40',
                )}
                aria-pressed={input.governance[field.key]}
              >
                {field.label} +2
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="h-11 px-5" onClick={loadSample}>
            Carregar exemplo da mesa
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-5"
            onClick={reset}
          >
            Limpar
          </Button>
          {onLead ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={() => onLead(result)}
            >
              Enviar leitura para a equipe
            </Button>
          ) : null}
        </div>
      </div>
      <div className="lg:sticky lg:top-24">
        <FarejadorScoreCard result={result} empty={empty} />
      </div>
    </div>
  )
}

function inputFromCity(
  city: City | undefined,
  current: FarejadorInput,
): FarejadorInput {
  if (!city) {
    return current
  }
  return {
    ...current,
    population: city.population,
    pibBi: city.pibBi,
    distanceKm: Math.round(distanceFromSp(city)),
  }
}

function SectionKicker({
  index,
  title,
  hint,
}: {
  index: string
  title: string
  hint?: string
}) {
  return (
    <div>
      <Kicker className="text-bronze" rule={false}>
        Pilar {index}
      </Kicker>
      <h2 className="font-heading mt-3 text-2xl">{title}</h2>
      {hint ? <p className="mt-2 text-sm text-black/55">{hint}</p> : null}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function NumberField({
  label,
  id,
  value,
  step = '1',
  onChange,
}: {
  label: string
  id: string
  value: number
  step?: string
  onChange: (value: number) => void
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="h-10"
      />
    </Field>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-3 rounded-sm bg-black/5 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[3px] px-3 py-1.5 text-xs tracking-[0.08em]',
            option.value === value
              ? 'bg-[#050505] text-white'
              : 'text-black/60 hover:text-black',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
