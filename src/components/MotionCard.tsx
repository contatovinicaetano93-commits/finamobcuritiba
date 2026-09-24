import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function MotionCard({
  children,
  className,
  tone = 'dark',
}: {
  children: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <article
      className={cn(
        'group relative transition-colors duration-300 motion-reduce:transition-none',
        tone === 'dark'
          ? 'bg-[#0b0b0b] hover:bg-[#1c1914]'
          : 'bg-white hover:bg-[#efe8d8]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-bronze transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
      />
      {children}
    </article>
  )
}
