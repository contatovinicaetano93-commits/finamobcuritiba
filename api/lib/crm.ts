import process from 'node:process'
import { neon } from '@neondatabase/serverless'

export const MESA_SCOPES = ['praca', 'pr', 'sul', 'brasil'] as const
export type MesaScope = (typeof MESA_SCOPES)[number]

export const MESA_REGIONS = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul',
] as const
export type MesaRegion = (typeof MESA_REGIONS)[number]

type Sql = ReturnType<typeof neon>

export type MesaRequest = {
  method: string
  pathname: string
  search: string
  body: unknown
  password: string
}

export type MesaResponse = {
  status: number
  body: unknown
}

type CompanyRow = {
  id: string
  name: string
  list: string
  city: string
  uf: string
  region: string
  in_curitiba_radius: boolean
  dist_km: number | null
  contact_name: string
  phone: string
  email: string
  document: string
  site: string
  porte: string
  atuacao: string
  source: string
  owner: string | null
  status: string
  next_action: string
  next_action_at: string | Date | null
  last_contact_at: string | Date | null
  notes: string
  emp_count: number
  created_at: string | Date
  updated_at: string | Date
  updated_by: string
}

type DevelopmentRow = {
  id: string
  name: string
  stage: string
  kind: string
  purpose: string
  city: string
  uf: string
  neighborhood: string
  units: number | null
  launch: string
  delivery: string
  mcmv: boolean | null
  link: string
}

type Filter = {
  scope: MesaScope
  region: string
  uf: string
  city: string
  list: string
  status: string
  owner: string
  q: string
}

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error('DATABASE_URL ausente.')
  }
  return url
}

function sqlClient(): Sql {
  return neon(databaseUrl())
}

function expectedPassword(): string {
  return (
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.VITE_ADMIN_PASSWORD?.trim() ||
    'cwb-socios'
  )
}

