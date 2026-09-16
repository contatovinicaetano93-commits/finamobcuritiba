import { ContactForm } from '@/components/ContactForm'
import { SITE } from '@/data/site'

export function ContactPage() {
  return (
    <div className="bg-[#f4f1ea] text-black">
      <section className="bg-[#050505] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.22em] text-white/50 uppercase">Contato</p>
          <h1 className="font-heading mt-3 max-w-3xl text-4xl sm:text-5xl">
            Conte o projeto. A gente estrutura o funding.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Atendemos incorporadores e loteadores a partir de {SITE.city}. Sem site
            antigo no ar: este é o canal oficial da operação local.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <h2 className="font-heading text-2xl">O que ajuda no primeiro contato</h2>
          <ul className="list-disc space-y-2 pl-5 text-black/70">
            <li>Cidade e tipo do empreendimento</li>
            <li>Estágio: lançamento, obra, estoque ou carteira</li>
            <li>Necessidade aproximada de capital</li>
            <li>Prazo em que o recurso precisa entrar</li>
          </ul>
          <p className="text-sm text-black/55">
            E-mail e WhatsApp institucionais ainda não foram publicados. Use o
            formulário e guarde o resumo da conversa.
          </p>
        </aside>
        <ContactForm />
      </div>
    </div>
  )
}
