import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
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
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/45" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14">
          <p className="font-mark text-[11px] tracking-[0.42em] text-white/70">
            ORIGINADOR PARCEIRO · {SITE.name.toUpperCase()}
          </p>
          <h1 className="font-heading mt-5 max-w-5xl text-[2.15rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            Traga a operação. Receba quando o funding fechar.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg">
            Corretores, consultores, contadores e quem já origina obra ou
            loteamento na praça. A Finamob Curitiba estrutura, lê o Farejador e
            busca o capital. A remuneração entra na operação fechada.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <a href="#formulario">
                Quero originar
                <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/incorporador">Sou incorporador</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            ORIGINAÇÃO
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
            Quem origina, recebe por funding fechado
          </h2>
          <div className="mt-12 grid gap-10 border-t border-black/10 pt-10 sm:grid-cols-3">
            {PARTNER_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-6xl tracking-tight sm:text-7xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-lg text-black/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 pb-20 text-black sm:px-6">
        <div className="mx-auto max-w-6xl border-t border-black/10 pt-20">
          <p className="font-mark text-[11px] tracking-[0.32em] text-black/45">
            COMO FUNCIONA
          </p>
          <h2 className="font-heading mt-4 max-w-3xl text-3xl sm:text-5xl">
            Você origina. A mesa estrutura.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-black/10 lg:grid-cols-3">
            {PARCEIRO_STEPS.map((step) => (
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
          <ul className="mt-12 grid gap-3 sm:grid-cols-2">
            {PARCEIRO_PROFILES.map((profile) => (
              <li
                key={profile}
                className="border-l-2 border-black/20 pl-4 text-black/70"
              >
                {profile}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="formulario"
        className="scroll-mt-20 bg-[#050505] px-4 py-20 sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mark text-[11px] tracking-[0.32em] text-white/45">
              CADASTRO
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-tight text-white sm:text-5xl">
              Entre como originador da Finamob Curitiba
            </h2>
            <p className="mt-5 text-white/65">
              Empresa, praça de atuação e o tipo de relacionamento que você já
              tem com incorporadores e loteadores. Sem volume mínimo para
              começar a conversa.
            </p>
            <p className="mt-6 text-sm text-white/45">
              E-mail e WhatsApp institucionais ainda não foram publicados. Use o
              formulário e guarde o resumo.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white p-6 text-black sm:p-8">
            <ContactForm defaultAudience="parceiro" lockAudience />
          </div>
        </div>
      </section>
    </div>
  )
}
