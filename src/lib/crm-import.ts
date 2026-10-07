import JSZip from 'jszip'
import {
  accountContactDefaults,
  isPartnerId,
  newId,
  type Account,
  type AccountList,
  type AccountStatus,
  type AdminBoard,
  type PartnerId,
} from '@/data/admin'
import { coerceAccount, parseRemoteCrmPayload } from '@/lib/admin-store'

export type ImportMode = 'replace' | 'merge'

export type ImportOk = {
  ok: true
  mode: ImportMode
  accounts: Account[]
  board?: AdminBoard
  sheets: string[]
  skipped: number
}

export type ImportFail = {
  ok: false
  reason: 'empty' | 'unsupported' | 'unreadable'
}

export type ImportResult = ImportOk | ImportFail

const HEADER_ALIASES: Record<string, string> = {
  empresa: 'name',
  nome: 'name',
  razaosocial: 'name',
  incorporadora: 'name',
  construtora: 'name',
  conta: 'name',
  cliente: 'name',
  city: 'city',
  cidade: 'city',
  municipio: 'city',
  uf: 'uf',
  estado: 'uf',
  contato: 'contactName',
  nomedocontato: 'contactName',
  responsavelcontato: 'contactName',
  telefone: 'phone',
  celular: 'phone',
  whatsapp: 'phone',
  fone: 'phone',
  phone: 'phone',
  email: 'email',
  e_mail: 'email',
  mail: 'email',
  cnpj: 'document',
  documento: 'document',
  document: 'document',
  origem: 'source',
  source: 'source',
  fonte: 'source',
  id: 'externalId',
  codigo: 'externalId',
  externalid: 'externalId',
  radarid: 'externalId',
  lista: 'list',
  tipo: 'list',
  segmento: 'list',
  list: 'list',
  status: 'status',
  estagio: 'status',
  etapa: 'status',
  pipeline: 'status',
  dono: 'owner',
  owner: 'owner',
  responsavel: 'owner',
  socio: 'owner',
  proximo: 'nextAction',
  proximopasso: 'nextAction',
  nextaction: 'nextAction',
  quando: 'nextActionAt',
  data: 'nextActionAt',
  nextactionat: 'nextActionAt',
  ultimocontato: 'lastContactAt',
  lastcontactat: 'lastContactAt',
  notas: 'notes',
  notes: 'notes',
  observacoes: 'notes',
  historico: 'notes',
  obs: 'notes',
}

function foldKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function mapHeader(header: string): string | null {
  const folded = foldKey(header)
  return HEADER_ALIASES[folded] ?? null
}

function remapRow(raw: Record<string, unknown>): Record<string, string> {
  const row: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    const mapped = mapHeader(key) ?? key
    if (!row[mapped]) {
      row[mapped] = textCell(value)
    }
  }
  return row
}

export function normalizeCompanyName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(ltda|s\/a|sa|eireli|me|epp|incorporadora|construtora)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function textCell(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return String(value).trim()
}

function mapList(raw: string, name: string): AccountList {
  const blob = `${raw} ${name}`.toLowerCase()
  if (blob.includes('prospect') || blob.includes('prospec')) {
    return 'prospeccao'
  }
  if (blob.includes('construt')) {
    return 'construtora'
  }
  return 'incorporadora'
}

function mapStatus(raw: string): AccountStatus {
  const value = foldKey(raw)
  if (!value) {
    return 'novo'
  }
  if (
    value.includes('mandato') ||
    value.includes('fechado') ||
    value === 'won' ||
    value.includes('ganho')
  ) {
    return 'mandato'
  }
  if (
    value.includes('semfit') ||
    value.includes('perdido') ||
    value === 'lost' ||
    value.includes('descart')
  ) {
    return 'sem_fit'
  }
  if (value.includes('paus') || value.includes('hold') || value.includes('espera')) {
    return 'pausado'
  }
  if (value.includes('follow') || value.includes('retorno')) {
    return 'follow_up'
  }
  if (
    value.includes('convers') ||
    value.includes('reuniao') ||
    value.includes('ativo')
  ) {
    return 'em_conversa'
  }
  if (value.includes('abord') || value.includes('tocar')) {
    return 'abordar'
  }
  return 'novo'
}

