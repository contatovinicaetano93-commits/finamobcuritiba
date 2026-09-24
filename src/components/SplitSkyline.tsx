import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SplitSkylineProps = {
  id?: string
  photo: string
  children: ReactNode
  minHeightClass?: string
}

export function SplitSkyline({
  id,
  photo,
  children,
  minHeightClass = 'min-h-[62svh] sm:min-h-[70svh]',
}: SplitSkylineProps) {
  return (
    <section
      id={id}
      className="scroll-mt-20 overflow-hidden bg-[#050505] text-white"
    >
      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        <div
          className={cn(
            'flex flex-col justify-end px-4 py-16 sm:px-6 lg:pr-14',
            minHeightClass,
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            'relative hidden bg-[#050505] lg:block',
            minHeightClass,
          )}
        >
          <img
            src={photo}
            alt=""
            className="absolute inset-0 size-full object-cover object-[72%_center]"
          />
          <div
            className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-black to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}

