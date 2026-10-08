import { useEffect, useState } from 'react'
import {
  fetchMesaInsights,
  regenerateMesaInsights,
  type MesaInsights,
} from '@/lib/mesa-api'
import { Button } from '@/components/ui/button'

type AiInsightsStripProps = {
  reloadToken: number
}

export function AiInsightsStrip({ reloadToken }: AiInsightsStripProps) {
  const [insights, setInsights] = useState<MesaInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      const result = await fetchMesaInsights('praca')
      if (cancelled) return
      if (!result.ok) {
        setError(result.error)
        setInsights(null)
        setLoading(false)
        return
      }
      setError('')
      setInsights(result.data.insights)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  async function refresh() {
    setBusy(true)
    setError('')
    const result = await regenerateMesaInsights('praca')
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setInsights(result.data.insights)
  }

  return (
    <section className="rounded-2xl border border-black/8 bg-[#f7f4ef] px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] text-black/45 uppercase">
            Insights IA · praça
          </p>
          <h3 className="font-heading mt-1 text-xl tracking-tight">
            {loading
              ? 'Lendo a base…'
              : insights?.content.headline || 'Sem insight ainda'}
          </h3>
          {!loading && !insights ? (
            <p className="mt-1 text-sm text-black/50">
              Atualize para gerar um insight com a fila e o funil da praça.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || loading}
          onClick={() => void refresh()}
        >
          {busy ? 'Atualizando…' : 'Atualizar'}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {insights ? (
        <ul className="mt-3 space-y-2 text-sm text-black/75">
          {insights.content.bullets.map((item) => (
            <li key={item.text} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#21553a]" />
              <span>
                {item.text}
                {item.action ? (
                  <span className="mt-0.5 block text-xs text-[#21553a]">
                    → {item.action}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {insights ? (
        <p className="mt-3 text-[11px] text-black/40">
          {insights.cached ? 'Cache Neon' : 'Sem persistência'} · {insights.model}
        </p>
      ) : null}
    </section>
  )
}
