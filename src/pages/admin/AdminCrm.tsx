import { useMemo, useState, type ReactNode } from 'react'
import {
  listLabel,
  partnerLabel,
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

const STATUSES: AccountStatus[] = [
  'novo',
  'abordar',
  'em_conversa',
  'follow_up',
  'mandato',
  'pausado',
  'sem_fit',
]

type AdminCrmProps = {
  board: AdminBoard
  me: PartnerId
  selectedId: string | null
  onSelect: (id: string | null) => void
  onSave: (account: Account, note: string) => void
  onCreate: (draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void
  onDelete: (id: string) => void
}

export function AdminCrm({
  board,
  me,
  selectedId,
  onSelect,
  onSave,
  onCreate,
  onDelete,
}: AdminCrmProps) {
  const [list, setList] = useState<AccountList | 'todas'>('todas')
  const [query, setQuery] = useState('')
  const [owner, setOwner] = useState<PartnerId | 'todos' | 'livre'>('todos')
  const [creating, setCreating] = useState(false)

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
      if (!needle) {
        return true
      }
      return `${account.name} ${account.city} ${account.notes}`
        .toLowerCase()
        .includes(needle)
    })
  }, [board.accounts, list, owner, query])

  const incorporadoras = board.accounts.filter(
    (account) => account.list === 'incorporadora',
  ).length
  const prospeccao = board.accounts.filter(
    (account) => account.list === 'prospeccao',
  ).length

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
            CRM · Curitiba
          </p>
          <h1 className="font-heading mt-2 text-3xl tracking-tight">
            Contas da praça
          </h1>
          <p className="mt-2 text-sm text-black/60">
            {incorporadoras} incorporadoras · {prospeccao} prospecção. Cadastro
            de vocês — não é a base da matriz.
          </p>
        </div>
        <Button type="button" size="lg" onClick={() => setCreating(true)}>
          Nova conta
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={list === 'todas'}
          onClick={() => setList('todas')}
          label="Todas"
        />
        <FilterChip
          active={list === 'incorporadora'}
          onClick={() => setList('incorporadora')}
          label="Incorporadoras"
        />
        <FilterChip
          active={list === 'prospeccao'}
          onClick={() => setList('prospeccao')}
          label="Prospecção"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar nome, cidade ou nota"
          className="bg-white sm:max-w-sm"
        />
        <Select
          value={owner}
          onValueChange={(value) =>
            setOwner(value as PartnerId | 'todos' | 'livre')
          }
        >
          <SelectTrigger className="bg-white">
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
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/20 bg-white px-6 py-16 text-center">
          <p className="font-heading text-2xl">Nenhuma conta neste recorte</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-black/55">
            Comecem pelas conversas da semana em Curitiba e na RMC. Uma conta,
            um dono, um próximo passo com data.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onSelect(account.id)}
                className="flex h-full w-full flex-col rounded-xl border border-black/10 bg-white p-4 text-left transition-colors hover:border-[#9c8563]"
              >
                <span className="flex items-center justify-between gap-2 text-[10px] tracking-[0.14em] text-[#9c8563] uppercase">
                  {listLabel(account.list)}
                  <span>{statusLabel(account.status)}</span>
                </span>
                <span className="font-heading mt-3 text-xl leading-tight">
                  {account.name}
                </span>
                <span className="mt-2 text-sm text-black/55">
                  {account.city || 'Cidade em branco'}
                  {account.uf ? ` · ${account.uf}` : ''}
                </span>
                <span className="mt-4 text-sm text-black/70">
                  {partnerLabel(account.owner)}
                </span>
                <span className="mt-1 text-xs text-black/50">
                  {account.nextAction || 'Sem próximo passo'}
                  {account.nextActionAt ? ` · ${account.nextActionAt}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={Boolean(selected) || creating}
        onOpenChange={(open) => {
          if (!open) {
            onSelect(null)
            setCreating(false)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-[#f3efe6] sm:max-w-lg"
        >
          {creating ? (
            <CreateForm
              me={me}
              onCancel={() => setCreating(false)}
              onCreate={(draft) => {
                onCreate(draft)
                setCreating(false)
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

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-[#050505] px-4 py-2 text-sm text-white'
          : 'rounded-full border border-black/15 bg-white px-4 py-2 text-sm'
      }
    >
      {label}
    </button>
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
          list,
          name: name.trim(),
          city: city.trim(),
          uf: uf.trim().toUpperCase(),
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
            <SelectItem value="prospeccao">Prospecção</SelectItem>
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
        <SheetTitle>{account.name}</SheetTitle>
        <SheetDescription>
          {listLabel(account.list)} · {partnerLabel(account.owner)}
        </SheetDescription>
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
            <SelectItem value="prospeccao">Prospecção</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Status">
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
