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
    <div className="mb-2 rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
      <h4 className="mb-2 text-sm font-bold">Legenda</h4>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
        {legendItems.map((item) => (
          <li key={item.label} className="flex items-center text-xs">
            <span
              className="mr-2 inline-block h-4 w-4"
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