function asDate(value: string | Date | null | undefined): string {
  if (!value) {
    return ''
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  return String(value).slice(0, 10)
}

function asStamp(value: string | Date | null | undefined): string {
  if (!value) {
    return ''
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  return String(value)
}

function isScope(value: string): value is MesaScope {
  return (
    value === 'praca' ||
    value === 'pr' ||
    value === 'sul' ||
    value === 'brasil'
  )
}

function isList(value: string): boolean {
  return (
    value === 'incorporadora' ||
    value === 'construtora' ||
    value === 'prospeccao'
  )
}

function isStatus(value: string): boolean {
  return (
    value === 'novo' ||
    value === 'abordar' ||
    value === 'em_conversa' ||
    value === 'follow_up' ||
    value === 'mandato' ||
    value === 'pausado' ||
    value === 'sem_fit'
  )
}

function isOwner(value: string): boolean {
  return value === 'vini' || value === 'rafa' || value === 'tadeu'
}

function companyJson(row: CompanyRow, developments: DevelopmentRow[] = []) {
  return {
    id: row.id,
    list: row.list,
    name: row.name,
    city: row.city,
    uf: row.uf,
    region: row.region,
    inCuritibaRadius: Boolean(row.in_curitiba_radius),
    empCount: Number(row.emp_count) || 0,
    distKm: row.dist_km,
    site: row.site,
    porte: row.porte,
    atuacao: row.atuacao,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    document: row.document,
    source: row.source,
    externalId: row.id,
    owner: row.owner && isOwner(row.owner) ? row.owner : null,
    status: isStatus(row.status) ? row.status : 'novo',
    nextAction: row.next_action,
    nextActionAt: asDate(row.next_action_at),
    lastContactAt: asDate(row.last_contact_at),
    notes: row.notes,
    createdAt: asStamp(row.created_at),
    updatedAt: asStamp(row.updated_at),
    updatedBy: isOwner(row.updated_by) ? row.updated_by : 'vini',
    developments: developments.map((item) => ({
      id: item.id,
      name: item.name,
      stage: item.stage,
      kind: item.kind,
      purpose: item.purpose,
      city: item.city,
      uf: item.uf,
      neighborhood: item.neighborhood,
      units: item.units,
      launch: item.launch,
      delivery: item.delivery,
      mcmv: item.mcmv,
      link: item.link,
    })),
  }
}

function readFilter(params: URLSearchParams): Filter {
  const scopeRaw = params.get('scope') || 'praca'
  return {
    scope: isScope(scopeRaw) ? scopeRaw : 'praca',
    region: (params.get('region') || '').trim(),
    uf: (params.get('uf') || '').trim().toUpperCase(),
    city: (params.get('city') || '').trim(),
    list: (params.get('list') || '').trim(),
    status: (params.get('status') || '').trim(),
    owner: (params.get('owner') || '').trim(),
    q: (params.get('q') || '').trim(),
  }
}

function whereClause(filter: Filter): { sql: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []
  const push = (fragment: string, value: unknown) => {
    params.push(value)
    clauses.push(fragment.replace('?', `$${params.length}`))
  }

  switch (filter.scope) {
    case 'praca':
      clauses.push('in_curitiba_radius = true')
      break
    case 'pr':
      clauses.push("uf = 'PR'")
      break
    case 'sul':
      clauses.push("region = 'Sul'")
      break
    case 'brasil':
      break
    default: {
      const exhaustive: never = filter.scope
      return exhaustive
    }
  }

  if (filter.region) {
    push('region = ?', filter.region)
  }
  if (filter.uf) {
    push('uf = ?', filter.uf)
  }
  if (filter.city) {
    push('city ILIKE ?', filter.city)
  }
  if (filter.list && isList(filter.list)) {
    push('list = ?', filter.list)
  }
  if (filter.status && isStatus(filter.status)) {
    push('status = ?', filter.status)
  }
  if (filter.owner === 'livre') {
    clauses.push('owner IS NULL')
  } else if (filter.owner && isOwner(filter.owner)) {
    push('owner = ?', filter.owner)
  }
  if (filter.q) {
    params.push(`%${filter.q}%`)
    const idx = `$${params.length}`
    clauses.push(
      `(name ILIKE ${idx} OR city ILIKE ${idx} OR contact_name ILIKE ${idx} OR phone ILIKE ${idx} OR email ILIKE ${idx} OR document ILIKE ${idx} OR notes ILIKE ${idx})`,
    )
  }

  return {
    sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  }
}

function parsePath(pathname: string): string[] {
  return pathname
    .replace(/^\/api\/crm\/?/, '')
    .split('/')
    .map((part) => decodeURIComponent(part))
    .filter(Boolean)
}

function readBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {}
  }
  return body as Record<string, unknown>
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function listCompanies(sql: Sql, params: URLSearchParams) {
  const filter = readFilter(params)
  const page = Math.max(0, Number(params.get('page') || 0) || 0)
  const limit = Math.min(200, Math.max(1, Number(params.get('limit') || 60) || 60))
  const offset = page * limit
  const where = whereClause(filter)
  const countRows = (await sql.query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE list = 'incorporadora')::int AS incorporadora,
            count(*) FILTER (WHERE list = 'construtora')::int AS construtora,
            count(*) FILTER (WHERE list = 'prospeccao')::int AS prospeccao
     FROM companies ${where.sql}`,
    where.params,
  )) as Array<{
    total: number
    incorporadora: number
    construtora: number
    prospeccao: number
  }>
  const counts = countRows[0] ?? {
    total: 0,
    incorporadora: 0,
    construtora: 0,
    prospeccao: 0,
  }
  const rows = (await sql.query(
    `SELECT * FROM companies ${where.sql}
     ORDER BY in_curitiba_radius DESC, name ASC
     LIMIT $${where.params.length + 1} OFFSET $${where.params.length + 2}`,
    [...where.params, limit, offset],
  )) as CompanyRow[]
  return {
    scope: filter.scope,
    total: counts.total,
    page,
    limit,
    counts: {
      incorporadora: counts.incorporadora,
      construtora: counts.construtora,
      prospeccao: counts.prospeccao,
    },
    accounts: rows.map((row) => companyJson(row)),
  }
}

async function getCompany(sql: Sql, id: string) {
  const rows = (await sql.query('SELECT * FROM companies WHERE id = $1', [
    id,
  ])) as CompanyRow[]
  const row = rows[0]
  if (!row) {
    return null
  }
  const developments = (await sql.query(
    `SELECT id, name, stage, kind, purpose, city, uf, neighborhood, units, launch, delivery, mcmv, link
     FROM developments WHERE company_id = $1
     ORDER BY name ASC`,
    [id],
  )) as DevelopmentRow[]
  return companyJson(row, developments)
}

async function summary(sql: Sql, params: URLSearchParams) {
  const filter = readFilter(params)
  const where = whereClause(filter)
  const rows = (await sql.query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE in_curitiba_radius)::int AS praca,
       count(*) FILTER (WHERE uf = 'PR')::int AS parana,
       count(*) FILTER (WHERE region = 'Sul')::int AS sul,
       count(*) FILTER (WHERE list = 'incorporadora')::int AS incorporadora,
       count(*) FILTER (WHERE list = 'construtora')::int AS construtora,
       count(*) FILTER (WHERE list = 'prospeccao')::int AS prospeccao,
       count(*) FILTER (WHERE status = 'novo')::int AS novo,
       count(*) FILTER (WHERE status = 'abordar')::int AS abordar,
       count(*) FILTER (WHERE status = 'em_conversa')::int AS em_conversa,
       count(*) FILTER (WHERE status = 'follow_up')::int AS follow_up,
       count(*) FILTER (WHERE status = 'mandato')::int AS mandato,
       count(*) FILTER (WHERE owner = 'vini')::int AS vini,
       count(*) FILTER (WHERE owner = 'rafa')::int AS rafa,
       count(*) FILTER (WHERE owner = 'tadeu')::int AS tadeu,
       count(*) FILTER (WHERE owner IS NULL)::int AS livre
     FROM companies ${where.sql}`,
    where.params,
  )) as Array<Record<string, number>>
  return rows[0] ?? {}
}

