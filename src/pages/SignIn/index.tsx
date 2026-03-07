import logo from '../../assets/logo-geobee.svg'
import { Resolver, useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogIn, Leaf } from 'lucide-react'
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

type Inputs = {
  username: string
  password: string
}

const signInFormSchema = yup.object().shape({
  username: yup
    .string()
    .required('Este campo é obrigatório')
    .email('E-mail inválido'),
  password: yup.string().required('Este campo é obrigatório'),
})

const SignIn = () => {
  const { signIn } = useAuth()
  const { loading } = useLoading()
  const navigate = useNavigate()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(signInFormSchema) as Resolver<Inputs>,
  })

  const handleSignIn = async (values: Inputs) => {
    if (loading) return

    try {
      await signIn(values)
      toast.success('Login realizado com sucesso!')
      navigate('/home', { replace: true })
    } catch (error: any) {
      const message = error?.message || 'Erro inesperado. Tente novamente.'
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Nature theme brand */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 p-12 lg:flex lg:w-1/2">
        <div className="flex items-center gap-3">
          <img className="h-16 w-auto brightness-0 invert" src={logo} alt="GeoBEE" />
        </div>
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-emerald-300" />
            <span className="text-lg font-medium text-emerald-300">
              Plataforma GeoBEE
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Gerencie seus apiários e meliponários com inteligência geoespacial.
          </h1>
          <p className="mt-4 text-lg text-emerald-200">
            Calcule capacidade de suporte, visualize mapas de vegetação e tome
            decisões baseadas em dados reais.
          </p>
        </div>
        <p className="text-sm text-emerald-300/70">
          GeoBEE &copy; {new Date().getFullYear()} - Todos os direitos
          reservados
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img className="h-20 w-auto" src={logo} alt="GeoBEE" />
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleSignIn)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="seu@email.com"
                    className={
                      errors.username
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
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
