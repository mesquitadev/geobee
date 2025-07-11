import React from 'react'
import { Hexagon, AlertCircle, Folder } from 'lucide-react'

interface UsedSpaceProps {
  usedCount?: number
  maxCount?: number
  userRoles?: string[]
}

const UsedSpace = ({
  usedCount = 2,
  maxCount = 3,
  userRoles = [],
}: UsedSpaceProps) => {
  // Determina o tipo baseado nas roles do usuário
  const isApicultor = userRoles.includes('APICULTOR')
  const isMeliponicultor = userRoles.includes('MELIPONICULTOR')

  // Se for admin, mostra apiários por padrão, senão baseado na role específica
  const type =
    isMeliponicultor && !isApicultor
      ? 'meliponários'
      : isApicultor
      ? 'colméias'
      : 'apiários'

  const icon = type === 'colméias' ? Hexagon : Folder

  const usedPercentage = Math.round((usedCount / maxCount) * 100)
  const isHighUsage = usedPercentage >= 80
  const remainingCount = maxCount - usedCount

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 dark:from-violet-900/20 dark:to-purple-900/20">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center bg-violet-100 dark:bg-violet-900/50">
          {React.createElement(icon, {
            className: 'h-4 w-4 text-violet-600 dark:text-violet-400',
          })}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {type === 'colméias'
              ? 'Colméias'
              : type === 'meliponários'
              ? 'Meliponários'
              : 'Apiários'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {usedCount} de {maxCount} {type}
          </p>
        </div>
        {isHighUsage && <AlertCircle className="h-4 w-4 text-amber-500" />}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            {usedCount} em uso
          </span>
          <span className="text-gray-500 dark:text-gray-500">
            {remainingCount} disponível
            {remainingCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isHighUsage
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : 'bg-gradient-to-r from-violet-500 to-purple-500'
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        {isHighUsage && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Limite de {type} quase atingido. Considere fazer upgrade.
          </p>
        )}

        {usedCount >= maxCount && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            Limite máximo de {type} atingido.
          </p>
        )}
      </div>
    </div>
  )
}

export default UsedSpace
