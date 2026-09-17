export const PDF_HREF = '/Folder-Institucional-Finamob-Curitiba.pdf'

export const SITE = {
  name: 'Finamob Curitiba',
  city: 'Curitiba, Paraná',
  tagline:
    'Viabilizamos financiamentos imobiliários com máxima eficiência e agilidade.',
  email: '',
  whatsapp: '',
} as const

export const NAV = [
  { to: '/', label: 'Início' },
  { to: '/solucoes', label: 'Soluções' },
  { to: '/contato', label: 'Contato' },
  { to: '/folder', label: 'Folder' },
] as const

export const MARKET_STAGES = [
  {
    period: 'Até 2010',
    banks: 100,
    capital: 0,
    note: 'Era dos bancos',
  },
  {
    period: '2010–2020',
    banks: 94.7,
    capital: 5.3,
    note: 'Primeiros movimentos',
  },
  {
    period: '2020–2025',
    banks: 56.2,
    capital: 43.8,
    note: 'Inflexão',
  },
  {
    period: 'Futuro',
    banks: 18,
    capital: 82,
    note: 'Mercado de capitais à frente',
  },
] as const

export const NUMBERS = [
  { value: '405', unit: 'R$ milhões', label: 'Estruturados' },
  { value: '34', unit: 'empreendimentos', label: 'Viabilizados' },
  { value: '208', unit: 'agentes', label: 'Financiadores plugados' },
  { value: '312', unit: 'Finamobers', label: 'Na originação' },
] as const

export const FLOW = [
  {
    kicker: '01',
    title: 'Demanda de capital',
    text: 'Incorporadores, loteadores e outros players apresentam o projeto e a necessidade financeira.',
  },
  {
    kicker: '02',
    title: 'A Finamob Curitiba é o elo',
    text: 'Com inteligência artificial proprietária, identificamos o encontro ideal entre demanda e alocação de capital.',
  },
  {
    kicker: '03',
    title: 'Alocação de capital',
    text: 'Mais de 200 agentes financiadores. Mais velocidade, mais eficiência e maior chance de destravar o funding.',
  },
] as const

export const PRESS = {
  source: 'Exame',
  kicker: 'Na mídia',
  quote: 'Uma ponte entre a Faria Lima e o mercado imobiliário.',
  text: 'A poupança deixou de ser a principal fonte de recursos para as construtoras. O posto foi tomado pelo mercado de capitais. A Finamob existe para fazer essa travessia — agora a partir de Curitiba.',
} as const
