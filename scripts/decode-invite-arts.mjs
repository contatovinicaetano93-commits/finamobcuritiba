import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'convite')
const arts = ['inauguracao-tv.png']

function loadB64(baseName) {
  const b64Path = join(dir, `${baseName}.b64`)
  if (existsSync(b64Path)) {
    return readFileSync(b64Path, 'utf8').replace(/\s+/g, '')
  }
  const prefix = `${baseName}.b64.`
  const parts = readdirSync(dir)
    .filter((name) => name.startsWith(prefix))
    .sort()
  if (parts.length === 0) return null
  return parts.map((name) => readFileSync(join(dir, name), 'utf8').replace(/\s+/g, '')).join('')
}

for (const name of arts) {
  const pngPath = join(dir, name)
  const b64 = loadB64(name)
  if (!b64) {
    if (existsSync(pngPath)) {
      console.log(`skip ${name} (png present, no b64 source)`)
      continue
    }
    console.log(`skip ${name} (no b64 source; SVG fallback available)`)
    continue
  }
  writeFileSync(pngPath, Buffer.from(b64, 'base64'))
  console.log(`decoded ${name}`)
}
