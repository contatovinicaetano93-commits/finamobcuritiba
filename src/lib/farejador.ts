export type Intensity = 'baixa' | 'media' | 'alta'
export type Necessidade =
  | 'primeira-moradia'
  | 'loteamento'
  | 'segunda-moradia'
  | 'misto'
  | 'comercial'
export type Rating = 'PÉSSIMO' | 'RUIM' | 'MÉDIO' | 'BOM' | 'EXCELENTE'
export type ConceptKey =
  | 'insercao'
  | 'tipologia'
  | 'padrao'
  | 'diferenciacao'
  | 'liquidez'
export type GovernanceKey =
  | 'afetacao'
  | 'spe'
  | 'erp'
  | 'gestao'
  | 'auditoria'

export const CONCEPT_FIELDS: { key: ConceptKey; label: string }[] = [
  { key: 'insercao', label: 'Inserção urbana' },
  { key: 'tipologia', label: 'Tipologia' },
  { key: 'padrao', label: 'Padrão' },
  { key: 'diferenciacao', label: 'Diferenciação' },
  { key: 'liquidez', label: 'Liquidez' },
]

export const GOVERNANCE_FIELDS: { key: GovernanceKey; label: string }[] = [
  { key: 'afetacao', label: 'Patrimônio de Afetação' },
  { key: 'spe', label: 'SPE' },
  { key: 'erp', label: 'ERP' },
  { key: 'gestao', label: 'Gestão independente profissional' },
  { key: 'auditoria', label: 'Auditoria contábil' },
]

export const NECESSIDADE_OPTIONS: { value: Necessidade; label: string }[] = [
  { value: 'primeira-moradia', label: '1ª moradia' },
  { value: 'loteamento', label: 'Loteamento' },
  { value: 'segunda-moradia', label: '2ª moradia' },
  { value: 'misto', label: 'Misto' },
  { value: 'comercial', label: 'Comercial' },
]

export interface FarejadorInput {
  population: number
  pibBi: number
  distanceKm: number
  vgv: number
  units: number
  necessidade: Necessidade
  concept: Record<ConceptKey, Intensity>
  marginPct: number
  equityPct: number
  salesPct: number
  worksPct: number
  deliveries: number
  plIncorporadora: number
  plSocios: number
  governance: Record<GovernanceKey, boolean>
}

export interface PillarBreakdown {
  name: string
  score: number
  rating: Rating
  lines: { label: string; detail: string; score: number }[]
}

export interface FarejadorResult {
  score: number
  rating: Rating
  pillars: PillarBreakdown[]
  best: { label: string; value: string }
  worst: { label: string; value: string }
  ticket: number
  robustezPct: number
}

