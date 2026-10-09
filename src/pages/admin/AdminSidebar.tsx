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
          'fixed inset-0 z-40 bg-black/55 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[15.75rem] flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0 lg:shrink-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <BrandMark variant="light" />
          <button
            type="button"
            className="rounded-md p-1.5 text-white/75 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Fechar navegação"
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-4 pb-3 text-[10px] font-medium tracking-[0.2em] text-[#c4b49a] uppercase">
          Mesa · Curitiba
        </p>
        <nav className="flex flex-1 flex-col gap-0.5 px-2.5" aria-label="Mesa">
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
                    'flex items-center gap-3 rounded-[0.65rem] px-3 py-2.5 text-sm font-medium tracking-[0.01em] transition-colors',
                    isActive
                      ? 'bg-[#f7f4ef] font-semibold text-[#0c0b0a] shadow-[inset_3px_0_0_#9c8563]'
                      : 'text-white/72 hover:bg-white/8 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={isActive ? 2.1 : 1.75} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-white/12 px-3 py-3.5">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-2.5 py-2">
            <OwnerMark id={me} className="ring-1 ring-white/30" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {partner.name}
              </p>
              <p className="truncate text-[11px] text-white/65">Sócio · sessão ativa</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md p-2 text-white/65 hover:bg-white/10 hover:text-white"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
