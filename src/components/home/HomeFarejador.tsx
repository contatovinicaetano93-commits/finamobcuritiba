import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { CountUp, CountUpGroup } from '@/components/CountUp'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { FAREJADOR_HREF, FAREJADOR_SAMPLE } from '@/data/site'

export function HomeFarejador() {
  return (
    <section
      id="farejador"
      className="scroll-mt-20 bg-[#050505] px-4 py-24 sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <Kicker className="text-bronze">Farejador</Kicker>
          <h2 className="font-heading mt-6 text-3xl leading-[1.12] tracking-tight sm:text-5xl">
            Entenda o racional dos agentes financiadores e avalie o seu projeto.
          </h2>
          <p className="mt-6 max-w-xl text-white/65">
            O Farejador analisa praça, produto, economics e player — o mesmo
            recorte que a mesa usa para ler a saúde da operação. A leitura agora
            roda aqui, no site da Finamob Curitiba.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/farejador">
                Avaliar o projeto neste site
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <a href={FAREJADOR_HREF} target="_blank" rel="noreferrer">
                Abrir a mesa original
                <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>
        <aside className="rounded-sm border border-white/10 bg-[#0b0b0b] p-6 sm:p-8">
          <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
            Exemplo de leitura
          </p>
          <CountUpGroup className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="display-number text-5xl">
                <CountUp value={FAREJADOR_SAMPLE.score} />
              </p>
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
          </CountUpGroup>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FAREJADOR_SAMPLE.pillars.map((pillar) => (
              <li
                key={pillar.name}
                className="rounded-sm border border-white/8 bg-white/5 px-4 py-3"
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
  )
}
