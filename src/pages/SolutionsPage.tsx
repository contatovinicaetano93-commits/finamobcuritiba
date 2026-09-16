import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PRODUCT_GROUPS, productsByGroup } from '@/data/products'

export function SolutionsPage() {
  return (
    <div className="bg-[#f4f1ea] text-black">
      <section className="bg-[#050505] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.22em] text-white/50 uppercase">
            Soluções
          </p>
          <h1 className="font-heading mt-3 max-w-3xl text-4xl sm:text-5xl">
            Financiamento para incorporadores e loteadores
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Da ponte ao true sale, as linhas cobrem lançamento, obra, estoque,
            recebível e estrutura de capital. A Finamob Curitiba encaixa o produto
            no estágio real do projeto.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6">
        {PRODUCT_GROUPS.map((group) => (
          <section key={group.id}>
            <h2 className="font-heading text-2xl sm:text-3xl">{group.title}</h2>
            <p className="mt-2 max-w-2xl text-black/65">{group.lead}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productsByGroup(group.id).map((product) => (
                <Card key={product.name} className="bg-white">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-black/70">{product.summary}</CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
        <div className="rounded-3xl bg-[#050505] px-6 py-10 text-white sm:px-10">
          <h2 className="font-heading text-3xl">Quer encaixar o funding no seu projeto?</h2>
          <p className="mt-2 max-w-xl text-white/70">
            Conte o estágio da obra, a praça e o valor aproximado. A equipe de
            Curitiba avalia o caminho mais eficiente.
          </p>
          <Button asChild className="mt-6 rounded-full" size="lg">
            <Link to="/contato">Falar com a Finamob Curitiba</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
