import type { ReactNode } from 'react'
import {
  partnerById,
  partnerTone,
  statusLabel,
  statusTone,
  type AccountStatus,
  type PartnerId,
} from '@/data/admin'
import { cn } from '@/lib/utils'

export function OwnerMark({
  id,
  className,
}: {
  id: PartnerId | null
  className?: string
}) {
  const label = id ? partnerById(id).short : '—'
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide',
        partnerTone(id),
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

export function StatusPill({
  status,
  className,
}: {
  status: AccountStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        statusTone(status),
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#7a6648] uppercase">
      {children}
    </p>
  )
}

export function ProgressTrack({
  value,
  goal,
  className,
  tone = 'paper',
}: {
  value: number
  goal: number
  className?: string
  tone?: 'paper' | 'ink'
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div
      className={cn(
        'mt-4 h-1.5 overflow-hidden rounded-full',
        tone === 'ink' ? 'bg-white/20' : 'bg-[#12110f]/12',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          tone === 'ink' ? 'bg-[#c4b49a]' : 'bg-[#7a6648]',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-[#12110f] text-white'
          : 'border border-[rgb(18_17_15/0.18)] bg-white text-[#3f3b34] hover:border-[rgb(18_17_15/0.35)] hover:text-[#12110f]',
      )}
    >
      {label}
    </button>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="admin-surface rounded-xl px-6 py-14 text-center">
      <div className="mx-auto mb-4 h-px w-14 bg-[#7a6648]" />
      <p className="font-heading text-2xl tracking-tight text-[#12110f]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#3f3b34]">
        {body}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function PageIntro({
  kicker,
  title,
  children,
  action,
}: {
  kicker: string
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{kicker}</Eyebrow>
        <h1 className="font-heading mt-2 text-3xl tracking-tight text-[#12110f] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#3f3b34]">{children}</p>
      </div>
      {action}
    </header>
  )
}
