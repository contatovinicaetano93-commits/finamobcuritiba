import { Kicker } from '@/components/Kicker'
import { MarketStages } from '@/components/MarketStages'

export function HomeMarket() {
  return (
    <section className="bg-paper px-4 pb-24 text-black sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl border-t border-black/10 pt-24">
        <Kicker className="text-bronze">Mercado de capitais</Kicker>
        <h2 className="font-heading mt-6 max-w-4xl text-3xl leading-[1.12] tracking-tight sm:text-5xl">
          A evolução das fontes de financiamento imobiliário
        </h2>
        <p className="mt-6 max-w-3xl text-black/65">
          Devido aos constantes saques da poupança, os bancos reduziram o apetite
          para financiamento do mercado imobiliário. Em contrapartida, o mercado
          de capitais criou corpo e vem se tornando a fonte predominante de
          recursos do setor.
        </p>
        <MarketStages />
        <p className="font-heading mt-14 max-w-3xl text-2xl sm:text-3xl">
          No futuro próximo, 82% do funding imobiliário virá do mercado de
          capitais — e é onde a Finamob Curitiba atua.
        </p>
      </div>
    </section>
  )
}
