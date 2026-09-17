import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NAV } from '@/data/site'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const overHero = pathname === '/'

  return (
    <header
      className={cn(
        'z-40 border-b border-white/10',
        overHero
          ? 'absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent'
          : 'sticky top-0 bg-[#050505]/90 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Finamob Curitiba — início">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm tracking-wide text-white/70 transition-colors hover:text-white',
                  isActive && 'text-white',
                )
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild size="lg" className="rounded-full px-4">
            <Link to="/contato">Falar com a equipe</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#050505] text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4 px-4" aria-label="Mobile">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-lg text-white/80"
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
              <Button asChild className="mt-4 rounded-full">
                <Link to="/contato" onClick={() => setOpen(false)}>
                  Falar com a equipe
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
