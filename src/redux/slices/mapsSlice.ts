import { apiSlice } from '../../services/apiSlice'

export interface Map {
  id: string
  name: string
  // adicione outros campos conforme necessário
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
    createMap: builder.mutation<void, Partial<Map>>({
      query: (data) => ({
        url: 'maps/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Maps'],
    }),
    updateMap: builder.mutation<void, Map>({
      query: (data) => ({
        url: `maps/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Maps', id }],
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
  useCreateMapMutation,
  useUpdateMapMutation,
  useDeleteMapMutation,
} = mapsApiSlice
