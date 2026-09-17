import { ContactForm } from '@/components/ContactForm'
import { SITE } from '@/data/site'
import { photos } from '@/media/photos'

export function ContactPage() {
  return (
    <div className="bg-[#f3efe6] text-black">
      <section className="relative overflow-hidden bg-[#050505] px-4 py-20 text-white sm:px-6">
        <img
          src={photos.skylineCta}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/55" />
        <div className="relative mx-auto max-w-6xl py-6">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            CONTATO
          </p>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
            Conte o projeto. A gente estrutura o funding.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Atendemos incorporadores e loteadores a partir de {SITE.city}.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <h2 className="font-heading text-3xl">O que ajuda no primeiro contato</h2>
          <ul className="space-y-3 text-black/70">
            <li className="border-l-2 border-black/20 pl-4">
              Cidade e tipo do empreendimento
            </li>
            <li className="border-l-2 border-black/20 pl-4">
              Estágio: lançamento, obra, estoque ou carteira
            </li>
            <li className="border-l-2 border-black/20 pl-4">
              Necessidade aproximada de capital
            </li>
            <li className="border-l-2 border-black/20 pl-4">
              Prazo em que o recurso precisa entrar
            </li>
          </ul>
          <p className="text-sm text-black/50">
            E-mail e WhatsApp institucionais ainda não foram publicados. Use o
            formulário e guarde o resumo da conversa.
          </p>
        </aside>
        <ContactForm />
      </div>
    </div>
  )
}
