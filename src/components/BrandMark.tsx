import { cn } from '@/lib/utils'

type BrandMarkProps = {
  variant?: 'light' | 'dark'
  className?: string
}

export function BrandMark({ variant = 'light', className }: BrandMarkProps) {
  const isLight = variant === 'light'
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative h-10 w-3.5 shrink-0',
          isLight ? 'text-white' : 'text-black',
        )}
        aria-hidden="true"
      >
        <span className="absolute inset-y-0 left-1/2 w-[2.5px] -translate-x-1/2 rounded-full bg-current" />
        <span className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-mark text-[15px] tracking-[0.22em]',
            isLight ? 'text-white' : 'text-black',
          )}
        >
          FINAMOB
        </span>
        <span
          className={cn(
            'mt-1 font-mark text-[9px] tracking-[0.38em]',
            isLight ? 'text-white/80' : 'text-black/70',
          )}
        >
          CURITIBA
        </span>
      </span>
    </span>
  )
}
