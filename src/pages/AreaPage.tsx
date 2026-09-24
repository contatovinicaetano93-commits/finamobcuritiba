import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import {
  AREA_CHOICES,
  areaLabel,
  areaPath,
  lastArea,
  type AreaId,
} from '@/data/areas'
import { SITE } from '@/data/site'
import { photos } from '@/media/photos'

export function AreaPage() {
  const [saved] = useState<AreaId | null>(() => lastArea())

  return (
    <div className="bg-[#050505] text-white">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src={photos.skylineManifesto}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <Kicker className="text-white/55">Áreas · {SITE.name}</Kicker>
          <h1 className="font-heading mt-6 max-w-4xl text-[2.4rem] leading-[1.02] tracking-tight sm:text-6xl">
            Incorporador ou originador parceiro.
            <span className="mt-3 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl">
              Escolha o canal certo.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            Quem precisa de funding entra com o projeto. Quem origina na praça
            traz a operação e recebe quando o capital fecha. A Finamob Curitiba
            estrutura os dois lados da mesa.
          </p>
          {saved ? (
            <p className="mt-6 text-sm text-white/70">
              Você esteve na área de {areaLabel(saved)}.{' '}
              <Link
                to={areaPath(saved)}
                className="underline underline-offset-4"
              >
                Continuar
              </Link>
            </p>
          ) : null}
          <div className="mt-12 grid gap-px overflow-hidden bg-white/10 lg:grid-cols-2">
            {AREA_CHOICES.map((choice) => (
              <article key={choice.id} className="bg-black/55 p-6 sm:p-8">
                <Kicker className="text-white/45" rule={false}>
                  {choice.kicker}
                </Kicker>
                <h2 className="font-heading mt-3 text-3xl">{choice.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {choice.text}
                </p>
                <Button asChild size="lg" className="mt-6">
                  <Link to={areaPath(choice.id)}>
                    {choice.cta}
                    <ArrowRight />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
