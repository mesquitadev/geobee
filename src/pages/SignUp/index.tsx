import logo from '../../assets/logo-geobee.svg'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLoading } from '../../hooks/useLoading.tsx'
import Input from '../../components/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import InputLabel from '../../components/Input/Label.tsx'
import InputContainer from '../../components/Input/Container.tsx'
import SelectContainer from '../../components/Select/Container.tsx'
import Select from '../../components/Select'
import { removeMask, validarCPF } from '../../utils'
import { useCallback } from 'react'
import { useRegisterMutation } from '../../redux/slices/usersSlice'
import { enqueueSnackbar } from 'notistack'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

type Inputs = {
  fullName: string
  cpf: string
  email: string
  phone: string
  role: string
  password: string
}

const SignUp = () => {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [registerUser] = useRegisterMutation()
  const signUpFormSchema = yup.object().shape({
    fullName: yup.string().required('Este campo é obrigatório'),
    cpf: yup
      .string()
      .required('Este campo é obrigatório')
      .test('test-invalid-cpf', 'CPF Inválido', (cpf: string | undefined) =>
        validarCPF(cpf),
      ),
    email: yup
      .string()
      .required('Este campo é obrigatório')
      .email('E-mail inválido'),
    phone: yup.string().required('Este campo é obrigatório'),
    role: yup.string().optional(),
    password: yup
      .string()
      .required('Este campo é obrigatório')
      .min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: yup
      .string()
      .required('Confirmação de senha é obrigatória')
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .oneOf([yup.ref('password'), null], 'As senhas devem corresponder'),
  })
  const { handleSubmit, formState, control } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(signUpFormSchema),
  })
  const { errors } = formState

  const handleSignUp: SubmitHandler<Inputs> = useCallback(
    async (data: Inputs) => {
      setLoading(true)
      try {
        const { fullName, cpf, phone, role, password, email } = data
        data.cpf = removeMask(data.cpf)
        await registerUser({
          fullName,
          cpf,
          phone,
          role,
          password,
          email,
        }).unwrap()
        enqueueSnackbar('Cadastro realizado com sucesso!', {
          variant: 'success',
        })
        navigate('/')
      } catch (err) {
        enqueueSnackbar('Erro no cadastro! Verifique os dados inseridos.', {
          variant: 'error',
        })
        setLoading(false)
      } finally {
        setLoading(false)
      }
    },
    [navigate, setLoading, registerUser],
  )

  const options = [
    { label: 'Apicultor', value: 'Apicultor' },
    { label: 'Meliponicultor', value: 'Meliponicultor' },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Left panel - Brand */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 lg:flex lg:w-5/12">
        <div>
          <img className="h-16 w-auto brightness-0 invert" src={logo} alt="GeoBEE" />
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Faça parte da plataforma de gestão apícola mais inteligente do Brasil.
          </h1>
          <p className="mt-4 text-lg text-indigo-200">
            Cadastre-se e comece a gerenciar seus apiários com tecnologia geoespacial.
          </p>
        </div>
        <p className="text-sm text-indigo-300">
          GeoBEE &copy; {new Date().getFullYear()} - Todos os direitos reservados
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-7/12">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img className="h-20 w-auto" src={logo} alt="GeoBEE" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Crie sua conta
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Preencha os dados abaixo para se cadastrar na plataforma
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputContainer className="w-full">
                  <InputLabel label="Nome Completo" name="fullName" />
                  <Input
                    control={control}
                    name="fullName"
                    placeholder="Seu nome completo"
                    errors={errors?.fullName?.message}
                  />
                </InputContainer>

                <InputContainer className="w-full">
                  <InputLabel label="CPF" name="cpf" />
                  <Input
                    control={control}
                    name="cpf"
                    placeholder="000.000.000-00"
                    errors={errors?.cpf?.message}
                  />
                </InputContainer>

                <InputContainer className="w-full">
                  <InputLabel label="Email" name="email" />
                  <Input
                    control={control}
                    name="email"
                    placeholder="seu@email.com"
                    errors={errors?.email?.message}
                  />
                </InputContainer>

                <InputContainer className="w-full">
                  <InputLabel label="Telefone" name="phone" />
                  <Input
                    control={control}
                    name="phone"
                    placeholder="(00) 00000-0000"
                    errors={errors?.phone?.message}
                  />
                </InputContainer>
              </div>

              <SelectContainer className="w-full">
                <InputLabel label="Eu sou um:" name="role" />
                <Select
                  options={options}
                  control={control}
                  name="role"
                  errors={errors?.role?.message}
                />
              </SelectContainer>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputContainer className="w-full">
                  <InputLabel label="Senha" name="password" />
                  <Input
                    control={control}
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    errors={errors?.password?.message}
                  />
                </InputContainer>

                <InputContainer className="w-full">
                  <InputLabel label="Confirmar Senha" name="confirmPassword" />
                  <Input
                    control={control}
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    errors={errors?.confirmPassword?.message}
                  />
                </InputContainer>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Já tem uma conta?{' '}
            <Link
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              to="/"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default SignUp
