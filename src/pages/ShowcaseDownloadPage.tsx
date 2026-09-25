import { useEffect } from 'react'
import { SHOWCASE_PDF_FILENAME, SHOWCASE_PDF_HREF } from '@/data/site'
import { Button } from '@/components/ui/button'

export function ShowcaseDownloadPage() {
  useEffect(() => {
    const link = document.createElement('a')
    link.href = SHOWCASE_PDF_HREF
    link.download = SHOWCASE_PDF_FILENAME
    link.rel = 'noopener'
    document.body.append(link)
    link.click()
    link.remove()
  }, [])

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-4 py-24 text-white sm:px-6">
      <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
        Finamob Curitiba
      </p>
      <h1 className="font-heading mt-4 text-4xl tracking-tight">
        Mostruário
      </h1>
      <p className="mt-4 text-white/70">
        20 páginas: quem somos, como operamos e a prateleira de funding. Se o
        arquivo não baixar sozinho, use o botão abaixo.
      </p>
      <div className="mt-10">
        <Button asChild size="lg">
          <a href={SHOWCASE_PDF_HREF} download={SHOWCASE_PDF_FILENAME}>
            Baixar PDF
          </a>
        </Button>
      </div>
    </section>
  )
}
