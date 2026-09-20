import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EXTRA_PRODUCTS, FUNDING_PRODUCTS, PRODUCT_GROUPS, productsByGroup } from '@/data/products'
import { VEHICLES } from '@/data/site'
import { photos } from '@/media/photos'

export function SolutionsPage() {
  return (
    <div className="bg-[#f3efe6] text-black">
      <section className="relative overflow-hidden bg-[#050505] px-4 py-20 text-white sm:px-6">
        <img
          src={photos.skylineFunding}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        <div className="relative mx-auto max-w-6xl py-6">
          <p className="font-mark text-[11px] tracking-[0.32em] text-white/55">
            SOLUÇÕES
          </p>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
            Financiamento para incorporadores e loteadores
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Ponte, obra, estoque, recebíveis e corporativo — e, quando o projeto
            pede, FIDCs artesanais e acompanhamento estratégico. A Finamob
            Curitiba encaixa o produto no estágio real da operação.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
        <section>
          <h2 className="font-heading text-3xl sm:text-4xl">Produtos de funding</h2>
          <div className="mt-7 grid gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
            {FUNDING_PRODUCTS.map((product) => (
              <article key={product.name} className="bg-white p-6">
                <h3 className="font-heading text-2xl">{product.name}</h3>
                <p className="mt-3 text-black/65">{product.summary}</p>
              </article>
            ))}
            {EXTRA_PRODUCTS.map((product) => (
              <article key={product.name} className="bg-white p-6">
                <p className="text-xs tracking-wide text-black/40 uppercase">
                  Outros produtos
                </p>
                <h3 className="font-heading mt-2 text-2xl">{product.name}</h3>
                <p className="mt-3 text-black/65">{product.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-3xl sm:text-4xl">Veículos</h2>
          <p className="mt-2 max-w-2xl text-black/65">
            Estruturas proprietárias para produção, crédito-ponte, capital de giro
            e captação via equity.
          </p>
          <div className="mt-7 grid gap-px overflow-hidden rounded-2xl bg-black/10 md:grid-cols-2">
            {VEHICLES.map((vehicle) => (
              <article key={vehicle.name} className="bg-white p-6">
                <p className="text-xs tracking-wide text-black/40 uppercase">
                  {vehicle.kicker}
                </p>
                <h3 className="font-heading mt-2 text-2xl">{vehicle.name}</h3>
                <p className="mt-3 text-black/65">{vehicle.summary}</p>
              </article>
            ))}
          </div>
        </section>

        {PRODUCT_GROUPS.map((group) => (
          <section key={group.id}>
            <h2 className="font-heading text-3xl sm:text-4xl">{group.title}</h2>
            <p className="mt-2 max-w-2xl text-black/65">{group.lead}</p>
            <div className="mt-7 grid gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
              {productsByGroup(group.id).map((product) => (
                <article key={product.name} className="bg-white p-6">
                  <h3 className="font-heading text-2xl">{product.name}</h3>
                  <p className="mt-3 text-black/65">{product.summary}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="overflow-hidden rounded-3xl bg-[#050505] px-6 py-12 text-white sm:px-10">
          <h2 className="font-heading text-3xl sm:text-4xl">
            Quer encaixar o funding no seu projeto?
          </h2>
          <p className="mt-3 max-w-xl text-white/70">
            Conte o estágio da obra, a praça e o valor aproximado. A Finamob
            Curitiba avalia o caminho mais eficiente.
          </p>
          <Button asChild className="mt-7 h-12 rounded-full px-6" size="lg">
            <Link to="/contato">Falar com a Finamob Curitiba</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