async function dueList(sql: Sql, params: URLSearchParams) {
  const filter = readFilter(params)
  const where = whereClause(filter)
  const extra = where.sql
    ? `${where.sql} AND next_action_at IS NOT NULL AND next_action_at <= CURRENT_DATE AND status NOT IN ('mandato', 'pausado', 'sem_fit')`
    : `WHERE next_action_at IS NOT NULL AND next_action_at <= CURRENT_DATE AND status NOT IN ('mandato', 'pausado', 'sem_fit')`
  const rows = (await sql.query(
    `SELECT * FROM companies ${extra} ORDER BY next_action_at ASC, name ASC LIMIT 80`,
    where.params,
  )) as CompanyRow[]
  return { accounts: rows.map((row) => companyJson(row)) }
}

async function facets(sql: Sql, params: URLSearchParams) {
  const base = readFilter(params)
  const scoped: Filter = { ...base, uf: '', city: '' }
  const where = whereClause(scoped)
  const ufs = (await sql.query(
    `SELECT uf, count(*)::int AS total
     FROM companies ${where.sql}
     GROUP BY uf
     HAVING uf <> ''
     ORDER BY total DESC, uf ASC`,
    where.params,
  )) as Array<{ uf: string; total: number }>
  const cityWhere = whereClause({ ...scoped, uf: base.uf })
  const cities = (await sql.query(
    `SELECT city, uf, count(*)::int AS total
     FROM companies ${cityWhere.sql}
     GROUP BY city, uf
     HAVING city <> ''
     ORDER BY total DESC, city ASC
     LIMIT 80`,
    cityWhere.params,
  )) as Array<{ city: string; uf: string; total: number }>
  return { ufs, cities, regions: MESA_REGIONS }
}

async function createCompany(sql: Sql, body: Record<string, unknown>, actor: string) {
  const name = asString(body.name).trim()
  if (name.length < 2) {
    return { status: 400, body: { error: 'Nome da empresa é obrigatório.' } }
  }
  const id = asString(body.id).trim() || crypto.randomUUID()
  const list = asString(body.list)
  const owner = asString(body.owner)
  const uf = asString(body.uf).trim().toUpperCase()
  const region =
    asString(body.region).trim() ||
    (uf === 'PR' || uf === 'SC' || uf === 'RS' ? 'Sul' : '')
  await sql.query(
    `INSERT INTO companies (
       id, name, list, city, uf, region, in_curitiba_radius, contact_name, phone, email,
       document, source, owner, status, next_action, next_action_at, notes, updated_by
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
     )`,
    [
      id,
      name,
      isList(list) ? list : 'prospeccao',
      asString(body.city).trim(),
      uf,
      region,
      Boolean(body.inCuritibaRadius) || uf === 'PR',
      asString(body.contactName).trim(),
      asString(body.phone).trim(),
      asString(body.email).trim(),
      asString(body.document).trim(),
      asString(body.source).trim() || 'manual',
      isOwner(owner) ? owner : null,
      'novo',
      asString(body.nextAction).trim(),
      asString(body.nextActionAt).trim() || null,
      asString(body.notes).trim(),
      actor,
    ],
  )
  const created = await getCompany(sql, id)
  return { status: 201, body: { account: created } }
}

