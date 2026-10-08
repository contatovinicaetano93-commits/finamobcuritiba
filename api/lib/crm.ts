import process from 'node:process'
import { neon } from '@neondatabase/serverless'
import {
  generateBriefing,
  generateInsights,
  getCachedBriefing,
  getLatestInsights,
  saveBriefing,
  saveInsights,
  type CompanySnapshot,
  type PracaSnapshot,
} from './ai-mesa.js'

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
    process.env.MESA_PASSWORD?.trim() ||
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

const GOAL_METRICS = ['abordagens', 'reunioes', 'mandatos'] as const
type GoalMetric = (typeof GOAL_METRICS)[number]
const GOAL_OWNERS = ['casa', 'vini', 'rafa', 'tadeu'] as const

function isGoalMetric(value: string): value is GoalMetric {
  return (
    value === 'abordagens' || value === 'reunioes' || value === 'mandatos'
  )
}

function isGoalOwner(value: string): boolean {
  return (
    value === 'casa' ||
    value === 'vini' ||
    value === 'rafa' ||
    value === 'tadeu'
  )
}

function emptyGoalSet() {
  return { abordagens: 0, reunioes: 0, mandatos: 0 }
}

async function listPartners(sql: Sql) {
  const rows = (await sql.query(
    'SELECT id, name FROM partners ORDER BY id ASC',
  )) as Array<{ id: string; name: string }>
  return {
    partners: rows.map((row) => ({
      id: row.id,
      name: row.name,
      short: row.name.slice(0, 1).toUpperCase(),
    })),
  }
}

