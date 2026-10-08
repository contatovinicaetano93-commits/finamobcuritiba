import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { handleMesaApi } from './server/crm.ts'

const DIRECTCON_PDF = '/DirectCon-RE-Portfolio-de-Investimentos.pdf'
const DIRECTCON_FILENAME =
  'DirectCon_RE_Apresentacao_do_portfolio_de_investimentos.pdf'
const SHOWCASE_PDF = '/Finamob-Curitiba-Mostruario.pdf'
const SHOWCASE_FILENAME = 'Finamob_Curitiba_Mostruario.pdf'

function pdfAttachment(): Plugin {
  const attach = (
    req: { url?: string },
    res: { setHeader: (name: string, value: string) => void },
    next: () => void,
  ) => {
    const pathName = req.url?.split('?')[0]
    if (pathName === DIRECTCON_PDF) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${DIRECTCON_FILENAME}"`,
      )
    }
    if (pathName === SHOWCASE_PDF) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${SHOWCASE_FILENAME}"`,
      )
    }
    next()
  }

  return {
    name: 'pdf-attachment',
    configureServer(server) {
      server.middlewares.use(attach)
    },
    configurePreviewServer(server) {
      server.middlewares.use(attach)
    },
  }
}

function mesaApi(env: Record<string, string>): Plugin {
  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL
  }
  if (env.VITE_ADMIN_PASSWORD) {
    process.env.VITE_ADMIN_PASSWORD = env.VITE_ADMIN_PASSWORD
  }
  if (env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD
  }

  const attach = (
    req: {
      method?: string
      url?: string
      headers: Record<string, string | string[] | undefined>
      on: (event: string, listener: (chunk?: Buffer) => void) => void
    },
    res: {
      statusCode: number
      setHeader: (name: string, value: string) => void
      end: (body: string) => void
    },
    next: () => void,
  ) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    if (!url.pathname.startsWith('/api/crm')) {
      next()
      return
    }
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      if (chunk) {
        chunks.push(chunk)
      }
    })
    req.on('end', () => {
      void (async () => {
        let body: unknown
        const raw = Buffer.concat(chunks).toString('utf8')
        if (raw) {
          try {
            body = JSON.parse(raw) as unknown
          } catch {
            body = undefined
          }
        }
        const header = req.headers['x-mesa-password']
        const password = Array.isArray(header) ? (header[0] ?? '') : (header ?? '')
        const result = await handleMesaApi({
          method: req.method || 'GET',
          pathname: url.pathname,
          search: url.search,
          body,
          password,
        })
        res.statusCode = result.status
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(result.body))
      })()
    })
  }

  return {
    name: 'mesa-api',
    configureServer(server) {
      server.middlewares.use(attach)
    },
    configurePreviewServer(server) {
      server.middlewares.use(attach)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  return {
    plugins: [react(), tailwindcss(), pdfAttachment(), mesaApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 43123,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 43123,
      strictPort: true,
    },
  }
})
