export type SlideId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Slide {
  id: SlideId
  title: string
  note: string
  src: string
}

export const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Capa',
    note: 'Marca Finamob Curitiba',
    src: '/slides/01.jpg',
  },
  {
    id: 2,
    title: 'Transformação',
    note: 'Nome atualizado no texto e no logo',
    src: '/slides/02.jpg',
  },
  {
    id: 3,
    title: 'Mercado de capitais',
    note: 'Logo Finamob Curitiba',
    src: '/slides/03.jpg',
  },
  {
    id: 4,
    title: 'Financiamento',
    note: 'Incorporadores e loteadores',
    src: '/slides/04.jpg',
  },
  {
    id: 5,
    title: 'Tecnologia',
    note: 'Encontro entre demanda e capital',
    src: '/slides/05.jpg',
  },
  {
    id: 6,
    title: 'Produtos',
    note: 'Linhas de crédito e liquidez',
    src: '/slides/06.jpg',
  },
  {
    id: 7,
    title: 'Números',
    note: 'Logo Finamob Curitiba no rodapé',
    src: '/slides/07.jpg',
  },
  {
    id: 8,
    title: 'Na mídia',
    note: 'Título e marca atualizados',
    src: '/slides/08.jpg',
  },
  {
    id: 9,
    title: 'Encerramento',
    note: 'Site removido enquanto não houver domínio próprio',
    src: '/slides/09.jpg',
  },
]

export const TOTAL_SLIDES = SLIDES.length

export function slideById(id: SlideId): Slide {
  const found = SLIDES.find((slide) => slide.id === id)
  if (!found) {
    throw new Error(`Slide ${id} não encontrado`)
  }
  return found
}
