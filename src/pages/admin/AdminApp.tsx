import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  currentMonth,
  newId,
  partnerById,
  todayIso,
  type Account,
  type Activity,
  type AdminBoard,
  type MonthGoals,
  type PartnerId,
} from '@/data/admin'
import {
  clearSession,
  ensureMonth,
  loadBoard,
  loadSession,
  saveBoard,
  saveSession,
  upsertGoals,
} from '@/lib/admin-store'
import {
  importErrorMessage,
  ingestCrmFile,
} from '@/lib/crm-import'
import { mergeImportedAccounts } from '@/lib/crm-merge'
import {
  createMesaActivity,
  createMesaCompany,
  deleteMesaCompany,
  fetchMesaActivity,
  fetchMesaDue,
  fetchMesaGoals,
  loginMesaSession,
  saveMesaCompany,
  saveMesaGoals,
  type MesaAccount,
} from '@/lib/mesa-api'
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
  const [importNotice, setImportNotice] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [dueAccounts, setDueAccounts] = useState<MesaAccount[]>([])

  const persist = useCallback((next: AdminBoard) => {
    const withMonth = ensureMonth(next)
    setBoard(withMonth)
    saveBoard(withMonth)
  }, [])

  function bumpMesa() {
    setReloadToken((value) => value + 1)
  }

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

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [due, goals, activity] = await Promise.all([
        fetchMesaDue({ scope: 'praca' }),
        fetchMesaGoals(currentMonth()),
        fetchMesaActivity({ limit: 80 }),
      ])
      if (cancelled) {
        return
      }
      if (due.ok) {
        setDueAccounts(due.data.accounts)
      }
      setBoard((prev) => {
        let next = ensureMonth(prev)
        if (goals.ok) {
          next = upsertGoals(next, goals.data.goals)
        }
        if (activity.ok) {
          const mapped: Activity[] = activity.data.activity.map((item) => ({
            id: item.id,
            at: item.at,
            by: item.by,
            text: item.text,
            accountId: item.accountId,
          }))
          next = { ...next, activity: mapped }
        }
        saveBoard(next)
        return next
      })
    })()
    return () => {
      cancelled = true
    }
  }, [reloadToken, me])

  function login(partner: PartnerId, password: string) {
    const typed = password.trim()
    if (!typed) {
      setLoginError('Digite a senha da mesa.')
      return
    }
    void (async () => {
      const result = await loginMesaSession(partner, typed)
      if (!result.ok) {
        setLoginError(result.error)
        return
      }
      saveSession(partner)
      setMe(partner)
      setLoginError('')
      bumpMesa()
    })()
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
    void (async () => {
      const result = await createMesaCompany(draft, me)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      const now = new Date().toISOString()
      persist({
        ...board,
        activity: [
          {
            id: newId(),
            at: now,
            by: me,
            text: `Cadastrou ${result.data.account.name}.`,
            accountId: result.data.account.id,
          },
          ...board.activity,
        ],
      })
      setSelectedId(result.data.account.id)
      bumpMesa()
    })()
  }

  function saveAccount(next: Account, note: string) {
    if (!me) {
      return
    }
    const stamped: Account = {
      ...next,
      name: next.name.trim(),
      lastContactAt: note
        ? next.lastContactAt || todayIso()
        : next.lastContactAt,
    }
    void (async () => {
      const result = await saveMesaCompany(
        stamped,
        note
          ? `${todayIso()} · ${partnerById(me).name}: ${note}`
          : '',
        me,
      )
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      if (note.trim()) {
        await createMesaActivity({
          by: me,
          accountId: stamped.id,
          text: `Abordou ${stamped.name}: ${note.trim()}`,
          kind: 'abordagem',
        })
      }
      bumpMesa()
    })()
  }

  function deleteAccount(id: string) {
    if (!me) {
      return
    }
    void (async () => {
      const result = await deleteMesaCompany(id)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      persist({
        ...board,
        activity: [
          {
            id: newId(),
            at: new Date().toISOString(),
            by: me,
            text: 'Removeu uma conta da mesa.',
          },
          ...board.activity,
        ],
      })
      bumpMesa()
    })()
  }

  function saveGoals(goals: MonthGoals) {
    if (!me) {
      return
    }
    const next = { ...goals, month: currentMonth() }
    persist(upsertGoals(board, next))
    void (async () => {
      const result = await saveMesaGoals(next)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      await createMesaActivity({
        by: me,
        text: `Atualizou as metas de ${next.month}.`,
        kind: 'meta',
      })
      bumpMesa()
    })()
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

  async function importBoard(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !me) {
      return
    }
    const result = await ingestCrmFile(file, me)
    if (!result.ok) {
      window.alert(importErrorMessage(result))
      return
    }
    if (result.mode === 'replace' && result.board) {
      persist({
        ...result.board,
        goals: result.board.goals.length > 0 ? result.board.goals : board.goals,
        activity: [
          {
            id: newId(),
            at: new Date().toISOString(),
            by: me,
            text: `Restaurou o quadro da mesa (${result.accounts.length} contas).`,
          },
          ...board.activity,
        ],
      })
      setImportNotice(`Quadro restaurado: ${result.accounts.length} contas.`)
      return
    }
    const merged = mergeImportedAccounts(board, result.accounts, me)
    persist(merged.board)
    setImportNotice(
      `Base importada: ${merged.added} novas, ${merged.filled} completadas. ${merged.board.accounts.length} contas na mesa.`,
    )
    navigate('/admin/crm')
  }

  if (!me) {
    return (
      <div className="admin-desk min-h-svh bg-[#f3efe6] text-[#050505]">
        <AdminLogin error={loginError} onSubmit={login} />
      </div>
    )
  }

  const meta = pageMeta(deskPage(location.pathname))
  const dueCount = dueAccounts.length || dueQueue(board.accounts).length

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
                    board={{
                      ...board,
                      accounts:
                        dueAccounts.length > 0 ? dueAccounts : board.accounts,
                    }}
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
                    me={me}
                    selectedId={selectedId}
                    query={query}
                    onQuery={setQuery}
                    creating={creating}
                    importNotice={importNotice}
                    reloadToken={reloadToken}
                    onCreatingChange={setCreating}
                    onSelect={setSelectedId}
                    onCreate={createAccount}
                    onSave={saveAccount}
                    onDelete={deleteAccount}
                    onImport={(event) => void importBoard(event)}
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
