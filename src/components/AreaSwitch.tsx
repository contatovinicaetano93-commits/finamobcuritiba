import { Link } from 'react-router-dom'
import {
  areaLabel,
  areaPath,
  otherArea,
  type AreaId,
} from '@/data/areas'

export function AreaSwitch({ current }: { current: AreaId }) {
  const next = otherArea(current)

  return (
    <p className="text-sm text-black/55">
      Este canal é para {areaLabel(current).toLowerCase()}.{' '}
      <Link to={areaPath(next)} className="underline underline-offset-4">
        Sou {areaLabel(next).toLowerCase()}
      </Link>
    </p>
  )
}
