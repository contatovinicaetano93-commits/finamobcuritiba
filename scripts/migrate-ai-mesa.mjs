import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { neon } from '@neondatabase/serverless'

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // rely on process env
  }
}

loadEnv()
const url = process.env.DATABASE_URL?.trim()
if (!url) {
  console.error('DATABASE_URL ausente.')
  process.exit(1)
}

const sql = neon(url)
const statements = [
  `CREATE TABLE IF NOT EXISTS ai_briefings (
    company_id text PRIMARY KEY REFERENCES companies (id) ON DELETE CASCADE,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    model text NOT NULL DEFAULT 'heuristic',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ai_insights (
    id text PRIMARY KEY,
    scope text NOT NULL DEFAULT 'praca',
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    model text NOT NULL DEFAULT 'heuristic',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS ai_insights_scope_created_idx
    ON ai_insights (scope, created_at DESC)`,
]

let ok = 0
for (const statement of statements) {
  await sql.query(statement)
  ok += 1
}
console.log(`AI mesa migration OK: ${ok} statements.`)
