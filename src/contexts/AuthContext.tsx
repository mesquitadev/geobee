import { createContext, ReactNode, useCallback, useState } from 'react'
import Cookies from 'js-cookie'
import { useLoading } from '../hooks/useLoading'
import { useSnackbar } from 'notistack'
import { useLoginMutation } from '../redux/slices/usersSlice'

interface AuthState {
  token: string
}

interface SignInCredentials {
  username: string
  password: string
}

export interface AuthContextData {
  token: string

  signIn(credentials: SignInCredentials): Promise<void>

  signOut(): void
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setLoading } = useLoading()
  const { enqueueSnackbar } = useSnackbar()
  const [data, setData] = useState<AuthState>(() => {
    const token = Cookies.get('GeoToken')

    if (token) {
      return { token }
    }

    return {} as AuthState
  })
  const [login] = useLoginMutation()

  const signIn = useCallback(
    async ({ username, password }: SignInCredentials): Promise<void> => {
      setLoading(true)
      try {
        const result = await login({ username, password }).unwrap()
        if (result && result.access_token) {
          Cookies.set('GeoToken', String(result.access_token), { expires: 7 })
          setData({ token: String(result.access_token) })
        }
      } catch (err: any) {
        // Só mostra erro se realmente não houver token
        if (!err?.data?.access_token) {
          enqueueSnackbar({
            message:
              'Erro na autenticação! Ocorreu um erro ao fazer login, verifique as credenciais inseridas',
            variant: 'error',
          })
          if (err?.data?.message) {
            enqueueSnackbar({
              message: `Erro: ${err.data.message}`,
              variant: 'error',
            })
          }
        }
      } finally {
        setLoading(false)
      }
    },
    [login, setLoading, enqueueSnackbar, setData],
  )

  const signOut = useCallback(() => {
    Cookies.remove('GeoToken')
    setData({} as AuthState)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token: data.token,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }
