import process from 'node:process'

type Sql = {
  query: (query: string, params?: unknown[]) => Promise<unknown>
}

export type BriefingContent = {
  headline: string
  summary: string
  bullets: string[]
  nextSteps: string[]
  gaps: string[]
  source: 'openai' | 'heuristic'
}

export type InsightBullet = {
  text: string
  action?: string
}

export type InsightsContent = {
  headline: string
  bullets: InsightBullet[]
  source: 'openai' | 'heuristic'
}

export type CachedBriefing = {
  companyId: string
  content: BriefingContent
  model: string
  updatedAt: string
  cached: boolean
}

export type CachedInsights = {
  id: string
  scope: string
  content: InsightsContent
  model: string
  createdAt: string
  cached: boolean
}

type CompanySnapshot = {
  id: string
  name: string
  list: string
  city: string
  uf: string
  region: string
  inCuritibaRadius: boolean
  empCount: number
  porte: string
  atuacao: string
  site: string
  contactName: string
  phone: string
  email: string
  owner: string | null
  status: string
  nextAction: string
  nextActionAt: string
  lastContactAt: string
  notes: string
  developments: Array<{
    name: string
    stage: string
    kind: string
    city: string
    uf: string
    units: number | null
  }>
}

type PracaSnapshot = {
  scope: string
  total: number
  incorporadora: number
  construtora: number
  prospeccao: number
  novo: number
  abordar: number
  em_conversa: number
  follow_up: number
  mandato: number
  livre: number
  dueCount: number
  dueSample: Array<{ name: string; status: string; owner: string | null; nextAction: string }>
}

const STATUS_PT: Record<string, string> = {
  novo: 'novo',
  abordar: 'a abordar',
  em_conversa: 'em conversa',
  follow_up: 'follow-up',
  mandato: 'mandato',
  pausado: 'pausado',
  sem_fit: 'sem fit',
}

const LIST_PT: Record<string, string> = {
  incorporadora: 'incorporadora',
  construtora: 'construtora',
  prospeccao: 'prospecção',
}

function asStamp(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // ignore
  }
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 8)
}

function insightBullets(value: unknown): InsightBullet[] {
  if (!Array.isArray(value)) return []
  const out: InsightBullet[] = []
  for (const item of value) {
    if (typeof item === 'string' && item.trim()) {
      out.push({ text: item.trim() })
      continue
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = item as Record<string, unknown>
      const text = typeof row.text === 'string' ? row.text.trim() : ''
      if (!text) continue
      const action =
        typeof row.action === 'string' && row.action.trim()
          ? row.action.trim()
          : undefined
      out.push({ text, action })
    }
  }
  return out.slice(0, 8)
}

function normalizeBriefing(
  raw: Record<string, unknown>,
  fallback: BriefingContent,
  source: 'openai' | 'heuristic',
): BriefingContent {
  return {
    headline:
      typeof raw.headline === 'string' && raw.headline.trim()
        ? raw.headline.trim()
        : fallback.headline,
    summary:
      typeof raw.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : fallback.summary,
    bullets: stringList(raw.bullets).length
      ? stringList(raw.bullets)
      : fallback.bullets,
    nextSteps: stringList(raw.nextSteps).length
      ? stringList(raw.nextSteps)
      : fallback.nextSteps,
    gaps: stringList(raw.gaps).length ? stringList(raw.gaps) : fallback.gaps,
    source,
  }
}

function normalizeInsights(
  raw: Record<string, unknown>,
  fallback: InsightsContent,
  source: 'openai' | 'heuristic',
): InsightsContent {
  const bullets = insightBullets(raw.bullets)
  return {
    headline:
      typeof raw.headline === 'string' && raw.headline.trim()
        ? raw.headline.trim()
        : fallback.headline,
    bullets: bullets.length ? bullets : fallback.bullets,
    source,
  }
}

