import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Kicker({
  children,
  className,
  rule = true,
}: {
  children: ReactNode
  className?: string
  rule?: boolean
}) {
  return (
    <p
      className={cn(
        'font-mark text-[10px] font-medium tracking-[0.2em] uppercase',
        className,
      )}
    >
      {rule ? (
        <span
          className="mb-3.5 block h-px w-11 bg-bronze"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </p>
  )
}
