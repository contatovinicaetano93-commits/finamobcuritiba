import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { partnerById, type AdminBoard, type PartnerId } from '@/data/admin'
import {
  crmPullMessage,
  loadCrmApiConfig,
  pullCrmBoard,
  saveCrmApiConfig,
  type CrmApiConfig,
} from '@/lib/crm-sync'

const SAMPLE = `{
  "version": 1,
  "accounts": [
    {
      "id": "acc-1",
      "list": "incorporadora",
      "name": "Nome da empresa",
      "city": "Curitiba",
      "uf": "PR",
      "owner": "vini",
      "status": "novo",
      "nextAction": "Primeira abordagem",
      "nextActionAt": "2026-10-03",
      "lastContactAt": "",
      "notes": "",
      "createdAt": "2026-10-02T12:00:00.000Z",
      "updatedAt": "2026-10-02T12:00:00.000Z",
      "updatedBy": "vini"
    }
  ]
}`

type AdminIntegracaoProps = {
  me: PartnerId
  onApply: (board: AdminBoard, count: number) => void
}

export function AdminIntegracao({ me, onApply }: AdminIntegracaoProps) {
  const [config, setConfig] = useState<CrmApiConfig>(() => loadCrmApiConfig())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const connected = Boolean(config.url.trim())

  function persistConfig(next: CrmApiConfig) {
    setConfig(next)
    saveCrmApiConfig(next)
  }

  async function handlePull() {
    setBusy(true)
    setError('')
    setMessage('')
    saveCrmApiConfig(config)
    const result = await pullCrmBoard(config)
    setBusy(false)
    if (!result.ok) {
      setError(crmPullMessage(result))
      return
    }
    onApply(result.board, result.count)
    setMessage(
      result.count === 0
        ? 'Conexão ok. A API devolveu o formato certo, ainda sem contas.'
        : `Entraram ${result.count} contas na mesa.`,
    )
  }

  return (
    <div className="space-y-5">
      <section className="admin-welcome px-5 py-6 sm:px-7">
        <p className="text-[10px] tracking-[0.2em] text-[#c4b49a] uppercase">
          {connected ? 'Porta pronta' : 'Aguardando chave'}
        </p>
        <h2 className="font-heading mt-2 text-3xl tracking-tight">
          {connected
            ? 'Quando a casa ligar, a mesa puxa'
            : 'A API entra por aqui — não por invasão'}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Peçam URL, token e o JSON no formato da mesa. Sem isso, o caminho que
          funciona hoje é o arquivo: exportar / importar no topo. A chave fica
          com {partnerById(me).name} e os outros dois — não é atalho para o
          sistema de outro.
        </p>
      </section>

      <section className="admin-surface rounded-2xl p-5 sm:p-6">
        <h3 className="font-medium">O que pedir</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-black/70">
          <li>URL https do endpoint da lista (contrato escrito, não chute).</li>
          <li>Token de leitura no nome da praça.</li>
          <li>Liberação de CORS para este site, se a chamada for no navegador.</li>
          <li>JSON no formato abaixo — ou um arquivo pronto para importar.</li>
        </ol>
      </section>

      <section className="admin-surface rounded-2xl p-5 sm:p-6">
        <h3 className="font-medium">Conexão</h3>
        <p className="mt-1 text-sm text-black/55">
          Salva neste navegador. Também aceita{' '}
          <code className="text-xs">VITE_CRM_API_URL</code> e{' '}
          <code className="text-xs">VITE_CRM_API_TOKEN</code>.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            persistConfig(config)
            setMessage('Conexão salva neste navegador.')
            setError('')
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="crm-api-url">URL da API</Label>
            <Input
              id="crm-api-url"
              value={config.url}
              onChange={(event) =>
                setConfig({ ...config, url: event.target.value })
              }
              placeholder="https://…/contas"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crm-api-token">Token</Label>
            <Input
              id="crm-api-token"
              type="password"
              value={config.token}
              onChange={(event) =>
                setConfig({ ...config, token: event.target.value })
              }
              placeholder="Bearer que a casa emitir"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="outline">
              Salvar conexão
            </Button>
            <Button type="button" onClick={() => void handlePull()} disabled={busy}>
              {busy ? 'Puxando…' : 'Puxar agora'}
            </Button>
          </div>
        </form>
        {error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 text-sm text-[#21553a]" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section className="admin-surface rounded-2xl p-5 sm:p-6">
        <h3 className="font-medium">Formato que a mesa aceita</h3>
        <p className="mt-1 text-sm text-black/55">
          Array de contas ou o quadro completo da mesa (
          <code className="text-xs">version: 1</code>). Dono:{' '}
          <code className="text-xs">vini</code>, <code className="text-xs">rafa</code>
          , <code className="text-xs">tadeu</code> ou nulo.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-[#050505] p-4 text-[11px] leading-relaxed text-[#f3efe6]">
          {SAMPLE}
        </pre>
      </section>
    </div>
  )
}
