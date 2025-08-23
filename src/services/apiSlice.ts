import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.geobeeam.com.br/api/v1',
    prepareHeaders: (headers) => {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('GeoToken='))
        ?.split('=')[1]
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Maps', 'Apiaries', 'Meliponary', 'Users', 'GeoJson'],
  endpoints: () => ({}),
})
