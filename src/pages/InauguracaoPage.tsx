import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { INAUGURACAO } from '@/data/inauguracao'
import { downloadSvgAsPng } from '@/lib/download-svg-png'

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
        <p className="mt-8 text-[10px] font-semibold tracking-[0.28em] text-[#edd9b0] uppercase">
          {INAUGURACAO.kicker}
        </p>
      </header>

      <div className="relative max-w-xl">
        <h1
          className={[
            'font-heading tracking-tight text-white',
            isLandscape
              ? 'text-4xl leading-[0.95] sm:text-5xl'
              : isSquare
                ? 'text-5xl leading-[0.92] sm:text-6xl'
                : 'text-5xl leading-[0.9] sm:text-6xl',
          ].join(' ')}
        >
          {INAUGURACAO.title}
          <span className="mt-3 block text-[1.35rem] font-normal tracking-normal text-white/95 italic sm:text-2xl">
            da unidade {INAUGURACAO.unit}
          </span>
        </h1>
        <p
          className={[
            'mt-6 text-sm leading-relaxed text-white/90 sm:text-base',
            isLandscape ? 'max-w-md' : 'max-w-sm',
          ].join(' ')}
        >
          Soft open para incorporadores e construtores de Curitiba e região.
        </p>
      </div>

      <footer className="relative">
        <div
          className={[
            'grid gap-6 border-t border-white/30 pt-6',
            isLandscape ? 'grid-cols-3 max-w-2xl' : 'grid-cols-1 sm:grid-cols-2',
          ].join(' ')}
        >
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#edd9b0] uppercase">
              Quando
            </p>
            <p className="mt-1.5 text-lg font-medium tracking-tight text-white">
              {INAUGURACAO.dateLabel}
              <span className="text-white/80"> · {INAUGURACAO.year}</span>
            </p>
            <p className="mt-0.5 text-sm text-white/90">
              A partir das {INAUGURACAO.time}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#edd9b0] uppercase">
              Para quem
            </p>
            <p className="mt-1.5 text-sm leading-snug text-white/95">
              Incorporadores e construtores
              <span className="block text-white/80">
                Curitiba e região
              </span>
            </p>
          </div>
          {isLandscape ? (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#edd9b0] uppercase">
                O quê
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/95">
                Soft open · lançamento da unidade
              </p>
            </div>
          ) : null}
        </div>
        <p className="mt-8 text-[10px] font-medium tracking-[0.22em] text-white/70 uppercase">
          Finamob Curitiba · Soft open
        </p>
      </footer>
    </article>
  )
}

function ArtDownloadCard({
  art,
}: {
  art: (typeof INAUGURACAO.arts)[number]
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setBusy(true)
    setError(null)
    try {
      await downloadSvgAsPng(art.svg, art.downloadName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu para baixar o PNG')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="space-y-3">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
        className="block w-full overflow-hidden rounded-sm ring-1 ring-white/12 transition hover:ring-white/30 disabled:opacity-60"
      >
        <img
          src={art.src}
          alt={`${art.label} — Soft open Finamob Curitiba`}
          className="w-full bg-black object-cover"
        />
      </button>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{art.label}</p>
          <p className="text-xs text-white/75">{art.hint} · PNG</p>
          {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={busy}
          className="text-xs font-semibold tracking-wide text-[#edd9b0] uppercase hover:text-white disabled:opacity-60"
        >
          {busy ? 'Gerando…' : 'Baixar PNG'}
        </button>
      </div>
    </li>
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
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#edd9b0] uppercase">
            Convite · Soft open
          </p>
          <h1 className="font-heading mt-4 text-4xl tracking-tight text-white sm:text-5xl">
            Lançamento da unidade
            <span className="mt-2 block italic text-white/95">
              Finamob Curitiba
            </span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/90 sm:text-base">
            {INAUGURACAO.note}
          </p>
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div className="border-t border-white/30 pt-3">
              <dt className="text-[10px] font-semibold tracking-[0.18em] text-[#edd9b0] uppercase">
                Data
              </dt>
              <dd className="mt-1 text-lg font-medium text-white">
                {INAUGURACAO.dateShort}
                <span className="text-white/80"> · {INAUGURACAO.year}</span>
              </dd>
            </div>
            <div className="border-t border-white/30 pt-3">
              <dt className="text-[10px] font-semibold tracking-[0.18em] text-[#edd9b0] uppercase">
                Horário
              </dt>
              <dd className="mt-1 text-lg font-medium text-white">
                {INAUGURACAO.time}
              </dd>
            </div>
            <div className="border-t border-white/30 pt-3 sm:col-span-2">
              <dt className="text-[10px] font-semibold tracking-[0.18em] text-[#edd9b0] uppercase">
                Público
              </dt>
              <dd className="mt-1 text-white/95">{INAUGURACAO.audience}</dd>
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
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#edd9b0] uppercase">
            Artes do convite
          </p>
          <h2 className="font-heading mt-3 text-3xl tracking-tight text-white">
            Fundo preto · logo Finamob · soft open
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/85">
            Clique em Baixar PNG — o arquivo sai pronto no celular ou no
            computador. Sem inventar endereço: a mesa confirma o local no
            convite pessoal.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {INAUGURACAO.arts.map((art) => (
              <ArtDownloadCard key={art.id} art={art} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
