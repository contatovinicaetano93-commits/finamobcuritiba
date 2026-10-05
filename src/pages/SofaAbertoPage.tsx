import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { SOFA_ABERTO } from '@/data/sofa-aberto'

export function SofaAbertoPage() {
  return (
    <div className="bg-[#050505] text-white">
      <section className="relative overflow-hidden">
        <img
          src={SOFA_ABERTO.arts[2].src}
          alt="Convite Sofá Aberto Finamob Curitiba"
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/55" />
        <div className="relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <BrandMark />
          <Kicker className="mt-10 text-white/55">{SOFA_ABERTO.kicker}</Kicker>
          <h1 className="font-heading mt-6 max-w-4xl text-[2.6rem] leading-[0.95] tracking-tight sm:text-7xl">
            {SOFA_ABERTO.title}
            <span className="mt-4 block text-[1.15rem] leading-snug tracking-normal text-white/72 italic sm:text-3xl">
              {SOFA_ABERTO.audience}
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            A Finamob Curitiba abre o sofá do escritório. Café, conversa reta
            sobre funding — o que trava a obra, o que o mercado de capitais já
            resolve, e o que a mesa lê no projeto.
          </p>
          <dl className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-2 sm:max-w-lg">
            <div>
              <dt className="text-[10px] tracking-[0.18em] text-[#9c8563] uppercase">
                Onde
              </dt>
              <dd className="mt-1">
                {SOFA_ABERTO.place}
                {SOFA_ABERTO.street ? ` · ${SOFA_ABERTO.street}` : ''}
                <span className="block text-white/45">{SOFA_ABERTO.city}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.18em] text-[#9c8563] uppercase">
                Quando
              </dt>
              <dd className="mt-1">
                {SOFA_ABERTO.when ||
                  'A data entra no convite quando a mesa confirmar o dia.'}
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contato?sofa=1">Quero estar no sofá</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-on-dark">
              <a href="#artes">Baixar artes</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f3efe6] px-4 py-20 text-[#050505] sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Kicker className="text-black/45">O encontro</Kicker>
            <h2 className="font-heading mt-4 text-4xl tracking-tight">
              Casa aberta para quem faz a praça.
            </h2>
            <ul className="mt-8 space-y-4 text-black/70">
              <li className="border-l border-[#9c8563]/60 pl-4">
                Incorporadores e construtores com projeto na mesa — lançamento,
                obra ou estoque.
              </li>
              <li className="border-l border-[#9c8563]/60 pl-4">
                Conversa com Vini, Rafa e Tadeu: funding, veículos e o que o
                Farejador aponta no caso.
              </li>
              <li className="border-l border-[#9c8563]/60 pl-4">
                Sem palco. Um sofá, café e o escritório da Finamob Curitiba.
              </li>
            </ul>
          </div>
          <aside className="self-start rounded-sm border border-black/10 bg-white p-6 sm:p-8">
            <p className="text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
              Confirme presença
            </p>
            <p className="font-heading mt-3 text-2xl tracking-tight">
              Mande o nome da empresa e o que está na prancheta.
            </p>
            <p className="mt-3 text-sm text-black/55">
              E-mail e WhatsApp institucionais ainda não foram publicados. O
              formulário registra o convite.
            </p>
            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link to="/contato?sofa=1">Confirmar no formulário</Link>
            </Button>
          </aside>
        </div>
      </section>

      <section id="artes" className="border-t border-white/10 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Kicker className="text-white/55">Artes da identidade</Kicker>
          <h2 className="font-heading mt-4 text-4xl tracking-tight">
            Três cortes para disparar.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/60">
            Tinta, papel e bronze. Sem rua inventada — quando tiverem endereço e
            data, a mesa atualiza o convite.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {SOFA_ABERTO.arts.map((art) => (
              <li key={art.src} className="overflow-hidden rounded-sm bg-white/5">
                <img
                  src={art.src}
                  alt={`${art.label} — Sofá Aberto Finamob Curitiba`}
                  className="aspect-[4/5] w-full object-cover object-top md:aspect-[3/4]"
                />
                <div className="flex items-end justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm">{art.label}</p>
                    <p className="text-xs text-white/45">{art.hint}</p>
                  </div>
                  <a
                    href={art.src}
                    download={art.download}
                    className="text-xs tracking-[0.12em] text-[#c4b49a] uppercase hover:text-white"
                  >
                    Baixar
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
