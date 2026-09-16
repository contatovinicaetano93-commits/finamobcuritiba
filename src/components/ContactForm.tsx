import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
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
import { PRODUCTS } from '@/data/products'
import { SITE } from '@/data/site'

type FormStatus = 'editing' | 'invalid' | 'success'

interface LeadForm {
  name: string
  company: string
  phone: string
  email: string
  product: string
  message: string
}

const EMPTY: LeadForm = {
  name: '',
  company: '',
  phone: '',
  email: '',
  product: '',
  message: '',
}

function isValid(form: LeadForm): boolean {
  const hasName = form.name.trim().length >= 3
  const hasContact = form.phone.trim().length >= 8 || form.email.includes('@')
  const hasMessage = form.message.trim().length >= 10
  return hasName && hasContact && hasMessage
}

function formatLead(form: LeadForm): string {
  return [
    `Lead — ${SITE.name}`,
    `Nome: ${form.name}`,
    `Empresa: ${form.company || '—'}`,
    `Telefone: ${form.phone || '—'}`,
    `E-mail: ${form.email || '—'}`,
    `Solução: ${form.product || 'A definir'}`,
    '',
    form.message,
  ].join('\n')
}

export function ContactForm() {
  const [form, setForm] = useState<LeadForm>(EMPTY)
  const [status, setStatus] = useState<FormStatus>('editing')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const summary = useMemo(() => formatLead(form), [form])

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (status === 'invalid') {
      setStatus('editing')
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid(form)) {
      setStatus('invalid')
      return
    }
    window.localStorage.setItem('finamob-curitiba-last-lead', summary)
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
              setForm(EMPTY)
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
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {status === 'invalid' ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          Preencha nome, uma forma de contato (telefone ou e-mail) e uma mensagem
          com pelo menos 10 caracteres.
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
      <Field label="Solução de interesse" htmlFor="product">
        <Select value={form.product} onValueChange={(value) => update('product', value)}>
          <SelectTrigger id="product" className="h-10 w-full">
            <SelectValue placeholder="Selecione, se já souber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a-definir">Ainda não sei</SelectItem>
            {PRODUCTS.map((product) => (
              <SelectItem key={product.name} value={product.name}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Conte sobre o projeto" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          rows={5}
          placeholder="Cidade do empreendimento, estágio da obra, valor aproximado e prazo."
        />
      </Field>
      <Button type="submit" size="lg" className="rounded-full px-5">
        Enviar mensagem
      </Button>
    </form>
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