function mapOwner(raw: string): PartnerId | null {
  const value = foldKey(raw)
  if (!value) {
    return null
  }
  if (value.includes('vini')) {
    return 'vini'
  }
  if (value.includes('rafa')) {
    return 'rafa'
  }
  if (value.includes('tadeu')) {
    return 'tadeu'
  }
  return isPartnerId(value) ? value : null
}

function isoDate(raw: string): string {
  const value = raw.trim()
  if (!value) {
    return ''
  }
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`
  }
  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (br) {
    const year = br[3].length === 2 ? `20${br[3]}` : br[3]
    return `${year}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`
  }
  const serial = Number(value)
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30))
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(serial))
    return epoch.toISOString().slice(0, 10)
  }
  return ''
}

export function rowsToAccounts(
  rows: Record<string, string>[],
  sourceLabel: string,
  by: PartnerId,
): Account[] {
  const now = new Date().toISOString()
  const accounts: Account[] = []
  for (const row of rows) {
    const name = textCell(row.name) || textCell(row.col0)
    if (name.length < 2) {
      continue
    }
    const list = mapList(row.list ?? '', name)
    accounts.push({
      ...accountContactDefaults(),
      id: newId(),
      list,
      name,
      city: textCell(row.city),
      uf: textCell(row.uf).toUpperCase().slice(0, 2),
      contactName: textCell(row.contactName),
      phone: textCell(row.phone),
      email: textCell(row.email),
      document: textCell(row.document),
      source: textCell(row.source) || sourceLabel,
      externalId: textCell(row.externalId),
      owner: mapOwner(row.owner ?? ''),
      status: mapStatus(row.status ?? ''),
      nextAction: textCell(row.nextAction) || 'Primeira abordagem',
      nextActionAt: isoDate(row.nextActionAt ?? ''),
      lastContactAt: isoDate(row.lastContactAt ?? ''),
      notes: textCell(row.notes),
      createdAt: now,
      updatedAt: now,
      updatedBy: by,
    })
  }
  return accounts
}

function parseCsv(text: string): Record<string, string>[] {
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = cleaned.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    return []
  }
  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
  const table = lines.map((line) => splitCsvLine(line, delimiter))
  const headers = table[0].map((header, index) => mapHeader(header) ?? `col${index}`)
  return table.slice(1).map((cells) => {
    const row: Record<string, string> = {}
    headers.forEach((key, index) => {
      const cell = cells[index] ?? ''
      if (!row[key]) {
        row[key] = cell
      }
    })
    return row
  })
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current.trim())
  return cells
}

function xmlText(node: Element | null): string {
  return node?.textContent?.trim() ?? ''
}

async function xlsxSheets(buffer: ArrayBuffer): Promise<{ name: string; rows: Record<string, string>[] }[]> {
  const zip = await JSZip.loadAsync(buffer)
  const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
  if (!workbookXml) {
    return []
  }
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
  const stringsXml = await zip.file('xl/sharedStrings.xml')?.async('string')
  const strings = parseSharedStrings(stringsXml ?? '')
  const sheetFiles = parseWorkbookSheets(workbookXml, relsXml ?? '')
  const sheets: { name: string; rows: Record<string, string>[] }[] = []
  for (const sheet of sheetFiles) {
    const xml = await zip.file(`xl/${sheet.path}`)?.async('string')
    if (!xml) {
      continue
    }
    const matrix = parseSheetMatrix(xml, strings)
    const rows = matrixToObjects(matrix)
    if (rows.length > 0) {
      sheets.push({ name: sheet.name, rows })
    }
  }
  return sheets
}

function parseSharedStrings(xml: string): string[] {
  if (!xml) {
    return []
  }
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return [...doc.getElementsByTagName('si')].map((item) => {
    const texts = [...item.getElementsByTagName('t')].map((node) => xmlText(node))
    return texts.join('')
  })
}

function parseWorkbookSheets(
  workbookXml: string,
  relsXml: string,
): { name: string; path: string }[] {
  const workbook = new DOMParser().parseFromString(workbookXml, 'application/xml')
  const rels = new DOMParser().parseFromString(relsXml, 'application/xml')
  const relMap = new Map<string, string>()
  for (const rel of rels.getElementsByTagName('Relationship')) {
    relMap.set(rel.getAttribute('Id') ?? '', rel.getAttribute('Target') ?? '')
  }
  const sheets: { name: string; path: string }[] = []
  for (const sheet of workbook.getElementsByTagName('sheet')) {
    const name = sheet.getAttribute('name') ?? 'Planilha'
    const relId =
      sheet.getAttribute('r:id') ??
      sheet.getAttribute('id') ??
      sheet.getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'id',
      ) ??
      ''
    const target = relMap.get(relId) ?? ''
    const path = target.replace(/^\//, '').replace(/^xl\//, '')
    if (path) {
      sheets.push({ name, path })
    }
  }
  return sheets
}

function columnIndex(ref: string): number {
  const letters = ref.replace(/[0-9]/g, '')
  let index = 0
  for (const char of letters) {
    index = index * 26 + (char.toUpperCase().charCodeAt(0) - 64)
  }
  return Math.max(0, index - 1)
}

function parseSheetMatrix(xml: string, strings: string[]): string[][] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const rows: string[][] = []
  for (const row of doc.getElementsByTagName('row')) {
    const cells = [...row.getElementsByTagName('c')]
    const line: string[] = []
    for (const cell of cells) {
      const ref = cell.getAttribute('r') ?? ''
      const type = cell.getAttribute('t') ?? ''
      const position = columnIndex(ref)
      let value = ''
      if (type === 's') {
        const index = Number(xmlText(cell.getElementsByTagName('v')[0] ?? null))
        value = strings[index] ?? ''
      } else if (type === 'inlineStr') {
        value = xmlText(cell.getElementsByTagName('t')[0] ?? null)
      } else {
        value = xmlText(cell.getElementsByTagName('v')[0] ?? null)
      }
      line[position] = value
    }
    rows.push(line.map((cell) => cell ?? ''))
  }
  return rows
}

function matrixToObjects(matrix: string[][]): Record<string, string>[] {
  if (matrix.length < 2) {
    return []
  }
  const headers = matrix[0].map((header, index) => mapHeader(header) ?? `col${index}`)
  return matrix.slice(1).map((cells) => {
    const row: Record<string, string> = {}
    headers.forEach((key, index) => {
      const cell = (cells[index] ?? '').trim()
      if (!row[key]) {
        row[key] = cell
      }
    })
    return row
  })
}

function looksLikeBoardJson(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false
  }
  const board = data as { version?: unknown; accounts?: unknown }
  return board.version === 1 && Array.isArray(board.accounts)
}

function accountsFromUnknownJson(data: unknown, source: string, by: PartnerId): Account[] {
  if (Array.isArray(data)) {
    const coerced = data
      .map(coerceAccount)
      .filter((item): item is Account => item !== null)
    if (coerced.length > 0) {
      return coerced
    }
    return rowsToAccounts(
      data
        .filter((item) => item && typeof item === 'object')
        .map((item) => remapRow(item as Record<string, unknown>)),
      source,
      by,
    )
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['accounts', 'contas', 'empresas', 'data', 'items', 'rows']) {
      const value = record[key]
      if (Array.isArray(value)) {
        return accountsFromUnknownJson(value, source, by)
      }
    }
  }
  return []
}

async function ingestBuffer(
  buffer: ArrayBuffer,
  filename: string,
  by: PartnerId,
): Promise<ImportResult> {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) {
    const text = new TextDecoder().decode(buffer)
    try {
      const data: unknown = JSON.parse(text)
      if (looksLikeBoardJson(data)) {
        const board = parseRemoteCrmPayload(data)
        if (!board) {
          return { ok: false, reason: 'unreadable' }
        }
        return {
          ok: true,
          mode: 'replace',
          accounts: board.accounts,
          board,
          sheets: ['mesa'],
          skipped: 0,
        }
      }
      const accounts = accountsFromUnknownJson(data, filename, by)
      if (accounts.length === 0) {
        return { ok: false, reason: 'empty' }
      }
      return {
        ok: true,
        mode: 'merge',
        accounts,
        sheets: [filename],
        skipped: 0,
      }
    } catch {
      return { ok: false, reason: 'unreadable' }
    }
  }

  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    const rows = parseCsv(new TextDecoder().decode(buffer))
    const accounts = rowsToAccounts(rows, filename, by)
    if (accounts.length === 0) {
      return { ok: false, reason: 'empty' }
    }
    return {
      ok: true,
      mode: 'merge',
      accounts,
      sheets: [filename],
      skipped: rows.length - accounts.length,
    }
  }

  if (lower.endsWith('.xlsx') || lower.endsWith('.xlsm')) {
    try {
      const sheets = await xlsxSheets(buffer)
      const accounts: Account[] = []
      const names: string[] = []
      let skipped = 0
      for (const sheet of sheets) {
        const mapped = rowsToAccounts(sheet.rows, `Radar · ${sheet.name}`, by)
        accounts.push(...mapped)
        names.push(sheet.name)
        skipped += sheet.rows.length - mapped.length
      }
      if (accounts.length === 0) {
        return { ok: false, reason: 'empty' }
      }
      return { ok: true, mode: 'merge', accounts, sheets: names, skipped }
    } catch {
      return { ok: false, reason: 'unreadable' }
    }
  }

  if (lower.endsWith('.zip')) {
    try {
      const zip = await JSZip.loadAsync(buffer)
      const collected: Account[] = []
      const names: string[] = []
      let skipped = 0
      const files = Object.values(zip.files).filter(
        (file) =>
          !file.dir &&
          !file.name.startsWith('__MACOSX') &&
          !file.name.split('/').pop()?.startsWith('.'),
      )
      for (const file of files) {
        const innerName = file.name.split('/').pop() ?? file.name
        if (!/\.(json|csv|txt|xlsx|xlsm)$/i.test(innerName)) {
          continue
        }
        const inner = await file.async('arraybuffer')
        const result = await ingestBuffer(inner, innerName, by)
        if (!result.ok) {
          continue
        }
        collected.push(...result.accounts)
        names.push(...result.sheets)
        skipped += result.skipped
      }
      if (collected.length === 0) {
        return { ok: false, reason: 'empty' }
      }
      return { ok: true, mode: 'merge', accounts: collected, sheets: names, skipped }
    } catch {
      return { ok: false, reason: 'unreadable' }
    }
  }

  return { ok: false, reason: 'unsupported' }
}

export async function ingestCrmFile(
  file: File,
  by: PartnerId,
): Promise<ImportResult> {
  const buffer = await file.arrayBuffer()
  return ingestBuffer(buffer, file.name, by)
}

export function importErrorMessage(result: ImportFail): string {
  switch (result.reason) {
    case 'empty':
      return 'O arquivo abriu, mas não achei empresas. Confira se a primeira linha é o cabeçalho (Empresa, Cidade, Status…).'
    case 'unsupported':
      return 'Use JSON da mesa, CSV, Excel (.xlsx) ou ZIP com esses arquivos.'
    case 'unreadable':
      return 'Não consegui ler o arquivo. Exporte de novo em xlsx, csv ou json.'
    default: {
      const exhaustive: never = result.reason
      return exhaustive
    }
  }
}
