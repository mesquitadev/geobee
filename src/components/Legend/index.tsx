import React from 'react'
import { tw } from '../../utils/tw'

const Legend = () => {
  const legendItems = [
    { label: 'ARBOREO', color: '#006400' },
    { label: 'ARBUSTIVO', color: '#006400' },
    { label: 'URBANO', color: '#FF0000' },
    { label: 'SOLO EXPOSTO', color: '#FFA500' },
    { label: 'HERBACEO', color: '#006401' },
    { label: "Corpos D'água", color: '#0000FF' },
  ]

  return (
    <div
      className={tw(
        'mb-2 rounded-lg border border-gray-300 bg-white p-3 shadow-lg',
        'dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-900/30',
        'w-full',
      )}
    >
      <h4
        className={tw(
          'mb-2 text-sm font-bold',
          'text-zinc-800 dark:text-zinc-100',
        )}
        style={{ cursor: 'default' }}
      >
        Legenda
      </h4>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
        {legendItems.map((item) => (
          <li
            key={item.label}
            className={tw(
              'flex items-center text-xs',
              'text-zinc-700 dark:text-zinc-200',
            )}
          >
            <span
              className="mr-2 inline-block h-4 w-4 rounded"
              style={{ backgroundColor: item.color }}
            ></span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Legend
