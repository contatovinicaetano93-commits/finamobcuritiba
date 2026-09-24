import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { photos } from '@/media/photos'

export function HomeHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <img
        src={photos.skylineManifesto}
        alt=""
        className="hero-drift absolute inset-0 size-full object-cover object-[78%_center] opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/45" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
        <Kicker className="text-white/55">Finamob Curitiba</Kicker>
        <h1 className="font-heading mt-6 max-w-5xl text-[2.4rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[5rem]">
          Financiamento
          <span className="mt-3 block text-[1.2rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl lg:text-[2.05rem]">
            para incorporadores e loteadores
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
          Viabilizamos o financiamento do seu projeto imobiliário, com máxima
          eficiência, através de alto nível de embasamento técnico, capilaridade
          de mais de 200 agentes financiadores e veículos proprietários de
          investimento.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/incorporador">
              Quero financiar um projeto
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="btn-on-dark">
            <Link to="/parceiro">Quero originar negócios</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
