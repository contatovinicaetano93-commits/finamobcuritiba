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
    <section className="admin-surface rounded-xl px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#7a6648] uppercase">
            Insights IA · praça
          </p>
          <h3 className="font-heading mt-1 text-lg tracking-tight text-[#12110f] sm:text-xl">
            {loading
              ? 'Lendo a base…'
              : insights?.content.headline || 'Sem insight ainda'}
          </h3>
          {!loading && !insights ? (
            <p className="mt-1 text-sm text-[#3f3b34]">
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
          className="border-[rgb(18_17_15/0.2)]"
        >
          {busy ? 'Atualizando…' : 'Atualizar'}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-medium text-[#6b241c]" role="alert">
          {error}
        </p>
      ) : null}
      {insights ? (
        <ul className="mt-3 space-y-2 text-sm text-[#12110f]">
          {insights.content.bullets.map((item) => (
            <li key={item.text} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#174530]" />
              <span>
                {item.text}
                {item.action ? (
                  <span className="mt-0.5 block text-xs font-medium text-[#174530]">
                    → {item.action}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {insights ? (
        <p className="mt-3 text-[11px] font-medium text-[#5c574e]">
          {insights.cached ? 'Cache Neon' : 'Sem persistência'} · {insights.model}
        </p>
      ) : null}
    </section>
  )
}
