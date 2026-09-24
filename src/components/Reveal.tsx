import type { ReactNode } from 'react'
import { useInViewOnce } from '@/lib/use-in-view-once'
import { cn } from '@/lib/utils'

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [ref, visible] = useInViewOnce<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
