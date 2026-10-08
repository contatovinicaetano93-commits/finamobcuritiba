import { useEffect, useState } from 'react'
import {
  fetchMesaBriefing,
  regenerateMesaBriefing,
  type MesaBriefing,
} from '@/lib/mesa-api'
import { Button } from '@/components/ui/button'
import { formatStamp } from '@/data/admin'

type AiBriefingPanelProps = {
  companyId: string
}

export function AiBriefingPanel({ companyId }: AiBriefingPanelProps) {
  const [briefing, setBriefing] = useState<MesaBriefing | null>(null)
  const [state, setState] = useState<'loading' | 'empty' | 'ready' | 'error'>(
    'loading',
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setState('loading')
    setError('')
    void (async () => {
      const result = await fetchMesaBriefing(companyId)
      if (cancelled) return
      if (!result.ok) {
        setBriefing(null)
        setError(result.error)
        setState('error')
        return
      }
      setBriefing(result.data.briefing)
      setState(result.data.briefing ? 'ready' : 'empty')
    })()
    return () => {
      cancelled = true
    }
  }, [companyId])

  async function refresh() {
    setBusy(true)
    setError('')
    const result = await regenerateMesaBriefing(companyId)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      setState((current) => (briefing ? current : 'error'))
      return
    }
    setBriefing(result.data.briefing)
    setState('ready')
  }

  return (
    <div className="space-y-2 rounded-xl border border-black/8 bg-[#f7f4ef] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] text-black/45 uppercase">
            Briefing IA
          </p>
          <p className="text-xs text-black/45">
            Cache Neon · sem inventar telefone, e-mail ou sede
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || state === 'loading'}
          onClick={() => void refresh()}
        >
          {busy ? 'Gerando…' : briefing ? 'Atualizar' : 'Gerar'}
        </Button>
      </div>
      {state === 'loading' ? (
        <p className="text-sm text-black/50">Carregando briefing…</p>
      ) : null}
      {state === 'empty' ? (
        <p className="text-sm text-black/50">
          Ainda sem briefing. Gere a partir dos dados da ficha.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {briefing ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-black/85">{briefing.content.headline}</p>
          <p className="leading-snug text-black/70">{briefing.content.summary}</p>
          {briefing.content.bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-black/75">
              {briefing.content.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {briefing.content.nextSteps.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                Próximos passos
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-black/75">
                {briefing.content.nextSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {briefing.content.gaps.length > 0 ? (
            <p className="text-xs text-[#7a4a16]">
              Lacunas: {briefing.content.gaps.join(' · ')}
            </p>
          ) : null}
          <p className="text-[11px] text-black/40">
            {briefing.cached ? 'Cache Neon' : 'Sem persistência'} · {briefing.model}
            {briefing.updatedAt ? ` · ${formatStamp(briefing.updatedAt)}` : ''}
          </p>
        </div>
      ) : null}
    </div>
  )
}
