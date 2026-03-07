import React from 'react'
import { tw } from '../../utils/tw'

interface UsedSpaceProps {
  apiariesCount?: number
  meliponariesCount?: number
  maxLocations: number
}

const UsedSpace: React.FC<UsedSpaceProps> = ({
  apiariesCount = 0,
  meliponariesCount = 0,
  maxLocations,
}) => {
  const totalUsed = apiariesCount + meliponariesCount
  const percentage = maxLocations > 0 ? (totalUsed / maxLocations) * 100 : 0

  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Locais</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {totalUsed}/{maxLocations}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={tw(
            'h-1.5 rounded-full transition-all duration-300',
            percentage < 70
              ? 'bg-green-500'
              : percentage < 90
                ? 'bg-yellow-500'
                : 'bg-red-500',
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {(apiariesCount > 0 || meliponariesCount > 0) && (
        <div className="mt-1.5 flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {apiariesCount > 0 && <span>{apiariesCount} apiario(s)</span>}
          {meliponariesCount > 0 && (
            <span>{meliponariesCount} meliponario(s)</span>
          )}
        </div>
      )}
    </div>
  )
}

export default UsedSpace
