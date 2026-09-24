export const PDF_HREF = '/Folder-Institucional-Finamob-Curitiba.pdf'
export const DIRECTCON_PDF_HREF = '/DirectCon-RE-Portfolio-de-Investimentos.pdf'
export const DIRECTCON_PDF_FILENAME =
  'DirectCon_RE_Apresentacao_do_portfolio_de_investimentos.pdf'

export const FAREJADOR_HREF =
  'https://meteoro-farejador---finamob.web.app/#signup=3tTYyHZavZPv3fW5nvMtGjee'

export const SITE = {
  name: 'Finamob Curitiba',
  city: 'Curitiba, Paraná',
  tagline:
    'Viabilizamos o financiamento do seu projeto imobiliário, com máxima eficiência.',
  email: '',
  whatsapp: '',
} as const

export const NAV = [
  { href: '#produtos', label: 'Produtos' },
  { to: '/area', label: 'Áreas' },
  { to: '/farejador', label: 'Farejador' },
  { href: '#contato', label: 'Contato' },
  { to: '/folder', label: 'Folder' },
] as const

export type NavItem = (typeof NAV)[number]

export function isHashNav(
  item: NavItem,
): item is Extract<NavItem, { href: string }> {
  return 'href' in item
}

export const NUMBERS = [
  { value: '1.2B', unit: 'R$', label: 'Volume financiado' },
  { value: '92', unit: 'operações', label: 'Viabilizadas' },
  { value: '208', unit: 'agentes', label: 'Financiadores conectados' },
  { value: '3', unit: 'veículos', label: 'De investimento proprietários' },
] as const

export const FLOW = [
  {
    kicker: '01',
    title: 'Demanda de capital',
    text: 'Incorporadores, loteadores e outros players apresentam o projeto, o estágio da operação, a necessidade financeira e o contexto técnico da captação.',
  },
  {
    kicker: '02',
    title: 'A Finamob Curitiba é o elo',
    text: 'Com inteligência artificial proprietária, identificamos o encontro ideal entre a demanda e a alocação de capital.',
  },
  {
    kicker: '03',
    title: 'Alocação de capital',
    text: 'A operação é direcionada para os agentes financiadores mais aderentes, com mais eficiência, mais velocidade e maior probabilidade de viabilização.',
  },
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

export const VEHICLES = [
  {
    name: 'FIDC Obra',
    kicker: 'FIDC · Crédito associativo',
    summary:
      'Financiamento à produção de incorporações de médio-alto padrão para players de pequeno e médio porte que normalmente ficam de fora dos balanços dos grandes bancos.',
    facts: [
      { label: 'Volume-alvo 2024', value: 'R$ 300 mi' },
      { label: 'Agentes financiadores', value: '200+' },
    ],
  },
  {
    name: 'FIDC Crequity',
    kicker: 'FIDC · Garantia real',
    summary:
      'Crédito-ponte para empreendimentos econômicos com funding associativo. Foco no segmento popular — onde o crédito bancário tradicional não chega.',
    facts: [
      { label: 'Estruturado pela Finamob', value: '100%' },
      { label: 'Cobertura', value: 'Brasil' },
    ],
  },
  {
    name: 'FIDC Consórcio',
    kicker: 'DIGITAL · Capital de giro',
    summary:
      'Capital de giro com garantia em imóveis via consórcio contemplado. Liquidez para o incorporador sem onerar o caixa do projeto.',
    facts: [
      { label: 'Garantia real', value: 'Imóvel' },
      { label: 'Contratação', value: 'Curto prazo' },
    ],
  },
  {
    name: 'Tokenização',
    kicker: 'Equity · Blockchain',
    summary:
      'Captação via equity lastreada em tokens imobiliários. Liquidez e fracionamento para o investidor, agilidade para o incorporador.',
    facts: [
      { label: 'Lastro', value: 'Imóveis' },
      { label: 'Custódia', value: 'Tokenizada' },
    ],
  },
] as const

export const PARTNER_STATS = [
  { value: '1038', label: 'Finamobers' },
  { value: '200M', label: 'Negócios originados' },
  { value: '3.2M', label: 'Comissões distribuídas' },
] as const

export const PRESS = [
  {
    source: 'Exame',
    title:
      'Ele vai levantar R$ 300 milhões em 2024 ao conectar a Faria Lima a construtoras',
    text: 'A Finamob posicionada como ponte entre capital e demanda qualificada do setor.',
  },
  {
    source: 'Valor',
    title: 'Crowdfunding cresce no setor imobiliário',
    text: 'Matéria que reforça a evolução das novas frentes de funding no imobiliário.',
  },
  {
    source: 'Estadão',
    title:
      'Como a Faria Lima enriquece com imóveis quando menos pessoas investem na poupança',
    text: 'Contexto de transformação do funding e avanço do mercado de capitais no setor.',
  },
  {
    source: 'Metro Quadrado',
    title: 'Essa proptech está dobrando a aposta para resolver a dor do funding',
    text: 'Fortalece a narrativa de tecnologia aplicada à eficiência de funding.',
  },
] as const

export const FAREJADOR_SAMPLE = {
  score: '6.89',
  rating: 'BOM',
  best: { label: 'Produto', value: '9.3' },
  worst: { label: 'Economics', value: '2.2' },
  pillars: [
    { name: 'Praça', score: '6.7', rating: 'BOM' },
    { name: 'Produto', score: '9.3', rating: 'EXCELENTE' },
    { name: 'Economics', score: '2.2', rating: 'RUIM' },
    { name: 'Player', score: '9.3', rating: 'EXCELENTE' },
  ],
} as const
