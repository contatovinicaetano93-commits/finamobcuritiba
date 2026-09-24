import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  formatMetricValue,
  parseMetricValue,
} from '@/lib/metric-value'
import { cn } from '@/lib/utils'

const CountUpPlayContext = createContext<boolean | null>(null)

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CountUpGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const node = nodeRef.current
    if (!node || playing) return

    if (prefersReducedMotion()) {
      setPlaying(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setPlaying(true)
        observer.disconnect()
      },
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [playing])

  return (
    <CountUpPlayContext.Provider value={playing}>
      <div ref={nodeRef} className={className}>
        {children}
      </div>
    </CountUpPlayContext.Provider>
  )
}

export function CountUp({
  value,
  className,
  duration = 1800,
  delay = 0,
}: {
  value: string
  className?: string
  duration?: number
  delay?: number
}) {
  const groupPlaying = useContext(CountUpPlayContext)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const parts = parseMetricValue(value)
  const [display, setDisplay] = useState(() => {
    if (typeof window !== 'undefined' && prefersReducedMotion()) {
      return value
    }
    return parts.animated
      ? formatMetricValue(0, parts.decimals, parts.suffix)
      : value
  })

  useEffect(() => {
    if (!parts.animated) {
      setDisplay(value)
      return
    }

    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }

    let frame = 0
    let timeout = 0
    let cancelled = false
    let observer: IntersectionObserver | undefined

    const play = () => {
      timeout = window.setTimeout(() => {
        const startedAt = performance.now()
        const tick = (now: number) => {
          if (cancelled) return
          const progress = Math.min(1, (now - startedAt) / duration)
          setDisplay(
            progress >= 1
              ? value
              : formatMetricValue(
                  parts.target * easeOutCubic(progress),
                  parts.decimals,
                  parts.suffix,
                ),
          )
          if (progress < 1) {
            frame = requestAnimationFrame(tick)
          }
        }
        frame = requestAnimationFrame(tick)
      }, delay)
    }

    if (groupPlaying === true) {
      play()
    } else if (groupPlaying === null) {
      const node = nodeRef.current
      if (!node) return
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          play()
        },
        { threshold: 0.4 },
      )
      observer.observe(node)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      window.clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [
    delay,
    duration,
    groupPlaying,
    parts.animated,
    parts.decimals,
    parts.suffix,
    parts.target,
    value,
  ])

  return (
    <span ref={nodeRef} className={cn('relative inline-block', className)}>
      <span className="invisible" aria-hidden="true">
        {value}
      </span>
      <span className="absolute inset-0 tabular-nums" aria-hidden="true">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
