import { apiSlice } from '../../services/apiSlice'

export interface User {
  id: string
  fullName: string
  email: string
  role: string[]
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['Users'],
    }),
    login: builder.mutation<
      {
        access_token: string
      },
      { username: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body: new URLSearchParams(body as Record<string, string>).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation } = usersApiSlice
