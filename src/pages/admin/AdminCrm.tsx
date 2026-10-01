import { useMemo, useState, type ReactNode } from 'react'
import {
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
  query: string
  onQuery: (value: string) => void
  creating: boolean
  onCreatingChange: (open: boolean) => void
  onSelect: (id: string | null) => void
  onSave: (account: Account, note: string) => void
  onCreate: (draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void
  onDelete: (id: string) => void
}

export function AdminCrm({
  board,
  me,
  selectedId,
  query,
  onQuery,
  creating,
  onCreatingChange,
  onSelect,
  onSave,
  onCreate,
  onDelete,
}: AdminCrmProps) {
  const [list, setList] = useState<AccountList | 'todas'>('todas')
  const [owner, setOwner] = useState<PartnerId | 'todos' | 'livre'>('todos')

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-black/55">
          {incorporadoras} incorporadoras · {prospeccao} prospecção. Cadastro de
          vocês — o que entra aqui é da praça.
        </p>
        <Button type="button" size="lg" onClick={() => onCreatingChange(true)}>
          Nova conta
        </Button>
      </div>

      <div className="admin-surface flex flex-col gap-4 rounded-2xl p-4">
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
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar nome, cidade ou nota"
            className="bg-white sm:max-w-sm"
          />
          <Select
            value={owner}
            onValueChange={(value) =>
              setOwner(value as PartnerId | 'todos' | 'livre')
            }
          >
            <SelectTrigger className="bg-white sm:w-52">
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
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nenhuma conta neste recorte"
          body="Comecem pelas conversas da semana em Curitiba e na RMC. Uma conta, um dono, um próximo passo com data."
          action={
            <Button type="button" onClick={() => onCreatingChange(true)}>
              Cadastrar a primeira
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onSelect(account.id)}
                className="admin-card flex h-full w-full flex-col rounded-2xl p-5 text-left"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[10px] tracking-[0.16em] text-[#9c8563] uppercase">
                    {listLabel(account.list)}
                  </span>
                  <StatusPill status={account.status} />
                </span>
                <span className="font-heading mt-4 text-xl leading-tight tracking-tight">
                  {account.name}
                </span>
                <span className="mt-2 text-sm text-black/55">
                  {account.city || 'Cidade em branco'}
                  {account.uf ? ` · ${account.uf}` : ''}
                </span>
                <span className="mt-5 flex items-center gap-2 text-sm">
                  <OwnerMark id={account.owner} />
                  <span className="text-black/70">
                    {account.owner
                      ? PARTNERS.find((item) => item.id === account.owner)?.name
                      : 'Sem dono'}
                  </span>
                </span>
                <span className="mt-3 flex items-center justify-between gap-3 text-xs text-black/50">
                  <span className="truncate">
                    {account.nextAction || 'Sem próximo passo'}
                  </span>
                  <span className="rounded-full bg-black/[0.05] px-2 py-0.5">
                    {formatDay(account.nextActionAt)}
                  </span>
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
