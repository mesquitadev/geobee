import logo from '../../assets/logo-geobee.svg'
import { Controller, useForm } from 'react-hook-form'
import { useLoading } from '../../hooks/useLoading.tsx'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { removeMask, validarCPF } from '../../utils'
import { useCallback } from 'react'
import { useRegisterMutation } from '../../redux/slices/usersSlice'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const SignUp = () => {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [registerUser] = useRegisterMutation()
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(signUpFormSchema),
  })

  const handleSignUp = useCallback(
    async (data: Record<string, any>) => {
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
        toast.success('Cadastro realizado com sucesso!')
        navigate('/')
      } catch (err) {
        toast.error('Erro no cadastro! Verifique os dados inseridos.')
        setLoading(false)
      } finally {
        setLoading(false)
      }
    },
    [navigate, setLoading, registerUser],
  )

  const profileOptions = [
    { label: 'Apicultor', value: 'Apicultor' },
    { label: 'Meliponicultor', value: 'Meliponicultor' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-green-50 px-4 py-12 dark:from-emerald-950/20 dark:via-background dark:to-green-950/20">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img className="h-20 w-auto" src={logo} alt="GeoBEE" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">
              Crie sua conta
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para se cadastrar na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(handleSignUp)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    className={
                      errors.fullName
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className={
                      errors.cpf
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('cpf')}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={
                      errors.email
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    className={
                      errors.phone
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Eu sou um:</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        className={
                          errors.role
                            ? 'border-destructive focus:ring-destructive'
                            : ''
                        }
                      >
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {profileOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className={
                      errors.password
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    className={
                      errors.confirmPassword
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                size="lg"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link
            className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
            to="/"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}
export default SignUp
