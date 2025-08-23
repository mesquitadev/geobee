import { apiSlice } from '../../services/apiSlice'

export interface GeoJson {
  // Defina os campos conforme necessário para o seu geojson
  type: string
  features: any[]
}

export const geoJsonApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGeoJson: builder.query<GeoJson, string>({
      query: (url) => `/maps/content/${url}`,
      providesTags: (_result, _error, url) => [{ type: 'GeoJson', url }],
    }),
  }),
})

export const { useGetGeoJsonQuery } = geoJsonApiSlice
