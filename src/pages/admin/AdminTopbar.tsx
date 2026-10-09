import { type ChangeEvent, type FormEvent } from 'react'
import { Bell, Download, Menu, Search, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { OwnerMark } from '@/pages/admin/admin-ui'
import type { PartnerId } from '@/data/admin'
import { partnerById } from '@/data/admin'

type AdminTopbarProps = {
  me: PartnerId
  title: string
  subtitle: string
  query: string
  dueCount: number
  onQuery: (value: string) => void
  onSearch: () => void
  onMenu: () => void
  onExport: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
}

export function AdminTopbar({
  me,
  title,
  subtitle,
  query,
  dueCount,
  onQuery,
  onSearch,
  onMenu,
  onExport,
  onImport,
}: AdminTopbarProps) {
  const partner = partnerById(me)

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch()
  }

  return (
    <header className="admin-topbar">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-[#3f3b34] hover:bg-black/6 lg:hidden"
            onClick={onMenu}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-[#12110f] sm:text-lg">
              {title}
            </h1>
            <p className="truncate text-xs text-[#3f3b34]">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="relative min-w-0 flex-1 sm:w-72 sm:flex-none"
          >
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#5c574e]"
            />
            <Input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Buscar conta…"
              className="h-9 border-[rgb(18_17_15/0.18)] bg-white pl-9 shadow-none"
              aria-label="Buscar conta"
            />
          </form>
          <span
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md border border-[rgb(18_17_15/0.16)] bg-white px-2.5 text-[#3f3b34]"
            title={
              dueCount > 0
                ? `${dueCount} contas com próximo passo`
                : 'Nada vencendo agora'
            }
          >
            <Bell size={15} />
            <span className="text-xs font-semibold tabular-nums text-[#12110f]">
              {dueCount}
            </span>
            {dueCount > 0 ? (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#7a6648] ring-2 ring-[#f7f4ef]" />
            ) : null}
          </span>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex size-9 items-center justify-center rounded-md border border-[rgb(18_17_15/0.16)] bg-white text-[#3f3b34] hover:border-[rgb(18_17_15/0.28)] hover:text-[#12110f]"
            aria-label="Exportar mesa"
            title="Exportar"
          >
            <Download size={16} />
          </button>
          <label
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-[rgb(18_17_15/0.16)] bg-white text-[#3f3b34] hover:border-[rgb(18_17_15/0.28)] hover:text-[#12110f]"
            title="Importar"
          >
            <Upload size={16} />
            <span className="sr-only">Importar mesa</span>
            <input
              type="file"
              accept=".json,.csv,.txt,.xlsx,.xlsm,.zip,application/json"
              className="sr-only"
              onChange={onImport}
            />
          </label>
          <span className="inline-flex items-center gap-2 rounded-md border border-[rgb(18_17_15/0.16)] bg-white py-1 pr-2.5 pl-1">
            <OwnerMark id={me} />
            <span className="hidden text-sm font-medium text-[#12110f] sm:inline">
              {partner.name}
            </span>
          </span>
        </div>
      </div>
    </header>
  )
}
