import { Link } from 'react-router-dom'
import { Kicker } from '@/components/Kicker'
import { MotionCard } from '@/components/MotionCard'
import { Button } from '@/components/ui/button'
import { EXTRA_PRODUCTS, FUNDING_PRODUCTS } from '@/data/products'

export function HomeProducts() {
  return (
    <section id="produtos" className="scroll-mt-20 bg-[#050505] px-4 py-24 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Kicker className="text-bronze">Produtos de funding</Kicker>
        <h2 className="font-heading mt-6 max-w-3xl text-3xl tracking-tight sm:text-5xl">
          Funding para cada momento do empreendimento
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {FUNDING_PRODUCTS.map((product) => (
            <MotionCard key={product.name} className="p-6 sm:p-8">
              <h3 className="font-heading text-2xl">{product.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {product.summary}
              </p>
            </MotionCard>
          ))}
          <MotionCard className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <Kicker className="text-white/40" rule={false}>
                Outros produtos
              </Kicker>
              <ul className="mt-5 space-y-4">
                {EXTRA_PRODUCTS.map((product) => (
                  <li key={product.name}>
                    <p className="font-heading text-xl">{product.name}</p>
                    <p className="mt-1 text-sm text-white/60">{product.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild variant="outline" className="btn-on-dark mt-6 w-fit">
              <Link to="/solucoes">Ver catálogo completo</Link>
            </Button>
          </MotionCard>
        </div>
      </div>
    </section>
  )
}
