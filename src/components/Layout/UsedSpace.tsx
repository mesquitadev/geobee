import React from 'react'
import { tw } from '../../utils/tw'

interface UsedSpaceProps {
  apiariesCount?: number
  meliponariesCount?: number
  maxCount: number
  userRoles: string[]
}

const UsedSpace: React.FC<UsedSpaceProps> = ({
  apiariesCount = 0,
  meliponariesCount = 0,
  maxCount,
  userRoles,
}) => {
  const hasApicultorRole = userRoles.includes('APICULTOR')
  const hasMeliponicultorRole = userRoles.includes('MELIPONICULTOR')

  // Calcula o percentual baseado no maior uso entre apiários e meliponários
  const maxUsed = Math.max(apiariesCount, meliponariesCount)
  const percentage = (maxUsed / maxCount) * 100

  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
      <div className="space-y-1">
        {hasApicultorRole && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Apiários:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {apiariesCount}/{maxCount}
            </span>
          </div>
        )}

        {hasMeliponicultorRole && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Meliponários:
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {meliponariesCount}/{maxCount}
            </span>
          </div>
        )}

        {/* Se não tiver nenhum dos dois roles, mostra genérico */}
        {!hasApicultorRole && !hasMeliponicultorRole && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Locais:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              0/{maxCount}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={tw(
            'h-2 rounded-full transition-all duration-300',
            percentage < 70
              ? 'bg-green-500'
              : percentage < 90
              ? 'bg-yellow-500'
              : 'bg-red-500',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Limite: {maxCount} por usuário
      </div>
    </div>
  )
}

export default UsedSpace
