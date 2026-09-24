import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Kicker } from '@/components/Kicker'
import { MotionCard } from '@/components/MotionCard'
import { Reveal } from '@/components/Reveal'
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
          className="hero-drift absolute inset-0 size-full object-cover object-[78%_center] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/45" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <Kicker className="text-white/55">Incorporador · {SITE.name}</Kicker>
          <h1 className="font-heading mt-6 max-w-5xl text-[2.4rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.6rem]">
            Envie o projeto.
            <span className="mt-3 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl lg:text-[2rem]">
              A Finamob Curitiba encaixa o funding.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            Ponte, obra, estoque, recebíveis ou corporativo — a leitura começa
            pela praça, pelo estágio da operação e pelo Farejador. Sem cadastro
            para avaliar o projeto neste site.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#formulario">
                Enviar o projeto
                <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <Link to="/farejador">Avaliar no Farejador</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-24 text-black sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Kicker className="text-bronze">Como entra</Kicker>
          <h2 className="font-heading mt-6 max-w-3xl text-3xl leading-[1.12] tracking-tight sm:text-5xl">
            Do recorte técnico ao agente financiador
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden bg-black/10 lg:grid-cols-3">
            {INCORPORADOR_STEPS.map((step, index) => (
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

      <section className="relative overflow-hidden bg-[#050505] px-4 py-24 sm:px-6 sm:py-28">
        <img
          src={photos.skylineFunding}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/72" />
        <div className="relative mx-auto max-w-6xl">
          <Kicker className="text-bronze">Produtos</Kicker>
          <h2 className="font-heading mt-6 max-w-3xl text-3xl tracking-tight sm:text-5xl">
            Funding para cada momento do empreendimento
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FUNDING_PRODUCTS.map((product) => (
              <MotionCard key={product.name} className="p-6 sm:p-8">
                <h3 className="font-heading text-2xl">{product.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {product.summary}
                </p>
              </MotionCard>
            ))}
            <MotionCard className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <Kicker className="text-white/40" rule={false}>
                  Catálogo
                </Kicker>
                <p className="font-heading mt-4 text-2xl">
                  FIDCs artesanais e FINAdvisor
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Quando o projeto pede veículo sob demanda ou acompanhamento da
                  tese à execução.
                </p>
              </div>
              <Button asChild variant="outline" className="btn-on-dark mt-6 w-fit">
                <Link to="/solucoes">Ver catálogo completo</Link>
              </Button>
            </MotionCard>
          </div>
        </div>
      </section>

      <section
        id="formulario"
        className="scroll-mt-20 bg-paper px-4 py-24 text-black sm:px-6 sm:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Kicker className="text-bronze">Briefing</Kicker>
            <h2 className="font-heading mt-6 text-3xl leading-[1.12] tracking-tight sm:text-5xl">
              O que a mesa precisa no primeiro contato
            </h2>
            <ul className="mt-10 space-y-3 text-black/70">
              {INCORPORADOR_BRIEF.map((item) => (
                <li key={item} className="border-l border-bronze/50 pl-4">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-black/50">
              E-mail e WhatsApp institucionais ainda não foram publicados. Use o
              formulário e guarde o resumo.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/parceiro">Sou originador parceiro</Link>
            </Button>
          </div>
          <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8">
            <ContactForm defaultAudience="incorporador" lockAudience />
          </div>
        </div>
      </section>
    </div>
  )
}
