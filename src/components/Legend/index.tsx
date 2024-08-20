const Legend = () => {
  const legendItems = [
    { label: 'ARBOREO', color: '#006400' },
    { label: 'URBANO', color: '#FF0000' },
    { label: 'SOLO EXPOSTO', color: '#FFA500' },
    { label: 'HERBACEO', color: '#006401' },
    { label: "Corpos D'água", color: '#0000FF' },
  ]

  return (
    <div
      className="absolute bottom-8 left-4 p-4 bg-white border border-gray-300 rounded-lg shadow-lg"
      style={{ zIndex: 9999 }}
    >
      <h4 className="mb-2 font-bold">Legenda</h4>
      <ul className="list-none p-0 m-0">
        {legendItems.map((item) => (
          <li key={item.label} className="flex items-center mb-1">
            <span
              className="w-5 h-5 mr-2 inline-block"
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
