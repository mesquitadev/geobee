import { apiSlice } from '../../services/apiSlice'

export interface Map {
  id: string
  name: string
  file_name: string
  active: boolean
  feature_count: number
  createdAt: string
  updatedAt: string
}

export const mapsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMaps: builder.query<Map[], void>({
      query: () => 'maps/',
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Maps' as const, id }))
          : ['Maps'],
    }),
    getMap: builder.query<Map, string>({
      query: (id) => `maps/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Maps', id }],
    }),
    uploadMaps: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: 'maps/upload/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Maps'],
    }),
    deleteMap: builder.mutation<void, string>({
      query: (id) => ({
        url: `maps/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Maps', id }],
    }),
  }),
})

export const {
  useGetMapsQuery,
  useGetMapQuery,
  useUploadMapsMutation,
  useDeleteMapMutation,
} = mapsApiSlice
