import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

export interface LocationCardProps {
  id: string
  name: string
  latitude: string | number
  longitude: string | number
  capacity?: string | number
  typeBadge?: string
  variant: 'apiary' | 'meliponary'
  isHighlighted?: boolean
  onClick?: () => void
}

function truncateCoord(value: string | number, decimals = 4): string {
  const num = Number(value)
  if (isNaN(num)) return String(value)
  return num.toFixed(decimals)
}

export function LocationCard({
  name,
  latitude,
  longitude,
  capacity,
  typeBadge,
  variant,
  isHighlighted,
  onClick,
}: LocationCardProps) {
  return (
    <div
      className={cn(
        'group cursor-pointer rounded-lg border bg-card p-3 transition-all hover:shadow-sm',
        isHighlighted
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/40',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn(
            'truncate text-sm font-medium',
            isHighlighted && 'text-primary'
          )}>{name}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {truncateCoord(latitude)}, {truncateCoord(longitude)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {capacity != null && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              Cap: {capacity}
            </Badge>
          )}
          {typeBadge && (
            <Badge
              variant={variant === 'meliponary' ? 'default' : 'outline'}
              className="text-[10px]"
            >
              {typeBadge}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
