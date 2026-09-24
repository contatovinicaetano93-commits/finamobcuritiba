import { Link, useNavigate } from 'react-router-dom'
import { FarejadorEngine } from '@/components/FarejadorEngine'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { formatScore, type FarejadorResult } from '@/lib/farejador'

export function FarejadorPage() {
  const navigate = useNavigate()

  function sendLead(result: FarejadorResult) {
    const summary = [
      `Farejador — score ${formatScore(result.score, 2)} · ${result.rating}`,
      ...result.pillars.map(
        (pillar) =>
          `${pillar.name}: ${formatScore(pillar.score)} · ${pillar.rating}`,
      ),
    ].join('\n')
    window.localStorage.setItem('finamob-curitiba-farejador', summary)
    navigate('/incorporador#formulario')
  }

  return (
    <div className="bg-paper text-black">
      <section className="bg-[#050505] px-4 py-24 text-white sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl py-6">
          <Kicker className="text-bronze">Farejador · Finamob Curitiba</Kicker>
          <h1 className="font-heading mt-6 max-w-4xl text-4xl leading-[1.08] tracking-tight sm:text-6xl">
            Entenda o racional dos agentes financiadores
            <span className="mt-3 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl">
              e avalie o seu projeto.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/70">
            O mesmo recorte da mesa: praça, produto, economics e player. A leitura
            sai na hora, neste site — sem login e sem sair da Finamob Curitiba.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <FarejadorEngine onLead={sendLead} />
        <p className="mt-12 max-w-2xl text-sm text-black/50">
          Esta é a leitura pública do motor. A mesa completa — Meteoro, BI e
          cadastro de SPE — continua no sistema interno.{' '}
          <Link to="/incorporador" className="underline underline-offset-4">
            Fale com a Finamob Curitiba
          </Link>{' '}
          se o projeto pedir o Farejador completo.
        </p>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/incorporador#formulario">Voltar ao formulário</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