async function patchCompany(
  sql: Sql,
  id: string,
  body: Record<string, unknown>,
  actor: string,
  note: string,
) {
  const current = await getCompany(sql, id)
  if (!current) {
    return { status: 404, body: { error: 'Conta não encontrada.' } }
  }
  const ownerRaw = body.owner
  const owner =
    ownerRaw === null || ownerRaw === 'livre'
      ? null
      : typeof ownerRaw === 'string' && isOwner(ownerRaw)
        ? ownerRaw
        : current.owner
  const list = asString(body.list) || current.list
  const status = asString(body.status) || current.status
  const notes = note
    ? [asString(body.notes) || current.notes, note].filter(Boolean).join('\n')
    : asString(body.notes) || current.notes
  await sql.query(
    `UPDATE companies SET
       name = $2,
       list = $3,
       city = $4,
       uf = $5,
       contact_name = $6,
       phone = $7,
       email = $8,
       document = $9,
       owner = $10,
       status = $11,
       next_action = $12,
       next_action_at = $13,
       last_contact_at = $14,
       notes = $15,
       updated_at = now(),
       updated_by = $16
     WHERE id = $1`,
    [
      id,
      (asString(body.name) || current.name).trim(),
      isList(list) ? list : current.list,
      asString(body.city) || current.city,
      (asString(body.uf) || current.uf).toUpperCase(),
      asString(body.contactName) || current.contactName,
      asString(body.phone) || current.phone,
      asString(body.email) || current.email,
      asString(body.document) || current.document,
      owner,
      isStatus(status) ? status : current.status,
      asString(body.nextAction) || current.nextAction,
      asString(body.nextActionAt) || current.nextActionAt || null,
      asString(body.lastContactAt) || current.lastContactAt || null,
      notes,
      actor,
    ],
  )
  return { status: 200, body: { account: await getCompany(sql, id) } }
}

export async function handleMesaApi(request: MesaRequest): Promise<MesaResponse> {
  if (request.password !== expectedPassword()) {
    return { status: 401, body: { error: 'Senha da mesa não confere.' } }
  }

  let sql: Sql
  try {
    sql = sqlClient()
  } catch (error) {
    return {
      status: 503,
      body: {
        error: error instanceof Error ? error.message : 'Banco indisponível.',
      },
    }
  }

  const params = new URLSearchParams(request.search.replace(/^\?/, ''))
  const parts = parsePath(request.pathname)
  const method = request.method.toUpperCase()
  const actor = params.get('by') || asString(readBody(request.body).updatedBy) || 'vini'

  try {
    if (parts.length === 0 || (parts[0] === 'companies' && parts.length === 1)) {
      if (method === 'GET') {
        return { status: 200, body: await listCompanies(sql, params) }
      }
      if (method === 'POST') {
        return await createCompany(sql, readBody(request.body), actor)
      }
    }
    if (parts[0] === 'companies' && parts[1] && parts.length === 2) {
      if (method === 'GET') {
        const account = await getCompany(sql, parts[1])
        if (!account) {
          return { status: 404, body: { error: 'Conta não encontrada.' } }
        }
        return { status: 200, body: { account } }
      }
      if (method === 'PATCH') {
        const body = readBody(request.body)
        return await patchCompany(
          sql,
          parts[1],
          body,
          actor,
          asString(body.note).trim(),
        )
      }
      if (method === 'DELETE') {
        await sql.query('DELETE FROM companies WHERE id = $1', [parts[1]])
        return { status: 200, body: { ok: true } }
      }
    }
    if (parts[0] === 'summary' && method === 'GET') {
      return { status: 200, body: await summary(sql, params) }
    }
    if (parts[0] === 'due' && method === 'GET') {
      return { status: 200, body: await dueList(sql, params) }
    }
    if (parts[0] === 'facets' && method === 'GET') {
      return { status: 200, body: await facets(sql, params) }
    }
    return { status: 404, body: { error: 'Rota da mesa não encontrada.' } }
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : 'Falha na mesa.',
      },
    }
  }
}
