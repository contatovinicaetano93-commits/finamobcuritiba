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
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tracking-wide',
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
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
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
    <p className="text-[10px] tracking-[0.22em] text-[#9c8563] uppercase">
      {children}
    </p>
  )
}

export function ProgressTrack({
  value,
  goal,
  className,
}: {
  value: number
  goal: number
  className?: string
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div
      className={cn(
        'mt-4 h-1.5 overflow-hidden rounded-full bg-black/8',
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[#9c8563] transition-[width] duration-500"
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
        'rounded-full px-4 py-2 text-sm transition-colors',
        active
          ? 'bg-[#050505] text-white'
          : 'border border-black/12 bg-white text-black/70 hover:border-[#9c8563] hover:text-black',
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
    <div className="admin-surface rounded-2xl px-6 py-16 text-center">
      <div className="mx-auto mb-5 h-px w-16 bg-[#9c8563]/70" />
      <p className="font-heading text-2xl tracking-tight">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/55">
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
        <h1 className="font-heading mt-2 text-3xl tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-black/60">{children}</p>
      </div>
      {action}
    </header>
  )
}
