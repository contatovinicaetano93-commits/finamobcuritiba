import { Link } from 'react-router-dom'
import { Kicker } from '@/components/Kicker'
import { Button } from '@/components/ui/button'
import { PDF_HREF, SHOWCASE_PDF_FILENAME, SHOWCASE_PDF_HREF, SITE } from '@/data/site'

export function HomeContact() {
  return (
    <section id="contato" className="scroll-mt-20 bg-[#050505] text-white">
      <div className="mx-auto flex min-h-[62svh] max-w-6xl flex-col justify-end px-4 py-16 sm:min-h-[70svh] sm:px-6">
        <Kicker className="text-white/55">Contato · {SITE.city}</Kicker>
        <h2 className="font-heading mt-6 max-w-xl text-4xl leading-[1.12] tracking-tight sm:text-5xl">
          Fale com a
          <span className="mt-2 block whitespace-nowrap">Finamob Curitiba</span>
        </h2>
        <p className="mt-6 max-w-md text-white/70">
          E-mail e WhatsApp institucionais ainda não foram publicados. Use o
          formulário e a gente retoma pelo canal que vocês já usam.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/area">Escolher área</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="btn-on-dark">
            <a href={PDF_HREF} download>
              Baixar folder
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="btn-on-dark">
            <a href={SHOWCASE_PDF_HREF} download={SHOWCASE_PDF_FILENAME}>
              Baixar mostruário
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
