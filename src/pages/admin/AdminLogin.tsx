import { useMemo, useState, type FormEvent } from 'react'
import { ADMIN_PASSWORD, PARTNERS, type PartnerId } from '@/data/admin'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AdminLoginProps = {
  error: string
  onSubmit: (partner: PartnerId, password: string) => void
}

export function AdminLogin({ error, onSubmit }: AdminLoginProps) {
  const [partner, setPartner] = useState<PartnerId>('vini')

  const hint = useMemo(
    () =>
      import.meta.env.VITE_ADMIN_PASSWORD
        ? 'Usem a senha combinada entre os três.'
        : `Senha local padrão: ${ADMIN_PASSWORD}. Troquem com VITE_ADMIN_PASSWORD.`,
    [],
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    onSubmit(partner, password)
  }

  return (
    <section className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-16 text-[#050505]">
      <BrandMark variant="dark" />
      <p className="mt-10 text-[10px] tracking-[0.2em] text-[#9c8563] uppercase">
        Sócios · Vini, Rafa e Tadeu
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight">Mesa Curitiba</h1>
      <p className="mt-4 text-sm leading-relaxed text-black/60">
        CRM, fila do dia, KPIs e metas. Não entra no site público.
      </p>
      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Quem está entrando</legend>
          <div className="grid grid-cols-3 gap-2">
            {PARTNERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPartner(item.id)}
                className={
                  partner === item.id
                    ? 'rounded-lg bg-[#050505] px-3 py-3 text-sm text-white'
                    : 'rounded-lg border border-black/15 bg-white px-3 py-3 text-sm'
                }
              >
                {item.name}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Senha da mesa</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <p className="text-xs text-black/50">{hint}</p>
        </div>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full">
          Entrar na mesa
        </Button>
      </form>
    </section>
  )
}
