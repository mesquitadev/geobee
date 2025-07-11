import { apiSlice } from '../../services/apiSlice'

export interface Apiary {
  capacidadeDeSuporte: ReactNode
  id: string
  name: string
  // adicione outros campos conforme necessário
}

export const apiariesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApiaries: builder.query<Apiary[], void>({
      query: () => '/apiaries/',
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Apiaries' as const, id }))
          : ['Apiaries'],
    }),
    getApiary: builder.query<Apiary, string>({
      query: (id) => `/apiary/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Apiaries', id }],
    }),
    createApiary: builder.mutation<void, Partial<Apiary>>({
      query: (data) => ({
        url: '/apiaries/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Apiaries'],
    }),
    updateApiary: builder.mutation<void, Apiary>({
      query: (data) => ({
        url: `/apiaries/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Apiaries', id }],
    }),
    deleteApiary: builder.mutation<void, string>({
      query: (id) => ({
        url: `/apiaries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Apiaries', id }],
    }),
  }),
})

export const {
  useGetApiariesQuery,
  useGetApiaryQuery,
  useCreateApiaryMutation,
  useUpdateApiaryMutation,
  useDeleteApiaryMutation,
} = apiariesApiSlice
