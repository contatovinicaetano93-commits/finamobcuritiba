import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Button } from '@/components/ui/button'
import { EXTRA_PRODUCTS, FUNDING_PRODUCTS } from '@/data/products'
import {
  FAREJADOR_HREF,
  FAREJADOR_SAMPLE,
  FLOW,
  MARKET_STAGES,
  NUMBERS,
  PARTNER_STATS,
  PDF_HREF,
  PRESS,
  SITE,
  VEHICLES,
} from '@/data/site'
import { photos } from '@/media/photos'

export function HomePage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={photos.skylineManifesto}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14">
          <p className="font-mark text-[11px] tracking-[0.42em] text-white/70">
            FINAMOB CURITIBA
          </p>
          <h1 className="font-heading mt-5 max-w-5xl text-[2.15rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.4rem]">
            Financiamento para Incorporadores e Loteadores
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg">
            Viabilizamos o financiamento do seu projeto imobiliário, com máxima
            eficiência, através de alto nível de embasamento técnico, capilaridade
            de mais de 200 agentes financiadores e veículos proprietários de
            investimento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <a href="#formulario">
                Quero financiar um projeto
                <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="/?lead=parceiro#formulario">Quero originar negócios</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            NOSSOS NÚMEROS
          </p>
          <h2 className="font-heading mt-4 text-3xl sm:text-5xl">
            Volume, operações e capilaridade
          </h2>
          <div className="mt-12 grid gap-10 border-t border-black/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((item) => (
              <div key={item.label}>
                <p className="font-heading text-6xl tracking-tight sm:text-7xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm tracking-wide text-black/50 uppercase">
                  {item.unit}
                </p>
                <p className="mt-1 text-lg text-black/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="produtos" className="scroll-mt-20 bg-[#050505] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
            PRODUTOS DE FUNDING
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl sm:text-5xl">
            Funding para cada momento do empreendimento
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FUNDING_PRODUCTS.map((product) => (
              <article key={product.name} className="bg-[#0b0b0b] p-6 sm:p-7">
                <h3 className="font-heading text-2xl">{product.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {product.summary}
                </p>
              </article>
            ))}
            <article className="flex flex-col justify-between bg-[#0b0b0b] p-6 sm:p-7">
              <div>
                <p className="font-mark text-[11px] tracking-[0.28em] text-white/40">
                  OUTROS PRODUTOS
                </p>
                <ul className="mt-4 space-y-4">
                  {EXTRA_PRODUCTS.map((product) => (
                    <li key={product.name}>
                      <p className="font-heading text-xl">{product.name}</p>
                      <p className="mt-1 text-sm text-white/60">{product.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-fit rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/solucoes">Ver catálogo completo</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <img
          src={photos.fluxo}
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover opacity-30 lg:block"
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            COMO FUNCIONA
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
            O encontro mais eficiente entre alocação e demanda de capital.
          </h2>
          <p className="mt-5 max-w-2xl text-black/65">
            A Finamob Curitiba atua como elo entre a demanda de capital e a
            alocação de capital. Com inteligência artificial proprietária e leitura
            técnica das operações, identificamos o encontro ideal entre projeto,
            estrutura e financiador.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-black/10 lg:grid-cols-3">
            {FLOW.map((step) => (
              <article key={step.kicker} className="bg-[#f3efe6] p-7 sm:p-9">
                <p className="font-mark text-[11px] tracking-[0.28em] text-black/40">
                  {step.kicker}
                </p>
                <h3 className="font-heading mt-4 text-2xl sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-black/65">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 pb-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl border-t border-black/10 pt-20">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            MERCADO DE CAPITAIS
          </p>
          <h2 className="font-heading mt-4 max-w-4xl text-3xl leading-tight sm:text-5xl">
            A evolução das fontes de financiamento imobiliário
          </h2>
          <p className="mt-5 max-w-3xl text-black/65">
            Devido aos constantes saques da poupança, os bancos reduziram o apetite
            para financiamento do mercado imobiliário. Em contrapartida, o mercado
            de capitais criou corpo e vem se tornando a fonte predominante de
            recursos do setor.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET_STAGES.map((stage) => (
              <article key={stage.period} className="flex flex-col">
                <SplitBar banks={stage.banks} capital={stage.capital} />
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
          <p className="font-heading mt-12 max-w-3xl text-2xl sm:text-3xl">
            No futuro próximo, 82% do funding imobiliário virá do mercado de
            capitais — e é onde a Finamob Curitiba atua.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src={photos.skylineFunding}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/78" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            VEÍCULOS
          </p>
          <h2 className="font-heading mt-4 max-w-4xl text-3xl leading-tight sm:text-5xl">
            Veículos proprietários para destravar o funding
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {VEHICLES.map((vehicle) => (
              <article
                key={vehicle.name}
                className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-sm sm:p-8"
              >
                <p className="font-mark text-[10px] tracking-[0.28em] text-white/45">
                  {vehicle.kicker}
                </p>
                <h3 className="font-heading mt-3 text-2xl sm:text-3xl">
                  {vehicle.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {vehicle.summary}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  {vehicle.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs tracking-wide text-white/45 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-lg text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="formulario"
        className="scroll-mt-20 bg-[#f3efe6] px-4 py-20 text-black sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
              FORMULÁRIO
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-tight sm:text-5xl">
              Conte o projeto. Ou entre na originação.
            </h2>
            <p className="mt-5 text-black/65">
              Incorporadores e loteadores enviam o estágio da operação. Parceiros
              originadores trazem projetos e são remunerados por cada funding
              fechado.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {PARTNER_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-black/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <section
        id="farejador"
        className="scroll-mt-20 bg-[#050505] px-4 py-20 sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
              FAREJADOR
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-tight sm:text-5xl">
              Entenda o racional dos agentes financiadores e avalie o seu projeto.
            </h2>
            <p className="mt-5 max-w-xl text-white/65">
              O Farejador analisa praça, produto, economics e player — o mesmo
              recorte que a mesa usa para ler a saúde da operação. A leitura agora
              roda aqui, no site da Finamob Curitiba.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-6">
                <Link to="/farejador">
                  Avaliar o projeto neste site
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <a href={FAREJADOR_HREF} target="_blank" rel="noreferrer">
                  Abrir a mesa original
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>
          <aside className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 sm:p-8">
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Exemplo de leitura
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-heading text-5xl">{FAREJADOR_SAMPLE.score}</p>
                <p className="mt-1 text-sm text-white/55">
                  Score final · /10 {FAREJADOR_SAMPLE.rating}
                </p>
              </div>
              <div className="text-right text-sm text-white/55">
                <p>
                  ↑ Melhor pilar {FAREJADOR_SAMPLE.best.label} ·{' '}
                  {FAREJADOR_SAMPLE.best.value}
                </p>
                <p>
                  ↓ Pior pilar {FAREJADOR_SAMPLE.worst.label} ·{' '}
                  {FAREJADOR_SAMPLE.worst.value}
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {FAREJADOR_SAMPLE.pillars.map((pillar) => (
                <li
                  key={pillar.name}
                  className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <p className="text-xs tracking-wide text-white/45 uppercase">
                    {pillar.name}
                  </p>
                  <p className="mt-1 text-lg">
                    {pillar.score} · {pillar.rating}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            IMPRENSA
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl sm:text-5xl">
            A imprensa de negócios já contou essa história
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-black/10 sm:grid-cols-2">
            {PRESS.map((item) => (
              <article key={item.title} className="bg-[#f3efe6] p-6 sm:p-8">
                <p className="text-xs tracking-wide text-black/45 uppercase">
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

      <section id="contato" className="relative scroll-mt-20 overflow-hidden">
        <img
          src={photos.skylineCta}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/62" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-end px-4 py-16 sm:px-6">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            CONTATO · {SITE.city.toUpperCase()}
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Fale com a Finamob Curitiba
          </h2>
          <p className="mt-5 max-w-xl text-white/70">
            E-mail e WhatsApp institucionais ainda não foram publicados. Use o
            formulário e a gente retoma pelo canal que vocês já usam.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <a href="#formulario">Abrir formulário</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <a href={PDF_HREF} download>
                Baixar folder
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function formatPct(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}

function SplitBar({ banks, capital }: { banks: number; capital: number }) {
  return (
    <div
      className="flex h-36 w-full overflow-hidden rounded-sm bg-[#e4ddd0]"
      aria-hidden="true"
    >
      <span className="bg-[#111]" style={{ width: `${banks}%` }} />
      <span className="bg-[#d8cfc0]" style={{ width: `${capital}%` }} />
    </div>
  )
}
