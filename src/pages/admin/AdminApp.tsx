import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import { dueQueue } from '@/lib/admin-kpis'
import { AdminCrm } from '@/pages/admin/AdminCrm'
import { AdminHoje } from '@/pages/admin/AdminHoje'
import { AdminKpis } from '@/pages/admin/AdminKpis'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminMetas } from '@/pages/admin/AdminMetas'
import { AdminIntegracao } from '@/pages/admin/AdminIntegracao'
import { AdminSidebar } from '@/pages/admin/AdminSidebar'
import { AdminTopbar } from '@/pages/admin/AdminTopbar'
import { deskPage, pageMeta } from '@/pages/admin/admin-nav'

export function AdminApp() {
  const navigate = useNavigate()
  const location = useLocation()
  const [me, setMe] = useState<PartnerId | null>(null)
  const [board, setBoard] = useState<AdminBoard>(() => ensureMonth(loadBoard()))
  const [loginError, setLoginError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

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
      <div className="admin-desk min-h-svh bg-[#f3efe6] text-[#050505]">
        <AdminLogin error={loginError} onSubmit={login} />
      </div>
    )
  }

  const meta = pageMeta(deskPage(location.pathname))
  const dueCount = dueQueue(board.accounts).length

  function ingestRemote(remote: AdminBoard, count: number) {
    if (!me) {
      return
    }
    persist({
      version: 1,
      accounts: remote.accounts,
      goals: remote.goals.length > 0 ? remote.goals : board.goals,
      activity: [
        {
          id: newId(),
          at: new Date().toISOString(),
          by: me,
          text: `Puxou ${count} contas pela API.`,
        },
        ...board.activity,
      ],
    })
  }

  function openCreate() {
    setCreating(true)
    navigate('/admin/crm')
  }

  return (
    <div className="admin-desk min-h-svh bg-[#f3efe6] text-[#050505]">
      <div className="flex min-h-svh">
        <AdminSidebar
          me={me}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onLogout={logout}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            me={me}
            title={meta.title}
            subtitle={meta.subtitle}
            query={query}
            dueCount={dueCount}
            onQuery={setQuery}
            onSearch={() => navigate('/admin/crm')}
            onMenu={() => setNavOpen(true)}
            onExport={exportBoard}
            onImport={importBoard}
          />
          <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <Routes>
              <Route
                index
                element={
                  <AdminHoje
                    board={board}
                    me={me}
                    onOpen={(id) => {
                      setSelectedId(id)
                      navigate('/admin/crm')
                    }}
                    onCreate={openCreate}
                    onExport={exportBoard}
                  />
                }
              />
              <Route
                path="crm"
                element={
                  <AdminCrm
                    board={board}
                    me={me}
                    selectedId={selectedId}
                    query={query}
                    onQuery={setQuery}
                    creating={creating}
                    onCreatingChange={setCreating}
                    onSelect={setSelectedId}
                    onCreate={createAccount}
                    onSave={saveAccount}
                    onDelete={deleteAccount}
                  />
                }
              />
              <Route path="kpis" element={<AdminKpis board={board} me={me} />} />
              <Route
                path="metas"
                element={<AdminMetas board={board} me={me} onSave={saveGoals} />}
              />
              <Route
                path="integracao"
                element={<AdminIntegracao me={me} onApply={ingestRemote} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