function llmCredentials(): {
  apiKey: string
  baseUrl: string
  model: string
} | null {
  const neonToken = process.env.NEON_AI_GATEWAY_TOKEN?.trim()
  const neonBase = process.env.NEON_AI_GATEWAY_BASE_URL?.trim()
  if (neonToken && neonBase) {
    return {
      apiKey: neonToken,
      baseUrl: `${neonBase.replace(/\/$/, '')}/v1`,
      model: process.env.MESA_AI_MODEL?.trim() || 'gpt-4o-mini',
    }
  }
  const openAiKey = process.env.OPENAI_API_KEY?.trim()
  if (openAiKey) {
    return {
      apiKey: openAiKey,
      baseUrl: (
        process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1'
      ).replace(/\/$/, ''),
      model: process.env.MESA_AI_MODEL?.trim() || 'gpt-4o-mini',
    }
  }
  return null
}

async function chatJson(
  system: string,
  user: string,
): Promise<{ content: Record<string, unknown>; model: string } | null> {
  const creds = llmCredentials()
  if (!creds) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12_000)
    const response = await fetch(`${creds.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: creds.model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!response.ok) return null
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const text = data.choices?.[0]?.message?.content || ''
    const parsed = parseJsonObject(text)
    if (!parsed) return null
    return { content: parsed, model: creds.model }
  } catch {
    return null
  }
}

export function heuristicBriefing(company: CompanySnapshot): BriefingContent {
  const list = LIST_PT[company.list] || company.list || 'conta'
  const status = STATUS_PT[company.status] || company.status
  const place = [company.city, company.uf].filter(Boolean).join('/')
  const gaps: string[] = []
  if (!company.contactName.trim()) gaps.push('Contato sem nome cadastrado')
  if (!company.phone.trim()) gaps.push('Telefone não cadastrado')
  if (!company.email.trim()) gaps.push('E-mail não cadastrado')
  if (!place) gaps.push('Cidade/UF não informadas — sem sede inventada')

  const bullets: string[] = [
    `${company.name} · ${list}${place ? ` em ${place}` : ''}`,
    `Status ${status}${company.owner ? ` · dono ${company.owner}` : ' · sem dono'}`,
  ]
  if (company.empCount > 0) {
    bullets.push(`${company.empCount} empreendimento(s) no radar`)
  }
  if (company.inCuritibaRadius) {
    bullets.push('Dentro da praça Curitiba')
  } else if (company.region) {
    bullets.push(`Região ${company.region}`)
  }
  if (company.porte) bullets.push(`Porte: ${company.porte}`)
  if (company.atuacao) bullets.push(`Atuação: ${company.atuacao}`)

  const stages = company.developments
    .map((item) => item.stage)
    .filter(Boolean)
  if (stages.length) {
    const unique = [...new Set(stages)].slice(0, 4)
    bullets.push(`Estágios: ${unique.join(', ')}`)
  }
  for (const item of company.developments.slice(0, 3)) {
    const bits = [item.name, item.city || item.uf, item.stage, item.kind]
      .filter(Boolean)
      .join(' · ')
    if (bits) bullets.push(bits)
  }

  const nextSteps: string[] = []
  if (company.nextAction.trim()) {
    nextSteps.push(
      company.nextActionAt
        ? `${company.nextAction} (${company.nextActionAt})`
        : company.nextAction,
    )
  } else {
    nextSteps.push('Definir próximo passo objetivo na ficha')
  }
  if (!company.owner) {
    nextSteps.push('Assumir dono antes de abordar')
  }
  if (gaps.length) {
    nextSteps.push('Completar dados reais de contato — não inventar telefone/e-mail')
  }
  if (company.status === 'novo' || company.status === 'abordar') {
    nextSteps.push('Primeira abordagem com contexto dos empreendimentos listados')
  } else if (company.status === 'follow_up') {
    nextSteps.push('Retomar follow-up com base nas notas existentes')
  }

  return {
    headline: `Briefing · ${company.name}`,
    summary: `${list[0]?.toUpperCase()}${list.slice(1)} ${status}${
      place ? ` em ${place}` : ''
    }. ${
      company.empCount
        ? `${company.empCount} empreendimento(s) conhecidos.`
        : 'Sem empreendimentos cadastrados ainda.'
    } Contatos e sede só constam se estiverem no CRM — nada inventado.`,
    bullets: bullets.slice(0, 8),
    nextSteps: nextSteps.slice(0, 5),
    gaps,
    source: 'heuristic',
  }
}

export function heuristicInsights(snap: PracaSnapshot): InsightsContent {
  const bullets: InsightBullet[] = []
  if (snap.dueCount > 0) {
    bullets.push({
      text: `${snap.dueCount} conta(s) com ação vencida ou do dia na praça.`,
      action: 'Abrir a fila de hoje e registrar abordagem',
    })
  } else {
    bullets.push({
      text: 'Nenhuma conta vencida na fila da praça agora.',
      action: 'Priorizar novos e livres',
    })
  }
  if (snap.livre > 0) {
    bullets.push({
      text: `${snap.livre} conta(s) sem dono — risco de overlap.`,
      action: 'Assumir dono antes de ligar',
    })
  }
  if (snap.novo + snap.abordar > 0) {
    bullets.push({
      text: `${snap.novo + snap.abordar} no estágio novo/a abordar (${snap.incorporadora} incorp. · ${snap.construtora} constr. · ${snap.prospeccao} prospecção).`,
      action: 'Escolher 3 e abordar hoje',
    })
  }
  if (snap.follow_up > 0) {
    bullets.push({
      text: `${snap.follow_up} em follow-up — não deixar esfriar.`,
      action: 'Retomar com próximo passo marcado',
    })
  }
  if (snap.em_conversa > 0) {
    bullets.push({
      text: `${snap.em_conversa} em conversa ativa.`,
      action: 'Avançar para reunião ou mandato',
    })
  }
  if (snap.mandato > 0) {
    bullets.push({
      text: `${snap.mandato} mandato(s) na praça — proteger e expandir.`,
    })
  }
  for (const item of snap.dueSample.slice(0, 3)) {
    bullets.push({
      text: `${item.name}: ${STATUS_PT[item.status] || item.status}${
        item.owner ? ` · ${item.owner}` : ' · livre'
      }${item.nextAction ? ` — ${item.nextAction}` : ''}`,
      action: 'Abrir ficha e logar',
    })
  }

  return {
    headline: `Insights da praça · ${snap.total} contas`,
    bullets: bullets.slice(0, 7),
    source: 'heuristic',
  }
}

function briefingFacts(company: CompanySnapshot) {
  return {
    name: company.name,
    list: company.list,
    city: company.city || null,
    uf: company.uf || null,
    region: company.region || null,
    inCuritibaRadius: company.inCuritibaRadius,
    empCount: company.empCount,
    porte: company.porte || null,
    atuacao: company.atuacao || null,
    site: company.site || null,
    contactName: company.contactName || null,
    hasPhone: Boolean(company.phone.trim()),
    hasEmail: Boolean(company.email.trim()),
    phone: company.phone.trim() || null,
    email: company.email.trim() || null,
    owner: company.owner,
    status: company.status,
    nextAction: company.nextAction || null,
    nextActionAt: company.nextActionAt || null,
    lastContactAt: company.lastContactAt || null,
    notes: company.notes ? company.notes.slice(0, 800) : null,
    developments: company.developments.slice(0, 12).map((item) => ({
      name: item.name,
      stage: item.stage || null,
      kind: item.kind || null,
      city: item.city || null,
      uf: item.uf || null,
      units: item.units,
    })),
  }
}

export async function generateBriefing(
  company: CompanySnapshot,
): Promise<{ content: BriefingContent; model: string }> {
  const fallback = heuristicBriefing(company)
  const llm = await chatJson(
    `Você é o briefing da mesa Finamob Curitiba (sócios Vini/Rafa/Tadeu).
Responda só JSON: {"headline","summary","bullets":string[],"nextSteps":string[],"gaps":string[]}.
Regras: use APENAS os fatos fornecidos. NUNCA invente telefone, e-mail, sede/HQ, CNPJ ou contato.
Se faltar dado, liste em gaps. Bullets e nextSteps acionáveis para abordagem comercial imobiliária.
Texto em português do Brasil, curto.`,
    JSON.stringify(briefingFacts(company)),
  )
  if (!llm) {
    return { content: fallback, model: 'heuristic' }
  }
  return {
    content: normalizeBriefing(llm.content, fallback, 'openai'),
    model: llm.model,
  }
}

export async function generateInsights(
  snap: PracaSnapshot,
): Promise<{ content: InsightsContent; model: string }> {
  const fallback = heuristicInsights(snap)
  const llm = await chatJson(
    `Você gera insights acionáveis para a mesa Finamob Curitiba (praça).
Responda só JSON: {"headline","bullets":[{"text","action"}]}.
Use só os números/fatos dados. Não invente contatos, telefones, e-mails ou sedes.
Português do Brasil, bullets curtos e acionáveis para o dia.`,
    JSON.stringify(snap),
  )
  if (!llm) {
    return { content: fallback, model: 'heuristic' }
  }
  return {
    content: normalizeInsights(llm.content, fallback, 'openai'),
    model: llm.model,
  }
}

export async function getCachedBriefing(
  sql: Sql,
  companyId: string,
): Promise<CachedBriefing | null> {
  try {
    const rows = (await sql.query(
      `SELECT company_id, content, model, updated_at
       FROM ai_briefings WHERE company_id = $1`,
      [companyId],
    )) as Array<{
      company_id: string
      content: unknown
      model: string
      updated_at: string | Date
    }>
    const row = rows[0]
    if (!row) return null
    const raw =
      typeof row.content === 'string'
        ? parseJsonObject(row.content) || {}
        : (row.content as Record<string, unknown>) || {}
    const fallback: BriefingContent = {
      headline: '',
      summary: '',
      bullets: [],
      nextSteps: [],
      gaps: [],
      source: row.model === 'heuristic' ? 'heuristic' : 'openai',
    }
    return {
      companyId: row.company_id,
      content: normalizeBriefing(
        raw,
        fallback,
        row.model === 'heuristic' ? 'heuristic' : 'openai',
      ),
      model: row.model,
      updatedAt: asStamp(row.updated_at),
      cached: true,
    }
  } catch {
    return null
  }
}

export async function saveBriefing(
  sql: Sql,
  companyId: string,
  content: BriefingContent,
  model: string,
): Promise<CachedBriefing> {
  try {
    await sql.query(
      `INSERT INTO ai_briefings (company_id, content, model, updated_at)
       VALUES ($1, $2::jsonb, $3, now())
       ON CONFLICT (company_id)
       DO UPDATE SET content = EXCLUDED.content, model = EXCLUDED.model, updated_at = now()`,
      [companyId, JSON.stringify(content), model],
    )
    const cached = await getCachedBriefing(sql, companyId)
    if (cached) return cached
  } catch {
    // fall through
  }
  return {
    companyId,
    content,
    model,
    updatedAt: new Date().toISOString(),
    cached: false,
  }
}

export async function getLatestInsights(
  sql: Sql,
  scope: string,
): Promise<CachedInsights | null> {
  try {
    const rows = (await sql.query(
      `SELECT id, scope, content, model, created_at
       FROM ai_insights
       WHERE scope = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [scope],
    )) as Array<{
      id: string
      scope: string
      content: unknown
      model: string
      created_at: string | Date
    }>
    const row = rows[0]
    if (!row) return null
    const raw =
      typeof row.content === 'string'
        ? parseJsonObject(row.content) || {}
        : (row.content as Record<string, unknown>) || {}
    const fallback: InsightsContent = {
      headline: '',
      bullets: [],
      source: row.model === 'heuristic' ? 'heuristic' : 'openai',
    }
    return {
      id: row.id,
      scope: row.scope,
      content: normalizeInsights(
        raw,
        fallback,
        row.model === 'heuristic' ? 'heuristic' : 'openai',
      ),
      model: row.model,
      createdAt: asStamp(row.created_at),
      cached: true,
    }
  } catch {
    return null
  }
}

export async function saveInsights(
  sql: Sql,
  scope: string,
  content: InsightsContent,
  model: string,
): Promise<CachedInsights> {
  const id = crypto.randomUUID()
  try {
    await sql.query(
      `INSERT INTO ai_insights (id, scope, content, model, created_at)
       VALUES ($1, $2, $3::jsonb, $4, now())`,
      [id, scope, JSON.stringify(content), model],
    )
    const cached = await getLatestInsights(sql, scope)
    if (cached) return cached
  } catch {
    // fall through
  }
  return {
    id,
    scope,
    content,
    model,
    createdAt: new Date().toISOString(),
    cached: false,
  }
}

export type { CompanySnapshot, PracaSnapshot }
