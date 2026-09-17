import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { PDF_HREF, SITE } from '@/data/site'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-sm text-sm text-white/65">{SITE.tagline}</p>
          <p className="text-sm text-white/50">{SITE.city}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/70">
          <Link to="/solucoes" className="hover:text-white">
            Soluções de funding
          </Link>
          <Link to="/contato" className="hover:text-white">
            Contato
          </Link>
          <a href={PDF_HREF} download className="hover:text-white">
            Baixar folder institucional
          </a>
        </div>
      </div>
    </footer>
  )
}
