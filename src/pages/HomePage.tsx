import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRODUCTS } from '@/data/products'
import { FLOW, MARKET_STAGES, NUMBERS, PDF_HREF, PRESS, SITE } from '@/data/site'

export function HomePage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src="/media/skyline-manifesto.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14">
          <p className="font-mark text-[11px] tracking-[0.42em] text-white/70">
            {SITE.city.toUpperCase()}
          </p>
          <h1 className="font-heading mt-5 max-w-5xl text-[2.15rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            O mercado de funding imobiliário está no ápice da transformação, e a
            Finamob Curitiba será o agente dessa mudança.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg">
            Financiamento para incorporadores e loteadores com tecnologia, leitura
            técnica e capilaridade de mais de 200 agentes financiadores.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link to="/contato">
                Falar com a equipe
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <a href={PDF_HREF} download>
                Baixar folder
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            MERCADO DE CAPITAIS
          </p>
          <h2 className="font-heading mt-4 max-w-4xl text-3xl leading-tight sm:text-5xl">
            O motor financeiro do setor imobiliário deixa os bancos e migra para o
            mercado de capitais.
          </h2>
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
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src="/media/skyline-funding.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/72" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            PARA INCORPORADORES E LOTEADORES
          </p>
          <h2 className="font-heading mt-4 max-w-4xl text-3xl leading-tight sm:text-5xl">
            Viabilizamos financiamentos imobiliários com máxima eficiência e
            agilidade.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-white/75">
            Tecnologia, alto nível de embasamento técnico e a capilaridade de uma
            rede nacional — agora operando em Curitiba.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <img
          src="/media/fluxo.jpg"
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover opacity-30 lg:block"
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            COMO FUNCIONA
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
            Tecnologia para promover o encontro ideal com máxima agilidade.
          </h2>
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

      <section className="bg-[#050505] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
                PRODUTOS
              </p>
              <h2 className="font-heading mt-4 max-w-xl text-3xl sm:text-5xl">
                Funding para cada momento do empreendimento
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/solucoes">Ver catálogo completo</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => (
              <article key={product.name} className="bg-[#0b0b0b] p-6 sm:p-7">
                <h3 className="font-heading text-2xl">{product.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {product.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            NOSSOS NÚMEROS
          </p>
          <h2 className="font-heading mt-4 text-3xl sm:text-5xl">
            A rede que Curitiba passa a acessar
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

      <section className="bg-[#050505] px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
              {PRESS.kicker.toUpperCase()}
            </p>
            <p className="mt-3 text-sm text-white/50">{PRESS.source}</p>
          </div>
          <blockquote>
            <p className="font-heading text-3xl leading-tight sm:text-5xl">
              {PRESS.quote}
            </p>
            <p className="mt-6 max-w-2xl text-white/65">{PRESS.text}</p>
          </blockquote>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src="/media/skyline-cta.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-end px-4 py-16 sm:px-6">
          <h2 className="font-heading max-w-3xl text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Faça parte dessa transformação.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link to="/contato">Começar uma conversa</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/folder">Ver o folder</Link>
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
      <span
        className="bg-[#111]"
        style={{ width: `${banks}%` }}
      />
      <span
        className="bg-[#d8cfc0]"
        style={{ width: `${capital}%` }}
      />
    </div>
  )
}
