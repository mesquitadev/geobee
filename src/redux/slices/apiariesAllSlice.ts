import { apiSlice } from '../../services/apiSlice'

export interface Apiary {
  id: string
  name: string
  latitude: string
  longitude: string
  capacidadeDeSuporte: string
  tipoInstalacao: string
  quantidadeColmeias: number
}

export interface Meliponary {
  id: string
  name: string
  latitude: string
  longitude: string
  capacidadeDeSuporte: string
  especieAbelha: string
  quantidadeColmeias: number
}

export interface DashboardData {
  apiarios: Apiary[]
  meliponarios: Meliponary[]
}

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardDataQuery } = dashboardApiSlice
