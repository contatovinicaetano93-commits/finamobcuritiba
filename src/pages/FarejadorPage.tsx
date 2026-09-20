import { Link, useNavigate } from 'react-router-dom'
import { FarejadorEngine } from '@/components/FarejadorEngine'
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
    navigate('/contato')
  }

  return (
    <div className="bg-[#f3efe6] text-black">
      <section className="bg-[#050505] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-6xl py-6">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            FAREJADOR · FINAMOB CURITIBA
          </p>
          <h1 className="font-heading mt-4 max-w-4xl text-4xl leading-tight sm:text-6xl">
            Entenda o racional dos agentes financiadores e avalie o seu projeto.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            O mesmo recorte da mesa: praça, produto, economics e player. A leitura
            sai na hora, neste site — sem login e sem sair da Finamob Curitiba.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <FarejadorEngine onLead={sendLead} />
        <p className="mt-10 max-w-2xl text-sm text-black/50">
          Esta é a leitura pública do motor. A mesa completa — Meteoro, BI e
          cadastro de SPE — continua no sistema interno.{' '}
          <Link to="/contato" className="underline underline-offset-4">
            Fale com a Finamob Curitiba
          </Link>{' '}
          se o projeto pedir o Farejador completo.
        </p>
        <div className="mt-8">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/#formulario">Voltar ao formulário</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
