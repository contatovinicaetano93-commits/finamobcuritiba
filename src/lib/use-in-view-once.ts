import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && prefersReducedMotion(),
  )

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return

    if (prefersReducedMotion()) {
      setVisible(true)
      return
    }

    let frameA = 0
    let frameB = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        frameA = requestAnimationFrame(() => {
          frameB = requestAnimationFrame(() => setVisible(true))
        })
      },
      { threshold: 0.45, rootMargin: '0px 0px -12% 0px' },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameA)
      cancelAnimationFrame(frameB)
    }
  }, [visible])

  return [ref, visible] as const
}
