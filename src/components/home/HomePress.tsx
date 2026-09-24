import { Kicker } from '@/components/Kicker'
import { PRESS } from '@/data/site'

export function HomePress() {
  return (
    <section className="bg-paper px-4 py-24 text-black sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Kicker className="text-bronze">Imprensa</Kicker>
        <h2 className="font-heading mt-6 max-w-3xl text-3xl tracking-tight sm:text-5xl">
          A imprensa de negócios já contou essa história
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden bg-black/10 sm:grid-cols-2">
          {PRESS.map((item) => (
            <article key={item.title} className="bg-paper p-6 sm:p-8">
              <p className="text-[10px] tracking-[0.2em] text-black/45 uppercase">
                {item.source}
              </p>
              <h3 className="font-heading mt-3 text-2xl leading-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-black/65">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
