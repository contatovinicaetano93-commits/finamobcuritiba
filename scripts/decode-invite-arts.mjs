import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'convite')
const arts = ['inauguracao-tv.png']

for (const name of arts) {
  const b64Path = join(dir, `${name}.b64`)
  const pngPath = join(dir, name)
  if (!existsSync(b64Path)) {
    if (existsSync(pngPath)) continue
    throw new Error(`Missing invite art source: ${b64Path}`)
  }
  const b64 = readFileSync(b64Path, 'utf8').replace(/\s+/g, '')
  writeFileSync(pngPath, Buffer.from(b64, 'base64'))
  console.log(`decoded ${name}`)
}
