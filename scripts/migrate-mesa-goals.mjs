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
      if (!process.env[key]) {
        process.env[key] = value
      }
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
const schemaPath = resolve(process.cwd(), 'scripts/schema_neon.sql')
const schema = readFileSync(schemaPath, 'utf8')

const statements = schema
  .split(/;\s*\n/)
  .map((part) => part.trim())
  .filter((part) => part.length > 0 && !part.startsWith('--'))

let ok = 0
for (const statement of statements) {
  await sql.query(statement)
  ok += 1
}

console.log(`Migration OK: ${ok} statements applied.`)
