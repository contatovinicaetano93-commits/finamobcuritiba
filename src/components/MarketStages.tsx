import { MARKET_STAGES } from '@/data/site'
import { useScrollWipe } from '@/lib/use-scroll-wipe'

function formatPct(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}

export function MarketStages() {
  const [ref, progress] = useScrollWipe()
  const hidden = (1 - progress) * 100

  return (
    <div
      ref={ref}
      className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
    >
      {MARKET_STAGES.map((stage) => (
        <article key={stage.period} className="flex flex-col">
          <SplitBar
            banks={stage.banks}
            capital={stage.capital}
            hidden={hidden}
          />
          <p className="mt-4 text-sm tracking-wide text-black/50">
            {stage.period}
          </p>
          <p className="font-heading mt-1 text-2xl">{stage.note}</p>
          <p className="mt-3 text-sm text-black/65">
            Bancos {formatPct(stage.banks)}
          </p>
          <p className="text-sm text-black/65">
            Mercado de capitais {formatPct(stage.capital)}
          </p>
        </article>
      ))}
    </div>
  )
}

function SplitBar({
  banks,
  capital,
  hidden,
}: {
  banks: number
  capital: number
  hidden: number
}) {
  return (
    <div
      className="h-36 w-full overflow-hidden rounded-sm bg-[#efeae1]"
      aria-hidden="true"
    >
      <div
        className="flex h-full w-full"
        style={{ clipPath: `inset(0 ${hidden}% 0 0)` }}
      >
        <span
          className="h-full shrink-0 bg-[#111]"
          style={{ width: `${banks}%` }}
        />
        <span
          className="h-full shrink-0 bg-[#c8bba6]"
          style={{ width: `${capital}%` }}
        />
      </div>
    </div>
  )
}
