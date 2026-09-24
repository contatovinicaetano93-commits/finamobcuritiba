import { Kicker } from '@/components/Kicker'
import { Reveal } from '@/components/Reveal'
import { FLOW } from '@/data/site'
import { photos } from '@/media/photos'

export function HomeFlow() {
  return (
    <section className="relative overflow-hidden bg-paper px-4 py-24 text-black sm:px-6 sm:py-28">
      <img
        src={photos.fluxo}
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover opacity-30 lg:block"
      />
      <div className="relative mx-auto max-w-6xl">
        <Kicker className="text-bronze">Como funciona</Kicker>
        <h2 className="font-heading mt-6 max-w-3xl text-3xl leading-[1.12] tracking-tight sm:text-5xl">
          O encontro mais eficiente entre alocação e demanda de capital.
        </h2>
        <p className="mt-6 max-w-2xl text-black/65">
          A Finamob Curitiba atua como elo entre a demanda de capital e a
          alocação de capital. Com inteligência artificial proprietária e leitura
          técnica das operações, identificamos o encontro ideal entre projeto,
          estrutura e financiador.
        </p>
        <div className="mt-14 grid gap-px overflow-hidden bg-black/10 lg:grid-cols-3">
          {FLOW.map((step, index) => (
            <Reveal key={step.kicker} delay={index * 120} className="h-full">
              <article className="h-full bg-paper p-7 sm:p-9">
                <Kicker className="text-bronze" rule={false}>
                  {step.kicker}
                </Kicker>
                <h3 className="font-heading mt-4 text-2xl sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-black/65">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
