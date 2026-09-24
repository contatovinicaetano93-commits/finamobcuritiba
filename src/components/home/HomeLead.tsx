import { Link } from 'react-router-dom'
import { ContactForm } from '@/components/ContactForm'
import { CountUp, CountUpGroup } from '@/components/CountUp'
import { Kicker } from '@/components/Kicker'
import { PARTNER_STATS } from '@/data/site'

export function HomeLead() {
  return (
    <section
      id="formulario"
      className="scroll-mt-20 bg-paper px-4 py-24 text-black sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <Kicker className="text-bronze">Formulário</Kicker>
          <h2 className="font-heading mt-6 text-3xl leading-[1.12] tracking-tight sm:text-5xl">
            Conte o projeto. Ou entre na originação.
          </h2>
          <p className="mt-6 text-black/65">
            Incorporadores e loteadores enviam o estágio da operação. Parceiros
            originadores trazem projetos e são remunerados por cada funding
            fechado. Há também uma{' '}
            <Link to="/area" className="underline underline-offset-4">
              área exclusiva
            </Link>{' '}
            para cada perfil.
          </p>
          <CountUpGroup className="mt-12 grid gap-6 sm:grid-cols-3">
            {PARTNER_STATS.map((stat, index) => (
              <div key={stat.label}>
                <p className="display-number text-4xl">
                  <CountUp value={stat.value} delay={index * 140} />
                </p>
                <p className="mt-1 text-sm text-black/55">{stat.label}</p>
              </div>
            ))}
          </CountUpGroup>
        </div>
        <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
