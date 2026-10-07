import {
  Building2,
  Cable,
  ChartColumnIncreasing,
  LayoutDashboard,
  Target,
} from 'lucide-react'

export const ADMIN_NAV = [
  { to: '/admin', label: 'Hoje', end: true, icon: LayoutDashboard },
  { to: '/admin/crm', label: 'CRM', end: false, icon: Building2 },
  { to: '/admin/kpis', label: 'KPIs', end: false, icon: ChartColumnIncreasing },
  { to: '/admin/metas', label: 'Metas', end: false, icon: Target },
  { to: '/admin/integracao', label: 'API', end: false, icon: Cable },
] as const

export type DeskPage = 'hoje' | 'crm' | 'kpis' | 'metas' | 'integracao'

export function deskPage(pathname: string): DeskPage {
  if (pathname.includes('/crm')) {
    return 'crm'
  }
  if (pathname.includes('/kpis')) {
    return 'kpis'
  }
  if (pathname.includes('/metas')) {
    return 'metas'
  }
  if (pathname.includes('/integracao')) {
    return 'integracao'
  }
  return 'hoje'
}

export function pageMeta(page: DeskPage): { title: string; subtitle: string } {
  switch (page) {
    case 'hoje':
      return {
        title: 'Dashboard',
        subtitle: 'Fila e performance da praça',
      }
    case 'crm':
      return {
        title: 'CRM',
        subtitle: 'Base e estágio de cada ativação',
      }
    case 'kpis':
      return {
        title: 'KPIs',
        subtitle: 'O que a casa está produzindo',
      }
    case 'metas':
      return {
        title: 'Metas',
        subtitle: 'O combinado do mês',
      }
    case 'integracao':
      return {
        title: 'API',
        subtitle: 'Porta oficial para o CRM',
      }
    default: {
      const exhaustive: never = page
      return exhaustive
    }
  }
}
