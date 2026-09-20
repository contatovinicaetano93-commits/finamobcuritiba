import { haversineKm } from '@/lib/farejador'

export interface City {
  id: string
  name: string
  uf: string
  population: number
  pibBi: number
  lat: number
  lng: number
}

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 }

export const CITIES: City[] = [
  {
    id: 'curitiba-pr',
    name: 'Curitiba',
    uf: 'PR',
    population: 1_773_718,
    pibBi: 98.0,
    lat: -25.4284,
    lng: -49.2733,
  },
  {
    id: 'sao-jose-dos-pinhais-pr',
    name: 'São José dos Pinhais',
    uf: 'PR',
    population: 329_285,
    pibBi: 22.4,
    lat: -25.5303,
    lng: -49.2084,
  },
  {
    id: 'colombo-pr',
    name: 'Colombo',
    uf: 'PR',
    population: 232_177,
    pibBi: 4.6,
    lat: -25.2925,
    lng: -49.2262,
  },
  {
    id: 'araucaria-pr',
    name: 'Araucária',
    uf: 'PR',
    population: 151_666,
    pibBi: 18.2,
    lat: -25.5858,
    lng: -49.4047,
  },
  {
    id: 'pinhais-pr',
    name: 'Pinhais',
    uf: 'PR',
    population: 127_019,
    pibBi: 5.1,
    lat: -25.4428,
    lng: -49.1926,
  },
  {
    id: 'campo-largo-pr',
    name: 'Campo Largo',
    uf: 'PR',
    population: 136_327,
    pibBi: 4.8,
    lat: -25.4595,
    lng: -49.5275,
  },
  {
    id: 'londrina-pr',
    name: 'Londrina',
    uf: 'PR',
    population: 555_965,
    pibBi: 23.5,
    lat: -23.3045,
    lng: -51.1696,
  },
  {
    id: 'maringa-pr',
    name: 'Maringá',
    uf: 'PR',
    population: 409_657,
    pibBi: 19.8,
    lat: -23.4205,
    lng: -51.9333,
  },
  {
    id: 'ponta-grossa-pr',
    name: 'Ponta Grossa',
    uf: 'PR',
    population: 358_419,
    pibBi: 14.2,
    lat: -25.0916,
    lng: -50.1668,
  },
  {
    id: 'cascavel-pr',
    name: 'Cascavel',
    uf: 'PR',
    population: 348_207,
    pibBi: 14.5,
    lat: -24.9578,
    lng: -53.4595,
  },
  {
    id: 'foz-do-iguacu-pr',
    name: 'Foz do Iguaçu',
    uf: 'PR',
    population: 256_088,
    pibBi: 12.8,
    lat: -25.5163,
    lng: -54.5854,
  },
  {
    id: 'guarapuava-pr',
    name: 'Guarapuava',
    uf: 'PR',
    population: 182_644,
    pibBi: 7.2,
    lat: -25.3907,
    lng: -51.4628,
  },
  {
    id: 'paranagua-pr',
    name: 'Paranaguá',
    uf: 'PR',
    population: 145_829,
    pibBi: 8.1,
    lat: -25.5161,
    lng: -48.5225,
  },
  {
    id: 'toledo-pr',
    name: 'Toledo',
    uf: 'PR',
    population: 150_470,
    pibBi: 7.8,
    lat: -24.7138,
    lng: -53.7401,
  },
  {
    id: 'sao-paulo-sp',
    name: 'São Paulo',
    uf: 'SP',
    population: 11_451_245,
    pibBi: 828.0,
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    id: 'campinas-sp',
    name: 'Campinas',
    uf: 'SP',
    population: 1_139_047,
    pibBi: 70.0,
    lat: -22.9056,
    lng: -47.0608,
  },
  {
    id: 'rio-de-janeiro-rj',
    name: 'Rio de Janeiro',
    uf: 'RJ',
    population: 6_211_223,
    pibBi: 350.0,
    lat: -22.9068,
    lng: -43.1729,
  },
  {
    id: 'belo-horizonte-mg',
    name: 'Belo Horizonte',
    uf: 'MG',
    population: 2_315_560,
    pibBi: 97.0,
    lat: -19.9167,
    lng: -43.9345,
  },
  {
    id: 'porto-alegre-rs',
    name: 'Porto Alegre',
    uf: 'RS',
    population: 1_332_845,
    pibBi: 80.0,
    lat: -30.0346,
    lng: -51.2177,
  },
  {
    id: 'florianopolis-sc',
    name: 'Florianópolis',
    uf: 'SC',
    population: 537_213,
    pibBi: 23.4,
    lat: -27.5954,
    lng: -48.548,
  },
  {
    id: 'brasilia-df',
    name: 'Brasília',
    uf: 'DF',
    population: 2_817_381,
    pibBi: 286.0,
    lat: -15.7939,
    lng: -47.8828,
  },
]

export function cityLabel(city: City): string {
  return `${city.name} · ${city.uf}`
}

export function distanceFromSp(city: City): number {
  return haversineKm(city.lat, city.lng, SAO_PAULO.lat, SAO_PAULO.lng)
}

export function findCity(id: string): City | undefined {
  return CITIES.find((city) => city.id === id)
}

export function searchCities(query: string): City[] {
  const normalized = query.trim().toLocaleLowerCase('pt-BR')
  if (!normalized) {
    return CITIES
  }
  return CITIES.filter((city) =>
    cityLabel(city).toLocaleLowerCase('pt-BR').includes(normalized),
  )
}
