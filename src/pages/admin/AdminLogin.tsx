import { useMemo, useState, type FormEvent } from 'react'
import { ADMIN_PASSWORD, PARTNERS, type PartnerId } from '@/data/admin'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eyebrow, OwnerMark } from '@/pages/admin/admin-ui'
import { cn } from '@/lib/utils'

type AdminLoginProps = {
  error: string
  busy?: boolean
  onSubmit: (partner: PartnerId, password: string) => void
}

export function AdminLogin({ error, busy = false, onSubmit }: AdminLoginProps) {
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
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside className="admin-login-ink relative hidden flex-col justify-between overflow-hidden px-12 py-14 text-[#f3efe6] lg:flex">
        <BrandMark variant="light" />
        <div className="max-w-md">
          <p className="text-[10px] tracking-[0.28em] text-[#9c8563] uppercase">
            Sócios · Vini, Rafa e Tadeu
          </p>
          <h1 className="font-heading mt-5 text-6xl leading-[0.92] tracking-tight">
            Mesa
            <br />
            Curitiba
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/78">
            CRM, fila do dia, KPIs e metas da praça. Um dono por conta. O que
            entra aqui não aparece no site.
          </p>
        </div>
        <ul className="flex gap-8 text-[11px] font-medium tracking-[0.18em] text-white/65 uppercase">
          <li>Hoje</li>
          <li>CRM</li>
          <li>KPIs</li>
          <li>Metas</li>
        </ul>
      </aside>

      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-5 py-14 sm:px-8">
        <div className="lg:hidden">
          <BrandMark variant="dark" />
          <div className="mt-8">
            <Eyebrow>Sócios · Vini, Rafa e Tadeu</Eyebrow>
            <h1 className="font-heading mt-3 text-4xl tracking-tight">
              Mesa Curitiba
            </h1>
          </div>
        </div>
        <div className="hidden lg:block">
          <Eyebrow>Entrar</Eyebrow>
          <h2 className="font-heading mt-3 text-4xl tracking-tight">
            Quem está na mesa
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#3f3b34]">
          Escolha o sócio (Vini, Rafa ou Tadeu) e entre com a senha da mesa. A
          sessão fica no navegador e o quadro puxa metas e timeline no Neon.
        </p>
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-[#12110f]">
              Quem está na mesa
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {PARTNERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPartner(item.id)}
                  aria-pressed={partner === item.id}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 text-sm font-medium shadow-sm transition-colors',
                    partner === item.id
                      ? 'border-[#12110f] bg-[#12110f] text-white shadow-none'
                      : 'border-[rgb(18_17_15/0.28)] bg-white text-[#3f3b34] hover:border-[#12110f]',
                  )}
                >
                  <OwnerMark id={item.id} />
                  {item.name}
                </button>
              ))}
            </div>
            <input type="hidden" name="partnerId" value={partner} />
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha da mesa</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
            <p className="text-xs text-[#5c574e]">{hint}</p>
          </div>
          {error ? (
            <p className="text-sm font-medium text-[#6b241c]" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar na mesa'}
          </Button>
        </form>
      </section>
    </div>
  )
}
