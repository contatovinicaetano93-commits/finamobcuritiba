import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

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

export default defineConfig({
  plugins: [react(), tailwindcss(), pdfAttachment()],
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
})
