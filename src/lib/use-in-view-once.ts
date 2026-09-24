import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.45,
) {
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
      { threshold, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameA)
      cancelAnimationFrame(frameB)
    }
  }, [threshold, visible])

  return [ref, visible] as const
}

export function useInViewPlay(holdMs = 560) {
  const ref = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(() =>
    typeof window !== 'undefined' && prefersReducedMotion(),
  )

  useEffect(() => {
    const node = ref.current
    if (!node || playing) return

    if (prefersReducedMotion()) {
      setPlaying(true)
      return
    }

    let timeout = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.55) {
          if (timeout) return
          timeout = window.setTimeout(() => {
            observer.disconnect()
            setPlaying(true)
          }, holdMs)
          return
        }

        window.clearTimeout(timeout)
        timeout = 0
      },
      {
        threshold: [0.2, 0.4, 0.55, 0.7, 0.9],
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [holdMs, playing])

  return [ref, playing] as const
}
