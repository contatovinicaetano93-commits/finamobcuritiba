import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { partnerById, type PartnerId } from '@/data/admin'
import { ADMIN_NAV } from '@/pages/admin/admin-nav'
import { OwnerMark } from '@/pages/admin/admin-ui'
import { cn } from '@/lib/utils'

type AdminSidebarProps = {
  me: PartnerId
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export function AdminSidebar({ me, open, onClose, onLogout }: AdminSidebarProps) {
  const partner = partnerById(me)

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          'fixed inset-0 z-40 bg-black/45 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0 lg:shrink-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <BrandMark variant="light" />
          <button
            type="button"
            className="rounded-lg p-1 text-white/60 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Fechar navegação"
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-5 pb-4 text-[10px] tracking-[0.22em] text-[#c4b49a] uppercase">
          Mesa dos sócios
        </p>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Mesa">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-[#f3efe6] text-[#050505]'
                      : 'text-white/60 hover:bg-white/8 hover:text-white',
                  )
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <OwnerMark id={me} className="ring-1 ring-white/25" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{partner.name}</p>
              <p className="truncate text-[11px] text-white/45">Sócio · Curitiba</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-2 text-white/45 hover:bg-white/8 hover:text-white"
              aria-label="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
