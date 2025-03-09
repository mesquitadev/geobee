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
    <div className="absolute bottom-20 left-4 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
      <h4 className="mb-2 font-bold">Legenda</h4>
      <ul className="m-0 list-none p-0">
        {legendItems.map((item) => (
          <li key={item.label} className="mb-1 flex items-center">
            <span
              className="mr-2 inline-block h-5 w-5"
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
