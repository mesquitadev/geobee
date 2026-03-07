import { apiSlice } from '../../services/apiSlice'

export interface User {
  id: string
  fullName: string
  cpf: string
  email: string
  phone: string
  role: string[]
  perfis: string[]
  profiles: string[]
  isActive: boolean
  maxLocations: number
  createdAt: string
  updatedAt: string
}

export interface UserConfig {
  is_active: boolean
  max_locations: number
  profiles: number[]
  perfis: string[]
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['Users'],
    }),
    getUsers: builder.query<User[], void>({
      query: () => '/users/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    login: builder.mutation<
      { access_token: string },
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
    register: builder.mutation<
      User,
      {
        fullName: string
        cpf: string
        email: string
        phone: string
        role?: string
        password: string
      }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    activateUser: builder.mutation<{ detail: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Users', id: userId },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    deactivateUser: builder.mutation<{ detail: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Users', id: userId },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    updateLimits: builder.mutation<
      { detail: string },
      { userId: string; max_locations?: number }
    >({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/limits`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'Users', id: userId },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    getUserConfig: builder.query<UserConfig, string>({
      query: (userId) => `/users/${userId}/config`,
      providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
    }),
    recuperarSenha: builder.mutation<{ detail: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/recuperar-senha',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation<
      { detail: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/users/me/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetMeQuery,
  useGetUsersQuery,
  useLoginMutation,
  useRegisterMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useUpdateLimitsMutation,
  useGetUserConfigQuery,
  useRecuperarSenhaMutation,
  useChangePasswordMutation,
} = usersApiSlice