async function listActivity(sql: Sql, params: URLSearchParams) {
  const companyId = (params.get('company_id') || '').trim()
  const partnerId = (params.get('partner_id') || '').trim()
  const day = (params.get('day') || '').trim()
  const month = (params.get('month') || params.get('year_month') || '').trim()
  const limit = Math.min(200, Math.max(1, Number(params.get('limit') || 80) || 80))
  const clauses: string[] = []
  const values: unknown[] = []
  if (companyId) {
    values.push(companyId)
    clauses.push(`a.company_id = $${values.length}`)
  }
  if (partnerId && isOwner(partnerId)) {
    values.push(partnerId)
    clauses.push(`a.partner_id = $${values.length}`)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    values.push(day)
    clauses.push(`a.created_at::date = $${values.length}::date`)
  }
  if (/^\d{4}-\d{2}$/.test(month)) {
    values.push(month)
    clauses.push(`to_char(a.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = $${values.length}`)
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
  values.push(limit)
  const rows = (await sql.query(
    `SELECT a.id, a.partner_id, a.company_id, a.kind, a.note, a.meta, a.created_at,
            c.name AS company_name
     FROM activity_log a
     LEFT JOIN companies c ON c.id = a.company_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT $${values.length}`,
    values,
  )) as Array<{
    id: string
    partner_id: string
    company_id: string | null
    kind: string
    note: string
    meta: unknown
    created_at: string | Date
    company_name: string | null
  }>
  return {
    activity: rows.map((row) => ({
      id: String(row.id),
      at: asStamp(row.created_at),
      by: isOwner(row.partner_id) ? row.partner_id : 'vini',
      text: row.note,
      accountId: row.company_id || undefined,
      companyName: row.company_name || undefined,
      kind: row.kind,
      meta: row.meta ?? {},
    })),
  }
}

async function createActivity(
  sql: Sql,
  body: Record<string, unknown>,
  actor: string,
) {
  const partnerRaw = asString(body.by || body.partnerId || actor).trim()
  const partnerId = isOwner(partnerRaw) ? partnerRaw : actor
  if (!isOwner(partnerId)) {
    return { status: 400, body: { error: 'Sócio inválido.' } }
  }
  const note = asString(body.text || body.note).trim()
  if (!note) {
    return { status: 400, body: { error: 'Texto da abordagem é obrigatório.' } }
  }
  const id = asString(body.id).trim() || crypto.randomUUID()
  const companyId = asString(body.accountId || body.companyId).trim() || null
  const kind = asString(body.kind).trim() || 'abordagem'
  const meta =
    body.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)
      ? body.meta
      : {}
  await sql.query(
    `INSERT INTO activity_log (id, partner_id, company_id, kind, note, meta)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [id, partnerId, companyId, kind, note, JSON.stringify(meta)],
  )
  if (companyId) {
    await sql.query(
      `UPDATE companies SET last_contact_at = CURRENT_DATE, updated_at = now(), updated_by = $2
       WHERE id = $1`,
      [companyId, partnerId],
    )
  }
  const listed = await listActivity(
    sql,
    new URLSearchParams(
      companyId
        ? { company_id: companyId, limit: '20' }
        : { partner_id: partnerId, limit: '20' },
    ),
  )
  const created =
    listed.activity.find((item) => item.id === id) ??
    listed.activity[0] ?? {
      id,
      at: new Date().toISOString(),
      by: partnerId,
      text: note,
      accountId: companyId || undefined,
      kind,
      meta,
    }
  return { status: 201, body: { activity: created } }
}

function kindToMetric(kind: string): GoalMetric | null {
  switch (kind) {
    case 'abordagem':
    case 'whatsapp':
    case 'nota':
      return 'abordagens'
    case 'reuniao':
    case 'reuniao_conversa':
      return 'reunioes'
    case 'mandato':
      return 'mandatos'
    default:
      return null
  }
}

async function listKpis(sql: Sql, yearMonth: string) {
  const goalsBody = await listGoals(sql, yearMonth)
  const rows = (await sql.query(
    `SELECT partner_id, kind, count(*)::int AS total
     FROM activity_log
     WHERE to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') = $1
     GROUP BY partner_id, kind`,
    [yearMonth],
  )) as Array<{ partner_id: string; kind: string; total: number }>

  const actuals = {
    casa: emptyGoalSet(),
    vini: emptyGoalSet(),
    rafa: emptyGoalSet(),
    tadeu: emptyGoalSet(),
  }

  for (const row of rows) {
    const metric = kindToMetric(row.kind)
    if (!metric || !isOwner(row.partner_id)) {
      continue
    }
    const partner = row.partner_id as 'vini' | 'rafa' | 'tadeu'
    actuals[partner][metric] += row.total
    actuals.casa[metric] += row.total
  }

  const weekRows = (await sql.query(
    `SELECT partner_id, count(*)::int AS total
     FROM activity_log
     WHERE created_at AT TIME ZONE 'America/Sao_Paulo' >=
           date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo')
     GROUP BY partner_id`,
    [],
  )) as Array<{ partner_id: string; total: number }>
  const weekByPartner = { vini: 0, rafa: 0, tadeu: 0, casa: 0 }
  for (const row of weekRows) {
    if (!isOwner(row.partner_id)) {
      continue
    }
    weekByPartner[row.partner_id as 'vini' | 'rafa' | 'tadeu'] = row.total
    weekByPartner.casa += row.total
  }

  return {
    month: yearMonth,
    goals: goalsBody.goals,
    actuals,
    week: weekByPartner,
  }
}

async function listGoals(sql: Sql, yearMonth: string) {
  const rows = (await sql.query(
    `SELECT partner_id, metric, target
     FROM month_goals WHERE year_month = $1`,
    [yearMonth],
  )) as Array<{ partner_id: string; metric: string; target: string | number }>
  const goals = {
    month: yearMonth,
    casa: emptyGoalSet(),
    vini: emptyGoalSet(),
    rafa: emptyGoalSet(),
    tadeu: emptyGoalSet(),
  }
  for (const row of rows) {
    if (!isGoalOwner(row.partner_id) || !isGoalMetric(row.metric)) {
      continue
    }
    const owner = row.partner_id as (typeof GOAL_OWNERS)[number]
    goals[owner][row.metric] = Number(row.target) || 0
  }
  return { goals }
}

async function upsertGoals(
  sql: Sql,
  yearMonth: string,
  body: Record<string, unknown>,
) {
  const month = asString(body.month).trim() || yearMonth
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { status: 400, body: { error: 'year_month inválido (YYYY-MM).' } }
  }
  for (const owner of GOAL_OWNERS) {
    const block = body[owner]
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      continue
    }
    const set = block as Record<string, unknown>
    for (const metric of GOAL_METRICS) {
      const raw = set[metric]
      const target = typeof raw === 'number' ? raw : Number(raw) || 0
      const id = `${month}:${owner}:${metric}`
      await sql.query(
        `INSERT INTO month_goals (id, partner_id, year_month, metric, target, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (partner_id, year_month, metric)
         DO UPDATE SET target = EXCLUDED.target, updated_at = now()`,
        [id, owner, month, metric, target],
      )
    }
  }
  return { status: 200, body: await listGoals(sql, month) }
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


function toCompanySnapshot(
  account: NonNullable<Awaited<ReturnType<typeof getCompany>>>,
): CompanySnapshot {
  return {
    id: account.id,
    name: account.name,
    list: account.list,
    city: account.city,
    uf: account.uf,
    region: account.region,
    inCuritibaRadius: account.inCuritibaRadius,
    empCount: account.empCount,
    porte: account.porte,
    atuacao: account.atuacao,
    site: account.site,
    contactName: account.contactName,
    phone: account.phone,
    email: account.email,
    owner: account.owner,
    status: account.status,
    nextAction: account.nextAction,
    nextActionAt: account.nextActionAt,
    lastContactAt: account.lastContactAt,
    notes: account.notes,
    developments: (account.developments || []).map((item) => ({
      name: item.name,
      stage: item.stage,
      kind: item.kind,
      city: item.city,
      uf: item.uf,
      units: item.units,
    })),
  }
}

async function buildPracaSnapshot(
  sql: Sql,
  scope: MesaScope,
): Promise<PracaSnapshot> {
  const params = new URLSearchParams({ scope })
  const counts = (await summary(sql, params)) as Record<string, number>
  const due = await dueList(sql, params)
  return {
    scope,
    total: Number(counts.total) || 0,
    incorporadora: Number(counts.incorporadora) || 0,
    construtora: Number(counts.construtora) || 0,
    prospeccao: Number(counts.prospeccao) || 0,
    novo: Number(counts.novo) || 0,
    abordar: Number(counts.abordar) || 0,
    em_conversa: Number(counts.em_conversa) || 0,
    follow_up: Number(counts.follow_up) || 0,
    mandato: Number(counts.mandato) || 0,
    livre: Number(counts.livre) || 0,
    dueCount: due.accounts.length,
    dueSample: due.accounts.slice(0, 5).map((account) => ({
      name: account.name,
      status: account.status,
      owner: account.owner,
      nextAction: account.nextAction,
    })),
  }
}

async function getBriefingHandler(sql: Sql, companyId: string) {
  const account = await getCompany(sql, companyId)
  if (!account) {
    return { status: 404, body: { error: 'Conta não encontrada.' } }
  }
  const briefing = await getCachedBriefing(sql, companyId)
  return {
    status: 200,
    body: {
      briefing,
      companyId,
    },
  }
}

async function postBriefingHandler(sql: Sql, companyId: string) {
  const account = await getCompany(sql, companyId)
  if (!account) {
    return { status: 404, body: { error: 'Conta não encontrada.' } }
  }
  const generated = await generateBriefing(toCompanySnapshot(account))
  const briefing = await saveBriefing(
    sql,
    companyId,
    generated.content,
    generated.model,
  )
  return {
    status: 200,
    body: {
      briefing,
      regenerated: true,
    },
  }
}

async function getInsightsHandler(sql: Sql, scope: MesaScope) {
  const insights = await getLatestInsights(sql, scope)
  return { status: 200, body: { insights, scope } }
}

async function postInsightsHandler(sql: Sql, scope: MesaScope) {
  const snap = await buildPracaSnapshot(sql, scope)
  const generated = await generateInsights(snap)
  const insights = await saveInsights(
    sql,
    scope,
    generated.content,
    generated.model,
  )
  return {
    status: 200,
    body: { insights, scope, regenerated: true },
  }
}

export async function handleMesaApi(request: MesaRequest): Promise<MesaResponse> {
  const params = new URLSearchParams(request.search.replace(/^\?/, ''))
  const parts = parsePath(request.pathname)
  const method = request.method.toUpperCase()
  const body = readBody(request.body)

  if (parts[0] === 'session' && method === 'POST') {
    const password =
      asString(body.password).trim() || request.password.trim()
    const partnerId = asString(body.partnerId || body.partner).trim()
    if (!isOwner(partnerId)) {
      return { status: 400, body: { error: 'Escolha Vini, Rafa ou Tadeu.' } }
    }
    if (password !== expectedPassword()) {
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
    try {
      const partners = await listPartners(sql)
      const partner =
        partners.partners.find((item) => item.id === partnerId) ?? {
          id: partnerId,
          name:
            partnerId === 'vini'
              ? 'Vini'
              : partnerId === 'rafa'
                ? 'Rafa'
                : 'Tadeu',
          short: partnerId.slice(0, 1).toUpperCase(),
        }
      return { status: 200, body: { ok: true, partner } }
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Falha na mesa.',
        },
      }
    }
  }

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

  const actor =
    params.get('by') ||
    asString(body.updatedBy) ||
    asString(body.by) ||
    'vini'

  try {
    if (parts.length === 0 || (parts[0] === 'companies' && parts.length === 1)) {
      if (method === 'GET') {
        return { status: 200, body: await listCompanies(sql, params) }
      }
      if (method === 'POST') {
        return await createCompany(sql, body, actor)
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
        const note = asString(body.note).trim()
        const patched = await patchCompany(sql, parts[1], body, actor, note)
        if (patched.status === 200 && note && isOwner(actor)) {
          await createActivity(
            sql,
            {
              by: actor,
              accountId: parts[1],
              text: note,
              kind: 'abordagem',
            },
            actor,
          )
        }
        return patched
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
    if (parts[0] === 'partners' && method === 'GET') {
      return { status: 200, body: await listPartners(sql) }
    }
    if (parts[0] === 'activity' && parts.length === 1) {
      if (method === 'GET') {
        return { status: 200, body: await listActivity(sql, params) }
      }
      if (method === 'POST') {
        return await createActivity(sql, body, actor)
      }
    }
    if (parts[0] === 'goals' && parts.length === 1) {
      const yearMonth =
        params.get('year_month') ||
        asString(body.month).trim() ||
        new Date().toISOString().slice(0, 7)
      if (method === 'GET') {
        return { status: 200, body: await listGoals(sql, yearMonth) }
      }
      if (method === 'PUT' || method === 'POST') {
        return await upsertGoals(sql, yearMonth, body)
      }
    }
    if (parts[0] === 'kpis' && method === 'GET') {
      const yearMonth =
        params.get('year_month') ||
        params.get('month') ||
        new Date().toISOString().slice(0, 7)
      return { status: 200, body: await listKpis(sql, yearMonth) }
    }
    if (parts[0] === 'briefing' && parts[1] && parts.length === 2) {
      if (method === 'GET') {
        return await getBriefingHandler(sql, parts[1])
      }
      if (method === 'POST') {
        return await postBriefingHandler(sql, parts[1])
      }
    }
    if (parts[0] === 'insights' && parts.length === 1) {
      const scopeRaw = params.get('scope') || asString(body.scope) || 'praca'
      const scope: MesaScope = isScope(scopeRaw) ? scopeRaw : 'praca'
      if (method === 'GET') {
        return await getInsightsHandler(sql, scope)
      }
      if (method === 'POST') {
        return await postInsightsHandler(sql, scope)
      }
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
