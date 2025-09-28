export async function fetchGeoJsonByUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erro ao buscar GeoJSON: ${response.statusText}`)
  }
  return response.json()
}

