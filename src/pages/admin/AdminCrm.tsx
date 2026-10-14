import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  accountContactDefaults,
  formatDay,
  formatStamp,
  listLabel,
  PARTNERS,
  partnerLabel,
  statusLabel,
  todayIso,
  type Account,
  type AccountList,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'
import {
  createMesaActivity,
  fetchMesaActivity,
  fetchMesaCompanies,
  fetchMesaCompany,
  fetchMesaFacets,
  scopeLabel,
  type MesaAccount,
  type MesaActivity,
  type MesaFacets,
  type MesaQuery,
  type MesaScope,
} from '@/lib/mesa-api'
import {
  buildWhatsAppUrl,
  defaultWhatsAppMessage,
  normalizePhoneBr,
} from '@/lib/whatsapp'
import { AiBriefingPanel } from '@/pages/admin/AiBriefingPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  EmptyState,
  FilterChip,
  OwnerMark,
  StatusPill,
} from '@/pages/admin/admin-ui'
import { cn } from '@/lib/utils'

const STATUSES: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
  'mandato',
  'pausado',
  'sem_fit',
]

const PAGE_SIZE = 60

type CrmView = 'lista' | 'pipeline'

type AdminCrmProps = {
  me: PartnerId
  selectedId: string | null
  query: string
  importNotice: string
  reloadToken: number
  onQuery: (value: string) => void
  creating: boolean
  onCreatingChange: (open: boolean) => void
  onSelect: (id: string | null) => void
  onSave: (account: Account, note: string) => void
  onCreate: (
    draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>,
  ) => void
  onDelete: (id: string) => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
  onActivityLogged?: () => void
}

export function AdminCrm({
  me,
  selectedId,
  query,
  importNotice,
  reloadToken,
  onQuery,
  creating,
  onCreatingChange,
  onSelect,
  onSave,
  onCreate,
  onDelete,
  onImport,
  onActivityLogged,
}: AdminCrmProps) {
  const [scope, setScope] = useState<MesaScope>('praca')
  const [region, setRegion] = useState('')
  const [uf, setUf] = useState('')
  const [city, setCity] = useState('')
  const [list, setList] = useState<AccountList | 'todas'>('todas')
  const [owner, setOwner] = useState<PartnerId | 'todos' | 'livre'>('todos')
  const [status, setStatus] = useState<AccountStatus | 'todos'>('todos')
  const [view, setView] = useState<CrmView>('lista')
  const [page, setPage] = useState(0)
  const [accounts, setAccounts] = useState<MesaAccount[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState({
    incorporadora: 0,
    construtora: 0,
    prospeccao: 0,
  })
  const [facets, setFacets] = useState<MesaFacets>({
    ufs: [],
    cities: [],
    regions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<MesaAccount | null>(null)
  const [timeline, setTimeline] = useState<MesaActivity[]>([])
  const [timelineState, setTimelineState] = useState<
    'idle' | 'loading' | 'error' | 'ready'
  >('idle')

  const queryState: MesaQuery = useMemo(
    () => ({
      scope,
      region,
      uf,
      city,
      list,
      status,
      owner,
      q: query,
      page,
      limit: view === 'pipeline' ? 200 : PAGE_SIZE,
    }),
    [scope, region, uf, city, list, status, owner, query, page, view],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      const result = await fetchMesaCompanies(queryState)
      if (cancelled) {
        return
      }
      if (!result.ok) {
        setError(result.error)
        setAccounts([])
        setTotal(0)
        setLoading(false)
        return
      }
      setError('')
      setAccounts(result.data.accounts)
      setTotal(result.data.total)
      setCounts(result.data.counts)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [queryState, reloadToken])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await fetchMesaFacets({ scope, region, uf })
      if (cancelled || !result.ok) {
        return
      }
      setFacets(result.data)
    })()
    return () => {
      cancelled = true
    }
  }, [scope, region, uf, reloadToken])

  useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      setTimeline([])
      setTimelineState('idle')
      return
    }
    const preview = accounts.find((item) => item.id === selectedId) ?? null
    if (preview) {
      setSelected(preview)
    }
    let cancelled = false
    setTimelineState('loading')
    void (async () => {
      const [company, activity] = await Promise.all([
        fetchMesaCompany(selectedId),
        fetchMesaActivity({ companyId: selectedId, limit: 40 }),
      ])
      if (cancelled) {
        return
      }
      if (company.ok) {
        setSelected(company.data.account)
      }
      if (activity.ok) {
        setTimeline(activity.data.activity)
        setTimelineState('ready')
      } else {
        setTimeline([])
        setTimelineState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accounts, selectedId, reloadToken])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const slice = accounts

  function changeList(next: AccountList | 'todas') {
    setList(next)
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#3f3b34]">
          {total.toLocaleString('pt-BR')} contas neste recorte ·{' '}
          {counts.incorporadora} incorporadoras · {counts.construtora}{' '}
          construtoras · {counts.prospeccao} novos. A ativação vive no estágio —
          quem pegou, registra o passo.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex">
            <Button type="button" variant="outline" asChild>
              <span>Importar arquivo</span>
            </Button>
            <input
              type="file"
              accept=".json,.csv,.txt,.xlsx,.xlsm,.zip"
              className="sr-only"
              onChange={onImport}
            />
          </label>
          <Button type="button" size="lg" onClick={() => onCreatingChange(true)}>
            Nova conta
          </Button>
        </div>
      </div>

      {importNotice ? (
        <p className="rounded-xl bg-[#d7eadc] px-4 py-3 text-sm text-[#21553a]" role="status">
          {importNotice}
        </p>
      ) : null}

      <div className="admin-surface flex flex-col gap-4 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={scope === 'praca'}
            onClick={() => {
              setScope('praca')
              setRegion('')
              setUf('')
              setCity('')
              setPage(0)
            }}
            label="Praça Curitiba"
          />
          <FilterChip
            active={scope === 'pr'}
            onClick={() => {
              setScope('pr')
              setRegion('Sul')
              setUf('PR')
              setCity('')
              setPage(0)
            }}
            label="Paraná"
          />
          <FilterChip
            active={scope === 'sul'}
            onClick={() => {
              setScope('sul')
              setRegion('Sul')
              setUf('')
              setCity('')
              setPage(0)
            }}
            label="Sul"
          />
          <FilterChip
            active={scope === 'brasil'}
            onClick={() => {
              setScope('brasil')
              setRegion('')
              setUf('')
              setCity('')
              setPage(0)
            }}
            label="Brasil"
          />
        </div>
        CONTENT_PART_2_PLACEHOLDER
