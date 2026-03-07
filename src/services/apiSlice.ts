import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8443/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
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
  tagTypes: [
    'Meliponaries',
    'Maps',
    'Apiaries',
    'Meliponary',
    'Users',
    'GeoJson',
    'Dashboard',
    'MeliponaryAll',
  ],
  endpoints: () => ({}),
})
