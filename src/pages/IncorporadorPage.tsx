import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Button } from '@/components/ui/button'
import {
  INCORPORADOR_BRIEF,
  INCORPORADOR_STEPS,
  rememberArea,
} from '@/data/areas'
import { FUNDING_PRODUCTS } from '@/data/products'
import { SITE } from '@/data/site'
import { photos } from '@/media/photos'

export function IncorporadorPage() {
  useEffect(() => {
    rememberArea('incorporador')
  }, [])

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
            INCORPORADOR · {SITE.name.toUpperCase()}
          </p>
          <h1 className="font-heading mt-5 max-w-5xl text-[2.15rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            Envie o projeto. A Finamob Curitiba encaixa o funding.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg">
            Ponte, obra, estoque, recebíveis ou corporativo — a leitura começa
            pela praça, pelo estágio da operação e pelo Farejador. Sem cadastro
            para avaliar o projeto neste site.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <a href="#formulario">
                Enviar o projeto
                <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/farejador">Avaliar no Farejador</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            COMO ENTRA
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
            Do recorte técnico ao agente financiador
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-black/10 lg:grid-cols-3">
            {INCORPORADOR_STEPS.map((step) => (
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

      <section className="relative overflow-hidden bg-[#050505] px-4 py-20 sm:px-6">
        <img
          src={photos.skylineFunding}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/72" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
            PRODUTOS
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
                  CATÁLOGO
                </p>
                <p className="font-heading mt-4 text-2xl">
                  FIDCs artesanais e FINAdvisor
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Quando o projeto pede veículo sob demanda ou acompanhamento da
                  tese à execução.
                </p>
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

      <section
        id="formulario"
        className="scroll-mt-20 bg-[#f3efe6] px-4 py-20 text-black sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
              BRIEFING
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-tight sm:text-5xl">
              O que a mesa precisa no primeiro contato
            </h2>
            <ul className="mt-8 space-y-3 text-black/70">
              {INCORPORADOR_BRIEF.map((item) => (
                <li key={item} className="border-l-2 border-black/20 pl-4">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-black/50">
              E-mail e WhatsApp institucionais ainda não foram publicados. Use o
              formulário e guarde o resumo.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/parceiro">Sou originador parceiro</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
            <ContactForm defaultAudience="incorporador" lockAudience />
          </div>
        </div>
      </section>
    </div>
  )
}
