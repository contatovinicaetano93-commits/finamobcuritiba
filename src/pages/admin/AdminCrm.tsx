import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  accountContactDefaults,
  formatDay,
  listLabel,
  PARTNERS,
  statusLabel,
  todayIso,
  type Account,
  type AccountList,
  type AccountStatus,
  type AdminBoard,
  type PartnerId,
} from '@/data/admin'
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
  board: AdminBoard
  me: PartnerId
  selectedId: string | null
  query: string
  importNotice: string
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
  onLoadSeed: () => void
}

export function AdminCrm({
  board,
  me,
  selectedId,
  query,
  importNotice,
  onQuery,
  creating,
  onCreatingChange,
  onSelect,
  onSave,
  onCreate,
  onDelete,
  onImport,
  onLoadSeed,
}: AdminCrmProps) {
  const [list, setList] = useState<AccountList | 'todas'>('todas')
  const [owner, setOwner] = useState<PartnerId | 'todos' | 'livre'>('todos')
  const [status, setStatus] = useState<AccountStatus | 'todos'>('todos')
  const [view, setView] = useState<CrmView>('lista')
  const [page, setPage] = useState(0)

  const selected = board.accounts.find((item) => item.id === selectedId) ?? null

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return board.accounts.filter((account) => {
      if (list !== 'todas' && account.list !== list) {
        return false
      }
      if (owner === 'livre' && account.owner) {
        return false
      }
      if (owner !== 'todos' && owner !== 'livre' && account.owner !== owner) {
        return false
      }
      if (status !== 'todos' && account.status !== status) {
        return false
      }
      if (!needle) {
        return true
      }
      return `${account.name} ${account.city} ${account.contactName} ${account.phone} ${account.email} ${account.notes} ${account.document}`
        .toLowerCase()
        .includes(needle)
    })
  }, [board.accounts, list, owner, query, status])

  const counts = useMemo(() => {
    const next = {
      incorporadora: 0,
      construtora: 0,
      prospeccao: 0,
    }
    for (const account of board.accounts) {
      next[account.list] += 1
    }
    return next
  }, [board.accounts])

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const slice = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function changeList(next: AccountList | 'todas') {
    setList(next)
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-black/55">
          {counts.incorporadora} incorporadoras · {counts.construtora}{' '}
          construtoras · {counts.prospeccao} novos. A ativação vive no estágio —
          quem pegou, registra o passo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onLoadSeed}>
            Carregar praça Curitiba
          </Button>
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

      <div className="admin-surface flex flex-col gap-4 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={list === 'todas'}
            onClick={() => changeList('todas')}
            label="Todas"
          />
          <FilterChip
            active={list === 'incorporadora'}
            onClick={() => changeList('incorporadora')}
            label="Incorporadoras"
          />
          <FilterChip
            active={list === 'construtora'}
            onClick={() => changeList('construtora')}
            label="Construtoras"
          />
          <FilterChip
            active={list === 'prospeccao'}
            onClick={() => changeList('prospeccao')}
            label="Novos"
          />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input
            value={query}
            onChange={(event) => {
              onQuery(event.target.value)
              setPage(0)
            }}
            placeholder="Buscar empresa, contato, cidade, telefone"
            className="bg-white lg:max-w-sm"
          />
          <Select
            value={owner}
            onValueChange={(value) => {
              setOwner(value as PartnerId | 'todos' | 'livre')
              setPage(0)
            }}
          >
            <SelectTrigger className="bg-white sm:w-44">
              <SelectValue placeholder="Dono" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os donos</SelectItem>
              <SelectItem value="livre">Sem dono</SelectItem>
              {PARTNERS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as AccountStatus | 'todos')
              setPage(0)
            }}
          >
            <SelectTrigger className="bg-white sm:w-44">
              <SelectValue placeholder="Estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estágios</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {statusLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-lg bg-black/5 p-1">
            <ViewTab active={view === 'lista'} onClick={() => setView('lista')}>
              Lista
            </ViewTab>
            <ViewTab
              active={view === 'pipeline'}
              onClick={() => setView('pipeline')}
            >
              Pipeline
            </ViewTab>
          </div>
        </div>
      </div>

      {board.accounts.length === 0 ? (
        <EmptyState
          title="A mesa ainda está vazia"
          body="A praça já está no sistema: 420 incorporadoras e construtoras no raio de Curitiba. Carreguem e comecem a ativação."
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onLoadSeed}>
                Carregar 420 da praça
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onCreatingChange(true)}
              >
                Cadastrar na mão
              </Button>
            </div>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhuma conta neste recorte"
          body="Soltem o filtro ou busquem pelo nome da empresa."
        />
      ) : view === 'pipeline' ? (
        <PipelineBoard accounts={visible} onSelect={onSelect} />
      ) : (
        <div className="admin-surface overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-black/8 text-[11px] tracking-[0.12em] text-black/45 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Praça</th>
                  <th className="px-4 py-3 font-medium">Estágio</th>
                  <th className="px-4 py-3 font-medium">Dono</th>
                  <th className="px-4 py-3 font-medium">Próximo</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((account) => (
                  <tr key={account.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onSelect(account.id)}
                        className="text-left"
                      >
                        <span className="block font-medium">{account.name}</span>
                        <span className="text-xs text-black/45">
                          {listLabel(account.list)}
                          {account.contactName ? ` · ${account.contactName}` : ''}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-black/65">
                      {account.city || '—'}
                      {account.uf ? ` · ${account.uf}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={account.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <OwnerMark id={account.owner} />
                        {account.owner
                          ? PARTNERS.find((item) => item.id === account.owner)?.name
                          : 'Livre'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black/55">
                      <span className="block truncate max-w-48">
                        {account.nextAction || 'Sem passo'}
                      </span>
                      <span className="text-xs">{formatDay(account.nextActionAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-black/8 px-4 py-3 text-sm text-black/55">
              <span>
                {visible.length} contas · página {safePage + 1}/{pages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pages - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Sheet
        open={Boolean(selected) || creating}
        onOpenChange={(open) => {
          if (!open) {
            onSelect(null)
            onCreatingChange(false)
          }
        }}
      >
        <SheetContent
          side="right"
          className="admin-desk w-full overflow-y-auto bg-[#f3efe6] text-[#050505] sm:max-w-lg"
        >
          {creating ? (
            <CreateForm
              me={me}
              onCancel={() => onCreatingChange(false)}
              onCreate={(draft) => {
                onCreate(draft)
                onCreatingChange(false)
              }}
            />
          ) : selected ? (
            <EditForm
              key={selected.id}
              account={selected}
              onDelete={() => {
                onDelete(selected.id)
                onSelect(null)
              }}
              onSave={(next, note) => {
                onSave(next, note)
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm',
        active ? 'bg-white text-black shadow-sm' : 'text-black/55',
      )}
    >
      {children}
    </button>
  )
}

function PipelineBoard({
  accounts,
  onSelect,
}: {
  accounts: Account[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUSES.map((status) => {
        const column = accounts.filter((account) => account.status === status)
        return (
          <section
            key={status}
            className="admin-surface w-64 shrink-0 rounded-2xl p-3"
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <StatusPill status={status} />
              <span className="text-xs text-black/40">{column.length}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {column.slice(0, 40).map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(account.id)}
                    className="w-full rounded-xl bg-white px-3 py-3 text-left"
                  >
                    <span className="block text-sm font-medium leading-tight">
                      {account.name}
                    </span>
                    <span className="mt-1 block text-xs text-black/45">
                      {account.city || listLabel(account.list)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {column.length > 40 ? (
              <p className="mt-2 px-1 text-xs text-black/40">
                +{column.length - 40} nesta coluna. Filtre para ver todas.
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

function CreateForm({
  me,
  onCancel,
  onCreate,
}: {
  me: PartnerId
  onCancel: () => void
  onCreate: (
    draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>,
  ) => void
}) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('Curitiba')
  const [uf, setUf] = useState('PR')
  const [list, setList] = useState<AccountList>('prospeccao')
  const [owner, setOwner] = useState<PartnerId | 'livre'>(me)
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [nextAction, setNextAction] = useState('Primeira abordagem')
  const [nextActionAt, setNextActionAt] = useState(todayIso())
  const [error, setError] = useState('')

  return (
    <form
      className="flex flex-col gap-4 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (name.trim().length < 2) {
          setError('Nome da empresa é obrigatório.')
          return
        }
        onCreate({
          ...accountContactDefaults(),
          list,
          name: name.trim(),
          city: city.trim(),
          uf: uf.trim().toUpperCase(),
          contactName: contactName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          source: 'manual',
          owner: owner === 'livre' ? null : owner,
          status: 'novo',
          nextAction: nextAction.trim(),
          nextActionAt,
          lastContactAt: '',
          notes: '',
        })
      }}
    >
      <SheetHeader className="p-0">
        <SheetTitle>Nova conta</SheetTitle>
        <SheetDescription>
          Já nasce com dono para os outros dois não ligarem em cima.
        </SheetDescription>
      </SheetHeader>
      <Field label="Empresa" htmlFor="new-name">
        <Input
          id="new-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="bg-white"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cidade" htmlFor="new-city">
          <Input
            id="new-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="bg-white"
          />
        </Field>
        <Field label="UF" htmlFor="new-uf">
          <Input
            id="new-uf"
            value={uf}
            maxLength={2}
            onChange={(event) => setUf(event.target.value)}
            className="bg-white"
          />
        </Field>
      </div>
      <Field label="Lista">
        <Select
          value={list}
          onValueChange={(value) => setList(value as AccountList)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="incorporadora">Incorporadora</SelectItem>
            <SelectItem value="construtora">Construtora</SelectItem>
            <SelectItem value="prospeccao">Novo / prospecção</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Dono">
        <Select
          value={owner}
          onValueChange={(value) => setOwner(value as PartnerId | 'livre')}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="livre">Sem dono</SelectItem>
            {PARTNERS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Contato" htmlFor="new-contact">
        <Input
          id="new-contact"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          className="bg-white"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" htmlFor="new-phone">
          <Input
            id="new-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="bg-white"
          />
        </Field>
        <Field label="E-mail" htmlFor="new-email">
          <Input
            id="new-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-white"
          />
        </Field>
      </div>
      <Field label="Próximo passo" htmlFor="new-next">
        <Input
          id="new-next"
          value={nextAction}
          onChange={(event) => setNextAction(event.target.value)}
          className="bg-white"
        />
      </Field>
      <Field label="Quando" htmlFor="new-when">
        <Input
          id="new-when"
          type="date"
          value={nextActionAt}
          onChange={(event) => setNextActionAt(event.target.value)}
          className="bg-white"
        />
      </Field>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button type="submit">Salvar conta</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function EditForm({
  account,
  onSave,
  onDelete,
}: {
  account: Account
  onSave: (account: Account, note: string) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState(account)
  const [log, setLog] = useState('')

  return (
    <form
      className="flex flex-col gap-4 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(draft, log.trim())
        setLog('')
      }}
    >
      <SheetHeader className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <SheetTitle>{account.name}</SheetTitle>
            <SheetDescription>
              {listLabel(account.list)} · {account.city || 'sem cidade'}
            </SheetDescription>
          </div>
          <StatusPill status={draft.status} />
        </div>
      </SheetHeader>
      <Field label="Empresa" htmlFor="edit-name">
        <Input
          id="edit-name"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="bg-white"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cidade" htmlFor="edit-city">
          <Input
            id="edit-city"
            value={draft.city}
            onChange={(event) =>
              setDraft({ ...draft, city: event.target.value })
            }
            className="bg-white"
          />
        </Field>
        <Field label="UF" htmlFor="edit-uf">
          <Input
            id="edit-uf"
            value={draft.uf}
            maxLength={2}
            onChange={(event) => setDraft({ ...draft, uf: event.target.value })}
            className="bg-white"
          />
        </Field>
      </div>
      <Field label="Lista">
        <Select
          value={draft.list}
          onValueChange={(value) =>
            setDraft({ ...draft, list: value as AccountList })
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="incorporadora">Incorporadora</SelectItem>
            <SelectItem value="construtora">Construtora</SelectItem>
            <SelectItem value="prospeccao">Novo / prospecção</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Estágio da ativação">
        <Select
          value={draft.status}
          onValueChange={(value) =>
            setDraft({ ...draft, status: value as AccountStatus })
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Dono">
        <Select
          value={draft.owner ?? 'livre'}
          onValueChange={(value) =>
            setDraft({
              ...draft,
              owner: value === 'livre' ? null : (value as PartnerId),
            })
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="livre">Sem dono</SelectItem>
            {PARTNERS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Contato" htmlFor="edit-contact">
        <Input
          id="edit-contact"
          value={draft.contactName}
          onChange={(event) =>
            setDraft({ ...draft, contactName: event.target.value })
          }
          className="bg-white"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" htmlFor="edit-phone">
          <Input
            id="edit-phone"
            value={draft.phone}
            onChange={(event) =>
              setDraft({ ...draft, phone: event.target.value })
            }
            className="bg-white"
          />
        </Field>
        <Field label="E-mail" htmlFor="edit-email">
          <Input
            id="edit-email"
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
            className="bg-white"
          />
        </Field>
      </div>
      <Field label="CNPJ" htmlFor="edit-doc">
        <Input
          id="edit-doc"
          value={draft.document}
          onChange={(event) =>
            setDraft({ ...draft, document: event.target.value })
          }
          className="bg-white"
        />
      </Field>
      <Field label="Próximo passo" htmlFor="edit-next">
        <Input
          id="edit-next"
          value={draft.nextAction}
          onChange={(event) =>
            setDraft({ ...draft, nextAction: event.target.value })
          }
          className="bg-white"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quando" htmlFor="edit-when">
          <Input
            id="edit-when"
            type="date"
            value={draft.nextActionAt}
            onChange={(event) =>
              setDraft({ ...draft, nextActionAt: event.target.value })
            }
            className="bg-white"
          />
        </Field>
        <Field label="Último contato" htmlFor="edit-last">
          <Input
            id="edit-last"
            type="date"
            value={draft.lastContactAt}
            onChange={(event) =>
              setDraft({ ...draft, lastContactAt: event.target.value })
            }
            className="bg-white"
          />
        </Field>
      </div>
      <Field label="Notas" htmlFor="edit-notes">
        <Textarea
          id="edit-notes"
          value={draft.notes}
          onChange={(event) =>
            setDraft({ ...draft, notes: event.target.value })
          }
          className="min-h-24 bg-white"
        />
      </Field>
      <Field label="Registrar abordagem agora" htmlFor="edit-log">
        <Textarea
          id="edit-log"
          value={log}
          onChange={(event) => setLog(event.target.value)}
          placeholder="O que foi falado, quem atendeu, próximo passo."
          className="min-h-20 bg-white"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Salvar</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const today = todayIso()
            onSave(
              {
                ...draft,
                lastContactAt: today,
                status:
                  draft.status === 'novo' || draft.status === 'abordar'
                    ? 'em_conversa'
                    : draft.status,
              },
              log.trim() || 'Abordagem registrada.',
            )
            setLog('')
          }}
        >
          Marcar abordagem hoje
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete}>
          Excluir
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
