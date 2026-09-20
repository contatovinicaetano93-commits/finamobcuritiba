export type ProductGroupId = 'obra' | 'liquidez' | 'estrutura' | 'carteira'

export interface Product {
  name: string
  summary: string
  group: ProductGroupId
}

export const FUNDING_PRODUCTS = [
  {
    name: 'Ponte',
    summary: 'Obtenção de recursos para exposição de caixa inicial do projeto.',
  },
  {
    name: 'Obra',
    summary: 'Financiamento para execução da obra.',
  },
  {
    name: 'Estoque',
    summary:
      'Crédito para quitação do financiamento de obra e venda do remanescente com maior prazo.',
  },
  {
    name: 'Recebíveis',
    summary: 'Antecipação de direitos creditórios.',
  },
  {
    name: 'Corporativo',
    summary: 'Liquidez discricionária com lastro em ativos da companhia.',
  },
] as const

export const EXTRA_PRODUCTS = [
  {
    name: 'FIDCs Artesanais',
    summary: 'Estruturação de veículos de investimento sob demanda.',
  },
  {
    name: 'FINAdvisor',
    summary: 'Acompanhamento estratégico da operação, da tese à execução.',
  },
] as const

export const PRODUCT_GROUPS: { id: ProductGroupId; title: string; lead: string }[] =
  [
    {
      id: 'obra',
      title: 'Obra e lançamento',
      lead: 'Capital para sair do papel e executar o empreendimento.',
    },
    {
      id: 'liquidez',
      title: 'Liquidez do projeto',
      lead: 'Soluções com lastro no que o incorporador já construiu ou vai receber.',
    },
    {
      id: 'estrutura',
      title: 'Estrutura de capital',
      lead: 'Dívida, equity ou compra com recompra, conforme o momento da empresa.',
    },
    {
      id: 'carteira',
      title: 'Carteira e estoque',
      lead: 'Operações lastreadas em unidades, pró-soluto ou venda definitiva.',
    },
  ]

export const PRODUCTS: Product[] = [
  {
    name: 'Ponte',
    summary: 'Recursos para lançamento e início de obras.',
    group: 'obra',
  },
  {
    name: 'Obra',
    summary: 'Funding para a execução total da obra.',
    group: 'obra',
  },
  {
    name: 'FPPP',
    summary: 'Crédito para obras menores, com ênfase no crédito do desenvolvedor.',
    group: 'obra',
  },
  {
    name: 'FAP',
    summary: 'Crédito para obras maiores, com lastro no próprio empreendimento.',
    group: 'obra',
  },
  {
    name: 'Estoque',
    summary: 'Liquidez com lastro em estoque de projetos entregues.',
    group: 'liquidez',
  },
  {
    name: 'Recebível',
    summary: 'Liquidez com lastro em recebíveis futuros.',
    group: 'liquidez',
  },
  {
    name: 'Corporativo',
    summary: 'Liquidez discricionária com lastro em ativos da companhia.',
    group: 'liquidez',
  },
  {
    name: 'Dívida',
    summary: 'Crédito com lastro no próprio projeto.',
    group: 'estrutura',
  },
  {
    name: 'Equity',
    summary: 'Liquidez via participação no projeto.',
    group: 'estrutura',
  },
  {
    name: 'CCV',
    summary: 'Liquidez via compra com recompra de unidades.',
    group: 'estrutura',
  },
  {
    name: 'Garantia real',
    summary:
      'Dívida lastreada em carteira de projetos entregues, com previsão de alienação.',
    group: 'carteira',
  },
  {
    name: 'Clean',
    summary: 'Dívida lastreada em carteira de pró-soluto, sem alienação dos imóveis.',
    group: 'carteira',
  },
  {
    name: 'True Sale',
    summary:
      'Venda definitiva da carteira de projetos entregues, sem configurar dívida.',
    group: 'carteira',
  },
]

export function productsByGroup(id: ProductGroupId): Product[] {
  return PRODUCTS.filter((product) => product.group === id)
}
