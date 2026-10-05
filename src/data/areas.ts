export type Audience = 'incorporador' | 'parceiro'
export type AreaId = Audience

export const AREA_CHOICES = [
  {
    id: 'incorporador' as const,
    kicker: 'INCORPORADOR / LOTEADOR',
    title: 'Financie o empreendimento',
    text: 'Envie o projeto, rode o Farejador e a Finamob Curitiba encaixa o funding — ponte, obra, estoque, recebíveis ou corporativo.',
    cta: 'Entrar como incorporador',
  },
  {
    id: 'parceiro' as const,
    kicker: 'ORIGINADOR PARCEIRO',
    title: 'Origine e receba no fechamento',
    text: 'Traga operações da praça. A Finamob Curitiba estrutura e busca o capital; você é remunerado quando o funding fecha.',
    cta: 'Entrar como originador',
  },
] as const

export const AREA_STORAGE_KEY = 'finamob-curitiba-area'

export const INCORPORADOR_STEPS = [
  {
    kicker: '01',
    title: 'Envie o projeto',
    text: 'Praça, estágio da obra, necessidade de capital e prazo. Quanto mais técnico o recorte, mais rápido a mesa lê a operação.',
  },
  {
    kicker: '02',
    title: 'O Farejador lê a saúde',
    text: 'Praça, produto, economics e player — o mesmo racional dos agentes financiadores. Dá para rodar a leitura neste site, agora.',
  },
  {
    kicker: '03',
    title: 'A Finamob Curitiba encaixa o funding',
    text: 'A operação vai para o agente e o veículo mais aderentes: ponte, obra, estoque, recebíveis ou corporativo.',
  },
] as const

export const PARCEIRO_STEPS = [
  {
    kicker: '01',
    title: 'Entre como originador',
    text: 'Cadastre empresa, praça de atuação e o tipo de relacionamento que você já tem com incorporadores e loteadores.',
  },
  {
    kicker: '02',
    title: 'Traga a operação',
    text: 'Você origina o projeto. A Finamob Curitiba estrutura, lê o Farejador e busca o funding com a mesa.',
  },
  {
    kicker: '03',
    title: 'Receba por operação fechada',
    text: 'A remuneração entra quando o funding fecha — não por cadastro, não por volume vazio.',
  },
] as const

export const PARCEIRO_PROFILES = [
  'Corretores e imobiliárias com carteira de incorporadores',
  'Consultores de crédito e correspondentes',
  'Contadores, assessores e family offices',
  'Quem já origina obra, loteamento ou carteira na praça',
] as const

export const INCORPORADOR_BRIEF = [
  'Cidade e tipo do empreendimento',
  'Estágio: lançamento, obra, estoque ou carteira',
  'Necessidade aproximada de capital',
  'Prazo em que o recurso precisa entrar',
] as const

export function isAreaId(value: string | null): value is AreaId {
  return value === 'incorporador' || value === 'parceiro'
}

export function rememberArea(id: AreaId): void {
  try {
    window.localStorage.setItem(AREA_STORAGE_KEY, id)
  } catch {
    return
  }
}

export function lastArea(): AreaId | null {
  try {
    const stored = window.localStorage.getItem(AREA_STORAGE_KEY)
    return isAreaId(stored) ? stored : null
  } catch {
    return null
  }
}

export function otherArea(id: AreaId): AreaId {
  switch (id) {
    case 'incorporador':
      return 'parceiro'
    case 'parceiro':
      return 'incorporador'
    default: {
      const exhaustive: never = id
      return exhaustive
    }
  }
}

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function isAreaRoute(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path === '/area' || path === '/incorporador' || path === '/parceiro'
}

export function isHeroPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path === '/' || path === '/sofa-aberto' || isAreaRoute(pathname)
}

export function formCtaTo(pathname: string): string {
  const path = normalizePath(pathname)
  if (path === '/' || path === '/incorporador' || path === '/parceiro') {
    return `${path}#formulario`
  }
  if (path === '/farejador' || path === '/solucoes') {
    return '/incorporador#formulario'
  }
  if (path === '/sofa-aberto') {
    return '/contato?sofa=1'
  }
  return '/contato'
}

export function areaPath(id: AreaId): string {
  switch (id) {
    case 'incorporador':
      return '/incorporador'
    case 'parceiro':
      return '/parceiro'
    default: {
      const exhaustive: never = id
      return exhaustive
    }
  }
}

export function areaLabel(id: AreaId): string {
  switch (id) {
    case 'incorporador':
      return 'Incorporador'
    case 'parceiro':
      return 'Originador parceiro'
    default: {
      const exhaustive: never = id
      return exhaustive
    }
  }
}
