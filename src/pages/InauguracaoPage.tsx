import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { INAUGURACAO } from '@/data/inauguracao'

function FlyerMark({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <div className={size === 'lg' ? 'scale-110' : 'scale-100'}>
      <BrandMark variant="light" />
    </div>
  )
}

/** Composition used on-page and mirrored for exportable arts. */
export function InauguracaoFlyer({
  format = 'story',
  fill = false,
}: {
  format?: 'story' | 'quadrado' | 'paisagem'
  fill?: boolean
}) {
  const isLandscape = format === 'paisagem'
  const isSquare = format === 'quadrado'

  return (
    <article
      className={[
        'relative flex w-full flex-col overflow-hidden bg-[#050505] text-white',
        fill
          ? 'h-svh justify-between px-10 py-12 sm:px-14 sm:py-14'
          : isLandscape
            ? 'aspect-[16/9] justify-between px-10 py-8 sm:px-14 sm:py-10'
            : isSquare
              ? 'aspect-square justify-between px-8 py-10 sm:px-12'
              : 'aspect-[9/16] max-h-[min(92svh,48rem)] justify-between px-8 py-10 sm:px-10 sm:py-12',
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, rgb(156 133 99 / 0.22), transparent 58%)',
        }}
        aria-hidden="true"
      />

      <header className="relative">
        <FlyerMark size={isLandscape ? 'sm' : 'lg'} />
        <p className="mt-8 text-[10px] font-medium tracking-[0.28em] text-[#c4b49a] uppercase">
          {INAUGURACAO.kicker}
        </p>
      </header>

      <div className="relative max-w-xl">
        <h1
          className={[
            'font-heading tracking-tight',
            isLandscape
              ? 'text-4xl leading-[0.95] sm:text-5xl'
              : isSquare
                ? 'text-5xl leading-[0.92] sm:text-6xl'
                : 'text-5xl leading-[0.9] sm:text-6xl',
          ].join(' ')}
        >
          {INAUGURACAO.title}
          <span className="mt-3 block text-[1.35rem] font-normal tracking-normal text-white/80 italic sm:text-2xl">
            da unidade {INAUGURACAO.unit}
          </span>
        </h1>
        <p
          className={[
            'mt-6 text-sm leading-relaxed text-white/72 sm:text-base',
            isLandscape ? 'max-w-md' : 'max-w-sm',
          ].join(' ')}
        >
          Soft open para incorporadores e construtores de Curitiba e região.
        </p>
      </div>

      <footer className="relative">
        <div
          className={[
            'grid gap-6 border-t border-white/15 pt-6',
            isLandscape ? 'grid-cols-3 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2',
          ].join(' ')}
        >
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#c4b49a] uppercase">
              Quando
            </p>
            <p className="mt-1.5 text-lg font-medium tracking-tight">
              {INAUGURACAO.dateLabel}
              <span className="text-white/55"> · {INAUGURACAO.year}</span>
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              A partir das {INAUGURACAO.time}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#c4b49a] uppercase">
              Para quem
            </p>
            <p className="mt-1.5 text-sm leading-snug text-white/80">
              Incorporadores e construtores
              <span className="block text-white/55">
                Curitiba e região
              </span>
            </p>
          </div>
          {isLandscape ? (
            <div>
              <p className="text-[10px] tracking-[0.2em] text-[#c4b49a] uppercase">
                O quê
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/80">
                Soft open · lançamento da unidade
              </p>
            </div>
          ) : null}
        </div>
        <p className="mt-8 text-[10px] tracking-[0.22em] text-white/40 uppercase">
          Finamob Curitiba · Soft open
        </p>
      </footer>
    </article>
  )
}

export function InauguracaoPage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="mx-auto flex min-h-[88svh] max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:gap-14">
        <div className="mx-auto w-full max-w-[22rem] shrink-0 sm:max-w-[24rem]">
          <div className="overflow-hidden rounded-sm ring-1 ring-white/10">
            <InauguracaoFlyer format="story" />
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-[10px] font-medium tracking-[0.28em] text-[#c4b49a] uppercase">
            Convite · Soft open
          </p>
          <h1 className="font-heading mt-4 text-4xl tracking-tight sm:text-5xl">
            Lançamento da unidade
            <span className="mt-2 block italic text-white/75">
              Finamob Curitiba
            </span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">
            {INAUGURACAO.note}
          </p>
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div className="border-t border-white/15 pt-3">
              <dt className="text-[10px] tracking-[0.18em] text-[#c4b49a] uppercase">
                Data
              </dt>
              <dd className="mt-1 text-lg font-medium">
                {INAUGURACAO.dateShort}
                <span className="text-white/50"> · {INAUGURACAO.year}</span>
              </dd>
            </div>
            <div className="border-t border-white/15 pt-3">
              <dt className="text-[10px] tracking-[0.18em] text-[#c4b49a] uppercase">
                Horário
              </dt>
              <dd className="mt-1 text-lg font-medium">{INAUGURACAO.time}</dd>
            </div>
            <div className="border-t border-white/15 pt-3 sm:col-span-2">
              <dt className="text-[10px] tracking-[0.18em] text-[#c4b49a] uppercase">
                Público
              </dt>
              <dd className="mt-1 text-white/80">{INAUGURACAO.audience}</dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#artes">Baixar artes</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <Link to="/contato">Confirmar presença</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="artes" className="border-t border-white/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-medium tracking-[0.22em] text-[#c4b49a] uppercase">
            Artes do convite
          </p>
          <h2 className="font-heading mt-3 text-3xl tracking-tight">
            Fundo preto · logo Finamob · soft open
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/60">
            Baixe e mande no WhatsApp ou no feed. Sem inventar endereço — a mesa
            confirma o local na hora do convite pessoal.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {INAUGURACAO.arts.map((art) => (
              <li key={art.id} className="space-y-3">
                <a
                  href={art.src}
                  download
                  className="block overflow-hidden rounded-sm ring-1 ring-white/12 transition hover:ring-white/30"
                >
                  <img
                    src={art.src}
                    alt={`${art.label} — Soft open Finamob Curitiba`}
                    className="w-full bg-black object-cover"
                  />
                </a>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{art.label}</p>
                    <p className="text-xs text-white/45">{art.hint}</p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={art.png}
                      download
                      className="text-xs tracking-wide text-[#c4b49a] uppercase hover:text-white"
                    >
                      PNG
                    </a>
                    <a
                      href={art.svg}
                      download
                      className="text-xs tracking-wide text-white/55 uppercase hover:text-white"
                    >
                      SVG
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