interface Band {
  at: number
  score: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function interpolate(value: number, bands: Band[]): number {
  if (bands.length === 0) {
    return 0
  }
  if (value <= bands[0].at) {
    return bands[0].score
  }
  for (let index = 1; index < bands.length; index += 1) {
    const next = bands[index]
    if (value <= next.at) {
      const prev = bands[index - 1]
      const span = next.at - prev.at
      const t = span === 0 ? 0 : (value - prev.at) / span
      return prev.score + t * (next.score - prev.score)
    }
  }
  return bands[bands.length - 1].score
}

function capScore(value: number, capAt: number): number {
  if (value <= 0 || capAt <= 0) {
    return 0
  }
  return clamp((value / capAt) * 10, 0, 10)
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function intensityPoints(level: Intensity): number {
  switch (level) {
    case 'baixa':
      return 0
    case 'media':
      return 1
    case 'alta':
      return 2
    default: {
      const exhaustive: never = level
      return exhaustive
    }
  }
}

export function parseNecessidade(value: string): Necessidade {
  const match = NECESSIDADE_OPTIONS.find((option) => option.value === value)
  return match?.value ?? 'primeira-moradia'
}

export function necessidadeScore(value: Necessidade): number {
  switch (value) {
    case 'primeira-moradia':
      return 10
    case 'loteamento':
      return 8
    case 'segunda-moradia':
      return 7
    case 'misto':
      return 6
    case 'comercial':
      return 5
    default: {
      const exhaustive: never = value
      return exhaustive
    }
  }
}

export function ratingOf(score: number): Rating {
  if (score < 2) {
    return 'PÉSSIMO'
  }
  if (score < 4) {
    return 'RUIM'
  }
  if (score < 6) {
    return 'MÉDIO'
  }
  if (score < 8) {
    return 'BOM'
  }
  return 'EXCELENTE'
}

export function formatScore(value: number, digits = 1): string {
  return value.toFixed(digits)
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earth = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.sqrt(a))
}

const POP_BANDS: Band[] = [
  { at: 0, score: 0 },
  { at: 50_000, score: 2 },
  { at: 100_000, score: 4 },
  { at: 250_000, score: 6 },
  { at: 1_000_000, score: 8 },
  { at: 3_000_000, score: 10 },
]

const PIB_BANDS: Band[] = [
  { at: 0, score: 0 },
  { at: 1, score: 2 },
  { at: 5, score: 4 },
  { at: 10, score: 6 },
  { at: 50, score: 8 },
  { at: 100, score: 10 },
]

const DISTANCE_BANDS: Band[] = [
  { at: 0, score: 10 },
  { at: 80, score: 10 },
  { at: 100, score: 9 },
  { at: 500, score: 7 },
  { at: 1500, score: 5 },
  { at: 3000, score: 0 },
]

const TICKET_BANDS: Band[] = [
  { at: 0, score: 0 },
  { at: 200_000, score: 2 },
  { at: 400_000, score: 4 },
  { at: 600_000, score: 6 },
  { at: 800_000, score: 8 },
  { at: 1_200_000, score: 10 },
]

const MARGIN_BANDS: Band[] = [
  { at: 0, score: 0 },
  { at: 10, score: 4 },
  { at: 20, score: 8 },
  { at: 30, score: 10 },
]

function conceptScore(concept: Record<ConceptKey, Intensity>): number {
  return CONCEPT_FIELDS.reduce(
    (sum, field) => sum + intensityPoints(concept[field.key]),
    0,
  )
}

function governancePoints(governance: Record<GovernanceKey, boolean>): number {
  return GOVERNANCE_FIELDS.reduce(
    (sum, field) => sum + (governance[field.key] ? 2 : 0),
    0,
  )
}

export function scoreFarejador(input: FarejadorInput): FarejadorResult {
  const popScore = interpolate(input.population, POP_BANDS)
  const pibScore = interpolate(input.pibBi, PIB_BANDS)
  const distanceScore = interpolate(input.distanceKm, DISTANCE_BANDS)
  const pracaScore = mean([popScore, pibScore, distanceScore])

  const ticket = input.units > 0 ? input.vgv / input.units : 0
  const conceito = conceptScore(input.concept)
  const ticketScore = interpolate(ticket, TICKET_BANDS)
  const needScore = necessidadeScore(input.necessidade)
  const produtoScore = mean([conceito, ticketScore, needScore])

  const marginScore = interpolate(input.marginPct, MARGIN_BANDS)
  const equityScore =
    input.equityPct < 0 ? 0 : capScore(input.equityPct, 10)
  const salesScore = capScore(input.salesPct, 30)
  const worksScore = capScore(input.worksPct, 30)
  const economicsScore = mean([
    marginScore,
    equityScore,
    salesScore,
    worksScore,
  ])

  const deliveriesScore = clamp(input.deliveries, 0, 10)
  const robustezPct =
    input.vgv > 0
      ? ((input.plIncorporadora + input.plSocios) / input.vgv) * 100
      : 0
  const robustezScore = capScore(robustezPct, 50)
  const govPoints = governancePoints(input.governance)
  const playerScore = mean([deliveriesScore, robustezScore, govPoints])

  const pillars: PillarBreakdown[] = [
    {
      name: 'Praça',
      score: pracaScore,
      rating: ratingOf(pracaScore),
      lines: [
        {
          label: 'População',
          detail: `${Math.round(input.population).toLocaleString('pt-BR')} hab`,
          score: popScore,
        },
        {
          label: 'PIB',
          detail: `R$ ${input.pibBi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`,
          score: pibScore,
        },
        {
          label: 'Distância SP',
          detail: `${Math.round(input.distanceKm)} km`,
          score: distanceScore,
        },
      ],
    },
    {
      name: 'Produto',
      score: produtoScore,
      rating: ratingOf(produtoScore),
      lines: [
        {
          label: 'Conceito',
          detail: `nota ${formatScore(conceito)}`,
          score: conceito,
        },
        {
          label: 'Ticket médio / unidade',
          detail:
            ticket > 0
              ? ticket.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                })
              : 'informe VGV e unidades',
          score: ticketScore,
        },
        {
          label: 'Necessidade',
          detail:
            NECESSIDADE_OPTIONS.find((item) => item.value === input.necessidade)
              ?.label ?? input.necessidade,
          score: needScore,
        },
      ],
    },
    {
      name: 'Economics',
      score: economicsScore,
      rating: ratingOf(economicsScore),
      lines: [
        {
          label: 'Margem',
          detail: `${formatScore(input.marginPct)}%`,
          score: marginScore,
        },
        {
          label: 'Equity',
          detail: `${formatScore(input.equityPct)}%`,
          score: equityScore,
        },
        {
          label: '% Vendas',
          detail: `${formatScore(input.salesPct)}%`,
          score: salesScore,
        },
        {
          label: '% Obras',
          detail: `${formatScore(input.worksPct)}%`,
          score: worksScore,
        },
      ],
    },
    {
      name: 'Player',
      score: playerScore,
      rating: ratingOf(playerScore),
      lines: [
        {
          label: 'Nº entregas',
          detail: `${input.deliveries} obras`,
          score: deliveriesScore,
        },
        {
          label: 'Robustez',
          detail: `${formatScore(robustezPct)}% (PL/VGV)`,
          score: robustezScore,
        },
        {
          label: 'Governança',
          detail: `${govPoints} pts`,
          score: govPoints,
        },
      ],
    },
  ]

  const score = mean(pillars.map((pillar) => pillar.score))
  const ranked = [...pillars].sort((a, b) => b.score - a.score)
  const best = ranked[0]
  const worst = ranked[ranked.length - 1]

  return {
    score,
    rating: ratingOf(score),
    pillars,
    best: { label: best.name, value: formatScore(best.score) },
    worst: { label: worst.name, value: formatScore(worst.score) },
    ticket,
    robustezPct,
  }
}

