import { cn } from '@/lib/utils'

interface SpaceIndicatorProps {
  used: number
  max: number
  apiariesCount: number
  meliponariesCount: number
  collapsed: boolean
}

export function SpaceIndicator({
  used,
  max,
  apiariesCount,
  meliponariesCount,
  collapsed,
}: SpaceIndicatorProps) {
  const percentage = max > 0 ? (used / max) * 100 : 0
  const colorClass =
    percentage >= 90
      ? 'bg-destructive'
      : percentage >= 70
        ? 'bg-accent'
        : 'bg-primary'

  if (collapsed) return null

  return (
    <div className="space-y-2 px-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Locais usados</span>
        <span>
          {used}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', colorClass)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{apiariesCount} apiarios</span>
        <span>{meliponariesCount} meliponarios</span>
      </div>
    </div>
  )
}
