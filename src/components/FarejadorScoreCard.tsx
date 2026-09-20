import { formatScore, ratingOf, type FarejadorResult } from '@/lib/farejador'
import { cn } from '@/lib/utils'

export function FarejadorScoreCard({
  result,
  empty,
}: {
  result: FarejadorResult
  empty?: boolean
}) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 text-white sm:p-8">
      <p className="text-xs tracking-wide text-white/40 uppercase">
        {empty ? 'Preencha o projeto para ver a leitura' : 'Leitura do Farejador'}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-5xl">
            {empty ? '—' : formatScore(result.score, 2)}
          </p>
          <p className="mt-1 text-sm text-white/55">
            Score final · /10 {empty ? '' : result.rating}
          </p>
        </div>
        {empty ? null : (
          <div className="text-right text-sm text-white/55">
            <p>
              ↑ Melhor pilar {result.best.label} · {result.best.value}
            </p>
            <p>
              ↓ Pior pilar {result.worst.label} · {result.worst.value}
            </p>
          </div>
        )}
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {result.pillars.map((pillar) => (
          <li
            key={pillar.name}
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          >
            <p className="text-xs tracking-wide text-white/45 uppercase">
              {pillar.name}
            </p>
            <p className="mt-1 text-lg">
              {empty ? '—' : `${formatScore(pillar.score)} · ${pillar.rating}`}
            </p>
          </li>
        ))}
      </ul>
      {empty ? null : (
        <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
          {result.pillars.map((pillar) => (
            <div key={`${pillar.name}-detail`}>
              <p className="text-xs tracking-wide text-white/45 uppercase">
                {pillar.name} · {formatScore(pillar.score)} de 10 · {pillar.rating}
              </p>
              <ul className="mt-2 space-y-1.5">
                {pillar.lines.map((line) => (
                  <li
                    key={line.label}
                    className="flex items-baseline justify-between gap-3 text-sm text-white/70"
                  >
                    <span>
                      {line.label} · {line.detail}
                    </span>
                    <span
                      className={cn(
                        'tabular-nums',
                        ratingTone(ratingOf(line.score)),
                      )}
                    >
                      {formatScore(line.score)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

function ratingTone(rating: ReturnType<typeof ratingOf>): string {
  switch (rating) {
    case 'PÉSSIMO':
    case 'RUIM':
      return 'text-[#e8a39a]'
    case 'MÉDIO':
      return 'text-[#e6d3a3]'
    case 'BOM':
    case 'EXCELENTE':
      return 'text-[#b7d7b0]'
    default: {
      const exhaustive: never = rating
      return exhaustive
    }
  }
}
