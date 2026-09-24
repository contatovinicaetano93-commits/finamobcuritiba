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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.28, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return [ref, visible] as const
}
