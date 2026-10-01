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
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-black/60 hover:bg-black/5 lg:hidden"
            onClick={onMenu}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-lg font-medium tracking-tight">{title}</h1>
            <p className="text-xs text-black/45">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-black/35"
            />
            <Input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Buscar conta..."
              className="h-9 border-black/8 bg-[#f3efe6] pl-9"
              aria-label="Buscar conta"
            />
          </form>
          <span className="relative inline-flex size-9 items-center justify-center rounded-full border border-black/8 bg-white text-black/55">
            <Bell size={16} />
            {dueCount > 0 ? (
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[#9c8563]" />
            ) : null}
          </span>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex size-9 items-center justify-center rounded-full border border-black/8 bg-white text-black/55 hover:text-black"
            aria-label="Exportar mesa"
          >
            <Download size={16} />
          </button>
          <label className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/8 bg-white text-black/55 hover:text-black">
            <Upload size={16} />
            <span className="sr-only">Importar mesa</span>
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={onImport}
            />
          </label>
          <span className="hidden items-center gap-2 rounded-full border border-black/8 bg-white py-1 pr-3 pl-1 sm:inline-flex">
            <OwnerMark id={me} />
            <span className="text-sm">{partner.name}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
