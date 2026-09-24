import { CountUp, CountUpGroup } from '@/components/CountUp'
import { Kicker } from '@/components/Kicker'
import { NUMBERS } from '@/data/site'

export function HomeNumbers() {
  return (
    <section className="bg-paper px-4 py-24 text-black sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Kicker className="text-bronze">Nossos números</Kicker>
        <h2 className="font-heading mt-6 text-3xl tracking-tight sm:text-5xl">
          Volume, operações e capilaridade
        </h2>
        <CountUpGroup className="mt-14 grid gap-10 border-t border-black/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((item, index) => (
            <div key={item.label}>
              <p className="display-number text-6xl sm:text-7xl">
                <CountUp value={item.value} delay={index * 140} />
              </p>
              <p className="mt-2 text-sm tracking-wide text-black/50 uppercase">
                {item.unit}
              </p>
              <p className="mt-1 text-lg text-black/80">{item.label}</p>
            </div>
          ))}
        </CountUpGroup>
      </div>
    </section>
  )
}
