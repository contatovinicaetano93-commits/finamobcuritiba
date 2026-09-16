import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PRODUCTS } from '@/data/products'
import { MARKET_STAGES, NUMBERS, SITE } from '@/data/site'

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#050505] px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:72px_72px]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.28em] text-white/55 uppercase">
            {SITE.city}
          </p>
          <h1 className="font-heading mt-5 max-w-4xl text-4xl leading-tight sm:text-6xl">
            O mercado de funding imobiliário está no ápice da transformação, e a
            Finamob Curitiba será o agente dessa mudança.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Viabilizamos financiamentos para incorporadores e loteadores do Paraná
            com tecnologia, embasamento técnico e capilaridade de mais de 200
            agentes financiadores.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link to="/contato">
                Falar com a equipe
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/solucoes">Ver soluções</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#0c0c0c] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.22em] text-white/50 uppercase">
            Mercado de capitais
          </p>
          <h2 className="font-heading mt-3 max-w-3xl text-3xl sm:text-4xl">
            O motor financeiro do setor imobiliário deixa os bancos e migra para o
            mercado de capitais.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET_STAGES.map((stage) => (
              <article
                key={stage.period}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm text-white/55">{stage.period}</p>
                <p className="mt-2 text-lg font-medium">{stage.note}</p>
                <p className="mt-4 text-sm text-white/70">Bancos {stage.banks}</p>
                <p className="text-sm text-white/70">
                  Mercado de capitais {stage.capital}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ea] px-4 py-16 text-black sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs tracking-[0.22em] text-black/45 uppercase">
              Como funciona
            </p>
            <h2 className="font-heading mt-3 text-3xl sm:text-4xl">
              Tecnologia para o encontro ideal entre demanda e alocação de capital.
            </h2>
            <p className="mt-4 text-black/70">
              Incorporadores e loteadores trazem o projeto. Do outro lado, mais de
              200 agentes financiadores. No meio, a Finamob Curitiba identifica o
              cruzamento certo — com leitura técnica e inteligência artificial
              proprietária da rede.
            </p>
          </div>
          <div className="grid gap-3">
            <Step
              title="Demanda de capital"
              text="Incorporadores, loteadores e outros players apresentam o projeto e a necessidade financeira."
            />
            <Step
              title="A Finamob Curitiba é o elo"
              text="A operação é lida com critério técnico e direcionada ao financiador mais aderente."
            />
            <Step
              title="Alocação de capital"
              text="Mais velocidade, mais eficiência e maior chance de destravar o funding."
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] text-black/45 uppercase">
                Produtos
              </p>
              <h2 className="font-heading mt-3 text-3xl">
                Funding para cada momento do empreendimento
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/solucoes">Ver catálogo completo</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.slice(0, 6).map((product) => (
              <Card key={product.name} className="bg-[#fafafa]">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-black/70">{product.summary}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-16 text-black sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#050505] px-6 py-12 text-white sm:px-10">
          <p className="text-xs tracking-[0.22em] text-white/50 uppercase">
            Nossos números
          </p>
          <h2 className="font-heading mt-3 text-3xl">A rede que Curitiba passa a acessar</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((item) => (
              <div key={item.label}>
                <p className="font-heading text-5xl">{item.value}</p>
                <p className="mt-1 text-sm text-white/60">{item.unit}</p>
                <p className="mt-2 text-sm text-white/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading max-w-xl text-3xl sm:text-5xl">
            Faça parte dessa transformação.
          </h2>
          <Button asChild size="lg" className="rounded-full px-5">
            <Link to="/contato">Começar uma conversa</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function Step({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-black/65">{text}</p>
    </div>
  )
}