export const EMPTY_CONCEPT: Record<ConceptKey, Intensity> = {
  insercao: 'media',
  tipologia: 'media',
  padrao: 'media',
  diferenciacao: 'media',
  liquidez: 'media',
}

export const EMPTY_GOVERNANCE: Record<GovernanceKey, boolean> = {
  afetacao: false,
  spe: false,
  erp: false,
  gestao: false,
  auditoria: false,
}

export const EMPTY_INPUT: FarejadorInput = {
  population: 0,
  pibBi: 0,
  distanceKm: 0,
  vgv: 0,
  units: 0,
  necessidade: 'primeira-moradia',
  concept: EMPTY_CONCEPT,
  marginPct: 0,
  equityPct: 0,
  salesPct: 0,
  worksPct: 0,
  deliveries: 0,
  plIncorporadora: 0,
  plSocios: 0,
  governance: EMPTY_GOVERNANCE,
}

export const MESA_SAMPLE_INPUT: FarejadorInput = {
  population: 177_000,
  pibBi: 7.5,
  distanceKm: 75,
  vgv: 78_000_000,
  units: 78,
  necessidade: 'primeira-moradia',
  concept: {
    insercao: 'alta',
    tipologia: 'alta',
    padrao: 'alta',
    diferenciacao: 'alta',
    liquidez: 'media',
  },
  marginPct: 20,
  equityPct: 0.5,
  salesPct: 0,
  worksPct: 0,
  deliveries: 30,
  plIncorporadora: 50_000_000,
  plSocios: 8_500_000,
  governance: {
    afetacao: true,
    spe: true,
    erp: true,
    gestao: true,
    auditoria: false,
  },
}
