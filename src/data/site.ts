export const PDF_HREF = '/Folder-Institucional-Finamob-Curitiba.pdf'

export const SITE = {
  name: 'Finamob Curitiba',
  city: 'Curitiba, Paraná',
  tagline: 'Funding imobiliário com agilidade para incorporadores e loteadores.',
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
  { period: 'Até 2010', banks: '100%', capital: '0%', note: 'Era dos bancos' },
  { period: '2010–2020', banks: '94,7%', capital: '5,3%', note: 'Primeiros movimentos' },
  { period: '2020–2025', banks: '56,2%', capital: '43,8%', note: 'Inflexão' },
  { period: 'Futuro', banks: '18%', capital: '82%', note: 'Mercado de capitais à frente' },
] as const

export const NUMBERS = [
  { value: '405', unit: 'R$ milhões', label: 'Estruturados na rede' },
  { value: '34', unit: 'empreendimentos', label: 'Viabilizados' },
  { value: '208', unit: 'agentes', label: 'Financiadores plugados' },
  { value: '312', unit: 'Finamobers', label: 'Na capilaridade da originação' },
] as const
