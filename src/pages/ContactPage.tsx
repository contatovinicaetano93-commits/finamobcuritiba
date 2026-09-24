import { Link } from 'react-router-dom'
import { ContactForm } from '@/components/ContactForm'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { SITE } from '@/data/site'
import { photos } from '@/media/photos'

export function ContactPage() {
  return (
    <div className="bg-paper text-black">
      <section className="relative overflow-hidden bg-[#050505] px-4 py-24 text-white sm:px-6 sm:py-28">
        <img
          src={photos.skylineCta}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/55" />
        <div className="relative mx-auto max-w-6xl py-6">
          <Kicker className="text-white/55">Contato · {SITE.city}</Kicker>
          <h1 className="font-heading mt-6 max-w-3xl text-4xl leading-[1.08] tracking-tight sm:text-6xl">
            Conte o projeto.
            <span className="mt-3 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl">
              Ou entre na originação.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/70">
            A Finamob Curitiba atende incorporadores, loteadores e originadores
            parceiros a partir de {SITE.city}. Prefere um canal só seu? Entre na
            área de incorporador ou de originador.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/incorporador">Área do incorporador</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <Link to="/parceiro">Área do originador</Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <h2 className="font-heading text-3xl tracking-tight">
            O que ajuda no primeiro contato
          </h2>
          <ul className="space-y-3 text-black/70">
            <li className="border-l border-bronze/50 pl-4">
              Cidade e tipo do empreendimento
            </li>
            <li className="border-l border-bronze/50 pl-4">
              Estágio: lançamento, obra, estoque ou carteira
            </li>
            <li className="border-l border-bronze/50 pl-4">
              Necessidade aproximada de capital
            </li>
            <li className="border-l border-bronze/50 pl-4">
              Prazo em que o recurso precisa entrar
            </li>
          </ul>
          <p className="text-sm text-black/50">
            E-mail e WhatsApp institucionais ainda não foram publicados. Use o
            formulário e guarde o resumo da conversa.
          </p>
        </aside>
        <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
