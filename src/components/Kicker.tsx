import type { ReactNode } from 'react'
import { useInViewOnce } from '@/lib/use-in-view-once'
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
  const [ref, visible] = useInViewOnce<HTMLParagraphElement>()

  return (
    <p
      ref={ref}
      className={cn(
        'font-mark text-[10px] font-medium tracking-[0.2em] uppercase',
        className,
      )}
    >
      {rule ? (
        <span
          className={cn(
            'mb-3.5 block h-px w-11 origin-left bg-bronze transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:scale-x-100 motion-reduce:transition-none',
            visible ? 'scale-x-100' : 'scale-x-0',
          )}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </p>
  )
}
