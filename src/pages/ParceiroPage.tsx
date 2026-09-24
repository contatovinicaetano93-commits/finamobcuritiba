import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import {
  PARCEIRO_PROFILES,
  PARCEIRO_STEPS,
  rememberArea,
} from '@/data/areas'
import { PARTNER_STATS, SITE } from '@/data/site'
import { photos } from '@/media/photos'

export function ParceiroPage() {
  useEffect(() => {
    rememberArea('parceiro')
  }, [])

  return (
    <div className="bg-[#050505] text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={photos.skylineCta}
          alt=""
          className="absolute inset-0 size-full object-cover object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/45" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <Kicker className="text-white/55">
            Originador parceiro · {SITE.name}
          </Kicker>
          <h1 className="font-heading mt-6 max-w-5xl text-[2.4rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.6rem]">
            Traga a operação.
            <span className="mt-3 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl lg:text-[2rem]">
              Receba quando o funding fechar.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            Corretores, consultores, contadores e quem já origina obra ou
            loteamento na praça. A Finamob Curitiba estrutura, lê o Farejador e
            busca o capital. A remuneração entra na operação fechada.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#formulario">
                Quero originar
                <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <Link to="/incorporador">Sou incorporador</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-24 text-black sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Kicker className="text-bronze">Originação</Kicker>
          <h2 className="font-heading mt-6 max-w-3xl text-3xl leading-[1.12] tracking-tight sm:text-5xl">
            Quem origina, recebe por funding fechado
          </h2>
          <div className="mt-14 grid gap-10 border-t border-black/10 pt-12 sm:grid-cols-3">
            {PARTNER_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="display-number text-6xl sm:text-7xl">{stat.value}</p>
                <p className="mt-2 text-lg text-black/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 pb-24 text-black sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-6xl border-t border-black/10 pt-24">
          <Kicker className="text-bronze">Como funciona</Kicker>
          <h2 className="font-heading mt-6 max-w-3xl text-3xl tracking-tight sm:text-5xl">
            Você origina. A mesa estrutura.
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden bg-black/10 lg:grid-cols-3">
            {PARCEIRO_STEPS.map((step) => (
              <article key={step.kicker} className="bg-paper p-7 sm:p-9">
                <Kicker className="text-bronze" rule={false}>
                  {step.kicker}
                </Kicker>
                <h3 className="font-heading mt-4 text-2xl sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-black/65">{step.text}</p>
              </article>
            ))}
          </div>
          <ul className="mt-14 grid gap-3 sm:grid-cols-2">
            {PARCEIRO_PROFILES.map((profile) => (
              <li
                key={profile}
                className="border-l border-bronze/50 pl-4 text-black/70"
              >
                {profile}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="formulario"
        className="scroll-mt-20 bg-[#050505] px-4 py-24 sm:px-6 sm:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Kicker className="text-bronze">Cadastro</Kicker>
            <h2 className="font-heading mt-6 text-3xl leading-[1.12] tracking-tight text-white sm:text-5xl">
              Entre como originador da Finamob Curitiba
            </h2>
            <p className="mt-6 text-white/65">
              Empresa, praça de atuação e o tipo de relacionamento que você já
              tem com incorporadores e loteadores. Sem volume mínimo para
              começar a conversa.
            </p>
            <p className="mt-6 text-sm text-white/45">
              E-mail e WhatsApp institucionais ainda não foram publicados. Use o
              formulário e guarde o resumo.
            </p>
          </div>
          <div className="rounded-sm border border-white/10 bg-white p-6 text-black sm:p-8">
            <ContactForm defaultAudience="parceiro" lockAudience />
          </div>
        </div>
      </section>
    </div>
  )
}
