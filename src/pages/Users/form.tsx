import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/Button'
import Input from '../../components/Input/SimpleInput'
import { tw } from '../../utils/tw'

interface UserFormData {
  name: string
  email: string
  password?: string
  confirmPassword?: string
  role: string
  status: 'active' | 'inactive'
}

const UserForm = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const isEditing = !!userId

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'APICULTOR',
    status: 'active',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Simular carregamento de dados do usuário para edição
  useEffect(() => {
    if (isEditing) {
      // Aqui você faria a busca real na API
      const mockUser = {
        name: 'João Silva',
        email: 'joao@email.com',
        role: 'ADMIN',
        status: 'active' as const,
      }
      setFormData((prev) => ({ ...prev, ...mockUser }))
    }
  }, [isEditing])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem'
      }
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!formData.role) {
      newErrors.role = 'Role é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Aqui você faria a chamada real para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay da API

      console.log('Dados do formulário:', formData)
      navigate('/usuarios')
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/usuarios')}
          className="mb-4 h-auto p-0 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para usuários
        </Button>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {isEditing
            ? 'Atualize as informações do usuário'
            : 'Preencha os dados para criar um novo usuário'}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <Input.Label htmlFor="name" required>
              Nome completo
            </Input.Label>
            <Input.Container>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                className={errors.name ? 'border-red-500' : ''}
              />
            </Input.Container>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Input.Label htmlFor="email" required>
              Email
            </Input.Label>
            <Input.Container>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="usuario@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
            </Input.Container>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <Input.Label htmlFor="password" required={!isEditing}>
              {isEditing ? 'Nova senha (opcional)' : 'Senha'}
            </Input.Label>
            <Input.Container>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  placeholder={
                    isEditing
                      ? 'Deixe em branco para manter a atual'
                      : 'Digite a senha'
                  }
                  className={tw(
                    'pr-10',
                    errors.password ? 'border-red-500' : '',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-zinc-400 hover:text-zinc-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Input.Container>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <Input.Label
              htmlFor="confirmPassword"
              required={!isEditing || !!formData.password}
            >
              Confirmar senha
            </Input.Label>
            <Input.Container>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  placeholder="Confirme a senha"
                  className={tw(
                    'pr-10',
                    errors.confirmPassword ? 'border-red-500' : '',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-zinc-400 hover:text-zinc-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Input.Container>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <Input.Label htmlFor="role" required>
              Perfil de acesso
            </Input.Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={tw(
                'w-full rounded-md border border-zinc-300 dark:border-zinc-600',
                'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
                'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
                errors.role ? 'border-red-500' : '',
              )}
            >
              <option value="">Selecione um perfil</option>
              <option value="ADMIN">Administrador</option>
              <option value="APICULTOR">Apicultor</option>
              <option value="MELIPONICULTOR">Meliponicultor</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.role}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <Input.Label htmlFor="status" required>
              Status
            </Input.Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                handleInputChange(
                  'status',
                  e.target.value as 'active' | 'inactive',
                )
              }
              className={tw(
                'w-full rounded-md border border-zinc-300 dark:border-zinc-600',
                'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
                'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
              )}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/usuarios')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
