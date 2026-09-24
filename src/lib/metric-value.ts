export type MetricParts = {
  target: number
  decimals: number
  suffix: string
  animated: boolean
}

export function parseMetricValue(raw: string): MetricParts {
  const match = /^(\d+(?:\.\d+)?)([A-Za-z]*)$/.exec(raw.trim())
  if (!match) {
    return { target: 0, decimals: 0, suffix: '', animated: false }
  }

  const numeric = match[1]
  const suffix = match[2] ?? ''
  const dot = numeric.indexOf('.')
  const decimals = dot === -1 ? 0 : numeric.length - dot - 1

  return {
    target: Number(numeric),
    decimals,
    suffix,
    animated: Number.isFinite(Number(numeric)),
  }
}

export function formatMetricValue(
  value: number,
  decimals: number,
  suffix: string,
): string {
  const amount =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))
  return `${amount}${suffix}`
}
