import { apiSlice } from '../../services/apiSlice'

export interface Meliponary {
  id: string
  name: string
  // adicione outros campos conforme necessário
}

export const meliponaryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMeliponaries: builder.query<Meliponary[], void>({
      query: () => 'meliponary/',
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Meliponaries' as const, id }))
          : ['Meliponaries'],
    }),
    getMeliponary: builder.query<Meliponary, string>({
      query: (id) => `/meliponary/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Meliponaries', id }],
    }),
    createMeliponary: builder.mutation<void, Partial<Meliponary>>({
      query: (data) => ({
        url: 'meliponary/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meliponaries'],
    }),
    updateMeliponary: builder.mutation<void, Meliponary>({
      query: (data) => ({
        url: `meliponary/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Meliponaries', id },
      ],
    }),
    deleteMeliponary: builder.mutation<void, string>({
      query: (id) => ({
        url: `meliponary/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Meliponaries', id }],
    }),
  }),
})

export const {
  useGetMeliponariesQuery,
  useGetMeliponaryQuery,
  useCreateMeliponaryMutation,
  useUpdateMeliponaryMutation,
  useDeleteMeliponaryMutation,
} = meliponaryApiSlice
