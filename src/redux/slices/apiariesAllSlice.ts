import { apiSlice } from '../../services/apiSlice'

export interface Apiary {
  id: string
  name: string
  // adicione outros campos conforme necessário
}

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<Apiary[], void>({
      query: () => '/dashboard',
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Dashboard' as const, id }))
          : ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardDataQuery } = dashboardApiSlice
