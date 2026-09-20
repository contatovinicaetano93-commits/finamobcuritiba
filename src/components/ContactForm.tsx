import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FUNDING_PRODUCTS } from '@/data/products'
import { SITE } from '@/data/site'
import { cn } from '@/lib/utils'

export type Audience = 'incorporador' | 'parceiro'
type FormStatus = 'editing' | 'invalid' | 'success'

interface LeadForm {
  audience: Audience
  name: string
  company: string
  cnpj: string
  phone: string
  email: string
  product: string
  message: string
}

const EMPTY: Omit<LeadForm, 'audience'> = {
  name: '',
  company: '',
  cnpj: '',
  phone: '',
  email: '',
  product: '',
  message: '',
}

function isValid(form: LeadForm): boolean {
  const hasName = form.name.trim().length >= 3
  const hasContact = form.phone.trim().length >= 8 || form.email.includes('@')
  const hasMessage = form.message.trim().length >= 10
  switch (form.audience) {
    case 'parceiro':
      return hasName && hasContact && hasMessage && form.company.trim().length >= 2
    case 'incorporador':
      return hasName && hasContact && hasMessage
    default: {
      const exhaustive: never = form.audience
      return exhaustive
    }
  }
}

function roleLabel(audience: Audience): string {
  switch (audience) {
    case 'incorporador':
      return 'Incorporador / loteador'
    case 'parceiro':
      return 'Parceiro originador'
    default: {
      const exhaustive: never = audience
      return exhaustive
    }
  }
}

function formatLead(form: LeadForm): string {
  return [
    `Lead — ${SITE.name}`,
    `Perfil: ${roleLabel(form.audience)}`,
    `Nome: ${form.name}`,
    `Empresa: ${form.company || '—'}`,
    form.audience === 'parceiro' ? `CNPJ: ${form.cnpj || '—'}` : null,
    `Telefone: ${form.phone || '—'}`,
    `E-mail: ${form.email || '—'}`,
    form.audience === 'incorporador'
      ? `Solução: ${form.product || 'A definir'}`
      : null,
    '',
    form.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
}

function parseAudience(value: string | null): Audience {
  return value === 'parceiro' ? 'parceiro' : 'incorporador'
}

export function ContactForm({ defaultAudience }: { defaultAudience?: Audience }) {
  const [params, setParams] = useSearchParams()
  const audience = parseAudience(params.get('lead') ?? defaultAudience ?? null)
  const [form, setForm] = useState<LeadForm>({ ...EMPTY, audience })
  const [status, setStatus] = useState<FormStatus>('editing')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const summary = useMemo(
    () => formatLead({ ...form, audience }),
    [form, audience],
  )

  function setAudience(next: Audience) {
    const nextParams = new URLSearchParams(params)
    if (next === 'parceiro') {
      nextParams.set('lead', 'parceiro')
    } else {
      nextParams.delete('lead')
    }
    setParams(nextParams, { replace: true })
    setForm((current) => ({ ...current, audience: next }))
    if (status === 'invalid') {
      setStatus('editing')
    }
  }

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (status === 'invalid') {
      setStatus('editing')
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = { ...form, audience }
    if (!isValid(payload)) {
      setStatus('invalid')
      return
    }
    window.localStorage.setItem(
      'finamob-curitiba-last-lead',
      formatLead(payload),
    )
    setStatus('success')
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-black">
        <p className="font-heading text-2xl">Recebemos o seu recado.</p>
        <p className="mt-2 text-sm text-black/70">
          A equipe da Finamob Curitiba ainda está no ar sem e-mail público. Guarde
          este resumo ou envie pelo canal que vocês já usam com a gente.
        </p>
        <pre className="mt-4 overflow-auto rounded-xl bg-[#f4f1ea] p-4 text-xs leading-relaxed whitespace-pre-wrap">
          {summary}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void copySummary()}>
            {copyState === 'copied' ? 'Copiado' : 'Copiar resumo'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm({ ...EMPTY, audience })
              setStatus('editing')
              setCopyState('idle')
            }}
          >
            Enviar outra mensagem
          </Button>
        </div>
        {copyState === 'failed' ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            Não foi possível copiar automaticamente. Selecione o texto acima.
          </p>
        ) : null}
      </div>
    )
  }

  if (status !== 'editing' && status !== 'invalid') {
    const exhaustive: never = status
    return exhaustive
  }

  return (
    <div className="space-y-6">
      <div
        className="grid gap-2 rounded-full bg-black/5 p-1 sm:grid-cols-2"
        role="tablist"
        aria-label="Perfil do contato"
      >
        <AudienceTab
          selected={audience === 'incorporador'}
          onSelect={() => setAudience('incorporador')}
        >
          Sou incorporador
        </AudienceTab>
        <AudienceTab
          selected={audience === 'parceiro'}
          onSelect={() => setAudience('parceiro')}
        >
          Quero originar
        </AudienceTab>
      </div>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {status === 'invalid' ? (
          <p
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {audience === 'parceiro'
              ? 'Preencha nome, empresa, uma forma de contato e uma mensagem com pelo menos 10 caracteres.'
              : 'Preencha nome, uma forma de contato (telefone ou e-mail) e uma mensagem com pelo menos 10 caracteres.'}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="name">
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoComplete="name"
              required
              className="h-10"
            />
          </Field>
          <Field label="Empresa" htmlFor="company">
            <Input
              id="company"
              name="company"
              value={form.company}
              onChange={(event) => update('company', event.target.value)}
              autoComplete="organization"
              className="h-10"
            />
          </Field>
          {audience === 'parceiro' ? (
            <Field label="CNPJ" htmlFor="cnpj">
              <Input
                id="cnpj"
                name="cnpj"
                value={form.cnpj}
                onChange={(event) => update('cnpj', event.target.value)}
                inputMode="numeric"
                className="h-10"
              />
            </Field>
          ) : null}
          <Field label="Telefone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              autoComplete="tel"
              className="h-10"
            />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              autoComplete="email"
              className="h-10"
            />
          </Field>
        </div>
        {audience === 'incorporador' ? (
          <Field label="Solução de interesse" htmlFor="product">
            <Select
              value={form.product}
              onValueChange={(value) => update('product', value)}
            >
              <SelectTrigger id="product" className="h-10 w-full">
                <SelectValue placeholder="Selecione, se já souber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a-definir">Ainda não sei</SelectItem>
                {FUNDING_PRODUCTS.map((product) => (
                  <SelectItem key={product.name} value={product.name}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <Field
          label={
            audience === 'parceiro'
              ? 'Como você origina e que tipo de projeto traz?'
              : 'Conte sobre o projeto'
          }
          htmlFor="message"
        >
          <Textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            rows={5}
            placeholder={
              audience === 'parceiro'
                ? 'Praça de atuação, volume aproximado e relacionamento com incorporadores.'
                : 'Cidade do empreendimento, estágio da obra, valor aproximado e prazo.'
            }
          />
        </Field>
        <Button type="submit" size="lg" className="rounded-full px-5">
          {audience === 'parceiro' ? 'Quero originar com vocês' : 'Enviar projeto'}
        </Button>
      </form>
    </div>
  )
}

function AudienceTab({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'rounded-full px-4 py-2.5 text-sm tracking-wide transition-colors',
        selected
          ? 'bg-[#050505] text-white'
          : 'text-black/60 hover:text-black',
      )}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
