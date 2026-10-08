import { handleMesaApi } from '../lib/crm.js'

type VercelRequest = {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
}

function header(req: VercelRequest, name: string): string {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return value ?? ''
}

export default async function mesaHandler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const url = new URL(req.url || '/api/crm', 'http://127.0.0.1')
    const result = await handleMesaApi({
      method: req.method || 'GET',
      pathname: url.pathname,
      search: url.search,
      body: req.body,
      password: header(req, 'x-mesa-password'),
    })
    res.status(result.status).json(result.body)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Falha interna da mesa.'
    res.status(500).json({ error: message })
  }
}
