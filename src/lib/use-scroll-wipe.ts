import { useEffect, useRef, useState, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * Maps the element's position in the viewport to a left-to-right reveal.
 * 0 = fully hidden (cream), 1 = fully wiped. Progress stays low while the
 * block sits in the lower third, so a composed shot with content above
 * still shows a partial bar.
 */
export function useScrollWipe(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(1)
      return
    }

    const el = ref.current
    if (!el) return

    let frame = 0

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh
      const end = vh * 0.32
      const next = (start - rect.top) / (start - end)
      setProgress(Math.min(1, Math.max(0, next)))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return [ref, progress]
}
