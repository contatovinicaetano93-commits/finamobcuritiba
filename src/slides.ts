import { slidePhotos } from '@/media/slides'

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
    src: slidePhotos[0],
  },
  {
    id: 2,
    title: 'Transformação',
    note: 'Nome atualizado no texto e no logo',
    src: slidePhotos[1],
  },
  {
    id: 3,
    title: 'Mercado de capitais',
    note: 'Logo Finamob Curitiba',
    src: slidePhotos[2],
  },
  {
    id: 4,
    title: 'Financiamento',
    note: 'Incorporadores e loteadores',
    src: slidePhotos[3],
  },
  {
    id: 5,
    title: 'Tecnologia',
    note: 'Encontro entre demanda e capital',
    src: slidePhotos[4],
  },
  {
    id: 6,
    title: 'Produtos',
    note: 'Linhas de crédito e liquidez',
    src: slidePhotos[5],
  },
  {
    id: 7,
    title: 'Números',
    note: 'Logo Finamob Curitiba no rodapé',
    src: slidePhotos[6],
  },
  {
    id: 8,
    title: 'Na mídia',
    note: 'Título e marca atualizados',
    src: slidePhotos[7],
  },
  {
    id: 9,
    title: 'Encerramento',
    note: 'Site removido enquanto não houver domínio próprio',
    src: slidePhotos[8],
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
