import { apiSlice } from '../../services/apiSlice'

export interface Meliponary {
  id: string
  name: string
  // adicione outros campos conforme necessário
}

export const meliponaryAllApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMeliponaries: builder.query<Meliponary[], void>({
      query: () => '/meliponary/all',
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'MeliponaryAll' as const, id }))
          : ['MeliponaryAll'],
    }),
  }),
})

export const { useGetAllMeliponariesQuery } = meliponaryAllApiSlice
