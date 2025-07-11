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
import { setToken } from '../../utils/auth'
import { useSnackbar } from 'notistack'

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
    if (!loading) {
      const result = await signIn(values)
      if (result) {
        enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' })
        navigate('/home', { replace: true })
      } else {
        enqueueSnackbar('Erro ao fazer login. Verifique suas credenciais.', {
          variant: 'error',
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 dark:bg-zinc-900 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-32 w-auto" src={logo} alt="Your Company" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          BeeMAPPER | Entrar
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(handleSignIn)} className="w-full max-w-lg">
          <div className="-mx-3 mb-6 flex flex-wrap">
            <InputContainer className="w-full px-3">
              <InputLabel label="Email" name="username" />
              <Input
                className="mb-3 block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                control={control}
                name="username"
                placeholder="Digite seu Email..."
                errors={errors?.username?.message}
              />
            </InputContainer>

            <InputContainer className="w-full px-3">
              <InputLabel label="Senha" name="password" />
              <Input
                className="mb-3 block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                control={control}
                name="password"
                type="password"
                placeholder="Digite sua Senha..."
                errors={errors?.password?.message}
              />
            </InputContainer>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Entrar
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            to="/cadastre-se"
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
export default SignIn
