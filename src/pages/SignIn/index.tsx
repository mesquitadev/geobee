import logo from '../../assets/logo-geobee.svg'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'
import Input from '../../components/Input'
import InputContainer from '../../components/Input/Container.tsx'
import InputLabel from '../../components/Input/Label.tsx'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { LogIn } from 'lucide-react'

type Inputs = {
  username: string
  password: string
}

const SignIn = () => {
  const { signIn } = useAuth()
  const { loading } = useLoading()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const signInFormSchema = yup.object().shape({
    username: yup
      .string()
      .required('Este campo é obrigatório')
      .email('E-mail inválido'),
    password: yup.string().required('Este campo é obrigatório'),
  })
  const { handleSubmit, formState, control } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(signInFormSchema),
  })
  const { errors } = formState

  const handleSignIn: SubmitHandler<Inputs> = async (values) => {
    if (loading) return

    try {
      await signIn(values)
      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' })
      navigate('/home', { replace: true })
    } catch (error: any) {
      const message = error?.message || 'Erro inesperado. Tente novamente.'
      enqueueSnackbar(message, { variant: 'error' })
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Left panel - Brand */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 lg:flex lg:w-1/2">
        <div>
          <img className="h-16 w-auto brightness-0 invert" src={logo} alt="GeoBEE" />
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Gerencie seus apiários e meliponários com inteligência geoespacial.
          </h1>
          <p className="mt-4 text-lg text-indigo-200">
            Calcule capacidade de suporte, visualize mapas de vegetação e tome decisões baseadas em dados reais.
          </p>
        </div>
        <p className="text-sm text-indigo-300">
          GeoBEE &copy; {new Date().getFullYear()} - Todos os direitos reservados
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img className="h-20 w-auto" src={logo} alt="GeoBEE" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Entre com suas credenciais para acessar a plataforma
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-5">
              <InputContainer className="w-full">
                <InputLabel label="Email" name="username" />
                <Input
                  control={control}
                  name="username"
                  placeholder="seu@email.com"
                  errors={errors?.username?.message}
                />
              </InputContainer>

              <InputContainer className="w-full">
                <InputLabel label="Senha" name="password" />
                <Input
                  control={control}
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  errors={errors?.password?.message}
                />
              </InputContainer>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Não tem uma conta?{' '}
            <Link
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              to="/cadastre-se"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default SignIn
