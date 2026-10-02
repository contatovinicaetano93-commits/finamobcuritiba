/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PASSWORD?: string
  readonly VITE_CRM_API_URL?: string
  readonly VITE_CRM_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
