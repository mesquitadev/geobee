import { apiSlice } from '../../services/apiSlice'

export interface GeoJson {
  // Defina os campos conforme necessário para o seu geojson
  type: string
  features: any[]
}
// Removido o endpoint getGeoJson, pois a busca será feita por função utilitária fetchGeoJsonByUrl
