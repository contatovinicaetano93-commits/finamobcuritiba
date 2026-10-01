import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import {
  ADMIN_PASSWORD,
  currentMonth,
  newId,
  partnerById,
  todayIso,
  type Account,
  type AdminBoard,
  type MonthGoals,
  type PartnerId,
} from '@/data/admin'
import {
  clearSession,
  ensureMonth,
  loadBoard,
  loadSession,
  parseBoard,
  saveBoard,
  saveSession,
  upsertGoals,
} from '@/lib/admin-store'
import { AdminCrm } from '@/pages/admin/AdminCrm'
import { AdminHoje } from '@/pages/admin/AdminHoje'
import { AdminKpis } from '@/pages/admin/AdminKpis'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminMetas } from '@/pages/admin/AdminMetas'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Hoje', end: true },
  { to: '/admin/crm', label: 'CRM', end: false },
  { to: '/admin/kpis', label: 'KPIs', end: false },
  { to: '/admin/metas', label: 'Metas', end: false },
] as const

export function AdminApp() {
  const navigate = useNavigate()
  const [me, setMe] = useState<PartnerId | null>(null)
  const [board, setBoard] = useState<AdminBoard>(() => ensureMonth(loadBoard()))
  const [loginError, setLoginError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const persist = useCallback((next: AdminBoard) => {
    const withMonth = ensureMonth(next)
    setBoard(withMonth)
    saveBoard(withMonth)
  }, [])

  useEffect(() => {
    setMe(loadSession())
    const refresh = () => setBoard(ensureMonth(loadBoard()))
    window.addEventListener('storage', refresh)
    window.addEventListener('finamob-admin-board', refresh)
    let channel: BroadcastChannel | null = null
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('finamob-curitiba-admin')
      channel.onmessage = refresh
    }
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('finamob-admin-board', refresh)
      channel?.close()
    }
  }, [])

  function login(partner: PartnerId, password: string) {
    const typed = password.trim()
    if (!typed) {
      setLoginError('Digite a senha da mesa.')
      return
    }
    if (typed !== ADMIN_PASSWORD) {
      setLoginError('Senha não confere.')
      return
    }
    saveSession(partner)
    setMe(partner)
    setLoginError('')
  }

  function logout() {
    clearSession()
    setMe(null)
    navigate('/admin')
  }

  function createAccount(
    draft: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>,
  ) {
    if (!me) {
      return
    }
    const now = new Date().toISOString()
    const account: Account = {
      ...draft,
      id: newId(),
      createdAt: now,
      updatedAt: now,
      updatedBy: me,
    }
    persist({
      ...board,
      accounts: [account, ...board.accounts],
      activity: [
        {
          id: newId(),
          at: now,
          by: me,
          text: `Cadastrou ${account.name}.`,
          accountId: account.id,
        },
        ...board.activity,
      ],
    })
    setSelectedId(account.id)
  }

  function saveAccount(next: Account, note: string) {
    if (!me) {
      return
    }
    const now = new Date().toISOString()
    const stamped: Account = {
      ...next,
      name: next.name.trim(),
      updatedAt: now,
      updatedBy: me,
      lastContactAt: note
        ? next.lastContactAt || todayIso()
        : next.lastContactAt,
      notes: note
        ? [next.notes.trim(), `${todayIso()} · ${partnerById(me).name}: ${note}`]
            .filter(Boolean)
            .join('\n')
        : next.notes,
    }
    persist({
      ...board,
      accounts: board.accounts.map((item) =>
        item.id === stamped.id ? stamped : item,
      ),
      activity: [
        {
          id: newId(),
          at: now,
          by: me,
          text: note
            ? `Abordou ${stamped.name}: ${note}`
            : `Atualizou ${stamped.name}.`,
          accountId: stamped.id,
        },
        ...board.activity,
      ],
    })
  }

  function deleteAccount(id: string) {
    if (!me) {
      return
    }
    const account = board.accounts.find((item) => item.id === id)
    persist({
      ...board,
      accounts: board.accounts.filter((item) => item.id !== id),
      activity: [
        {
          id: newId(),
          at: new Date().toISOString(),
          by: me,
          text: `Removeu ${account?.name ?? 'uma conta'}.`,
        },
        ...board.activity,
      ],
    })
  }

  function saveGoals(goals: MonthGoals) {
    if (!me) {
      return
    }
    persist({
      ...upsertGoals(board, { ...goals, month: currentMonth() }),
      activity: [
        {
          id: newId(),
          at: new Date().toISOString(),
          by: me,
          text: `Atualizou as metas de ${currentMonth()}.`,
        },
        ...board.activity,
      ],
    })
  }

  function exportBoard() {
    const blob = new Blob([JSON.stringify(board, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finamob-curitiba-mesa-${todayIso()}.json`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function importBoard(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return
      }
      const parsed = parseBoard(reader.result)
      if (!parsed) {
        window.alert('Arquivo inválido.')
        return
      }
      persist(parsed)
    }
    reader.readAsText(file)
  }

  if (!me) {
    return (
      <div className="min-h-svh bg-[#f3efe6]">
        <AdminLogin error={loginError} onSubmit={login} />
      </div>
    )
  }

  const partner = partnerById(me)

  return (
    <div className="min-h-svh bg-[#f3efe6] text-[#050505]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <BrandMark variant="dark" />
          <nav className="flex flex-wrap gap-1" aria-label="Mesa">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-1.5 text-[13px] tracking-[0.08em]',
                    isActive
                      ? 'bg-[#050505] text-white'
                      : 'text-black/60 hover:text-black',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-black/55">{partner.name}</p>
            <Button type="button" variant="outline" size="sm" onClick={exportBoard}>
              Exportar
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                Importar
                <input
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  onChange={importBoard}
                />
              </label>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminHoje
                board={board}
                me={me}
                onOpen={(id) => {
                  setSelectedId(id)
                  navigate('/admin/crm')
                }}
              />
            }
          />
          <Route
            path="/admin/crm"
            element={
              <AdminCrm
                board={board}
                me={me}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCreate={createAccount}
                onSave={saveAccount}
                onDelete={deleteAccount}
              />
            }
          />
          <Route path="/admin/kpis" element={<AdminKpis board={board} me={me} />} />
          <Route
            path="/admin/metas"
            element={<AdminMetas board={board} me={me} onSave={saveGoals} />}
          />
        </Routes>
      </div>
    </div>
  )
}
