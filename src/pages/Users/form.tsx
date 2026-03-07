import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/Button'
import Input from '../../components/Input/SimpleInput'
import { tw } from '../../utils/tw'
import {
  useRegisterMutation,
  useGetUserConfigQuery,
  useUpdateLimitsMutation,
} from '../../redux/slices/usersSlice'

interface UserFormData {
  fullName: string
  cpf: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: string
  maxLocations: number
}

const UserForm = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const isEditing = !!userId

  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [updateLimits, { isLoading: isUpdatingLimits }] = useUpdateLimitsMutation()
  const { data: userConfig } = useGetUserConfigQuery(userId!, { skip: !isEditing })

  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Apicultor',
    maxLocations: 3,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && userConfig) {
      setFormData((prev) => ({
        ...prev,
        maxLocations: userConfig.max_locations,
        role: userConfig.perfis[0] || 'Apicultor',
      }))
    }
  }, [isEditing, userConfig])

  const isLoading = isRegistering || isUpdatingLimits

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isEditing) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Nome é obrigatório'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }

      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório'
      }

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

      if (!formData.role) {
        newErrors.role = 'Perfil é obrigatório'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setApiError(null)

    try {
      if (isEditing && userId) {
        await updateLimits({
          userId,
          max_locations: formData.maxLocations,
        }).unwrap()
      } else {
        await register({
          fullName: formData.fullName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }).unwrap()
      }
      navigate('/usuarios')
    } catch (err: any) {
      const detail = err?.data?.detail || err?.data?.email?.[0] || err?.data?.cpf?.[0]
      setApiError(detail || 'Erro ao salvar usuário')
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string | number) => {
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
          {isEditing ? 'Editar Limites do Usuário' : 'Novo Usuário'}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {isEditing
            ? 'Atualize os limites do usuário'
            : 'Preencha os dados para criar um novo usuário'}
        </p>
      </div>

      {apiError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {apiError}
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEditing && (
            <>
              {/* Nome */}
              <div>
                <Input.Label htmlFor="fullName" required>
                  Nome completo
                </Input.Label>
                <Input.Container>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Digite o nome completo"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                </Input.Container>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* CPF */}
              <div>
                <Input.Label htmlFor="cpf" required>
                  CPF
                </Input.Label>
                <Input.Container>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                </Input.Container>
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.cpf}
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

              {/* Telefone */}
              <div>
                <Input.Label htmlFor="phone">
                  Telefone
                </Input.Label>
                <Input.Container>
                  <Input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </Input.Container>
              </div>

              {/* Senha */}
              <div>
                <Input.Label htmlFor="password" required>
                  Senha
                </Input.Label>
                <Input.Container>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Digite a senha"
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
                <Input.Label htmlFor="confirmPassword" required>
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

              {/* Perfil */}
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
                  <option value="Admin">Administrador</option>
                  <option value="Apicultor">Apicultor</option>
                  <option value="Meliponicultor">Meliponicultor</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.role}
                  </p>
                )}
              </div>
            </>
          )}

          {isEditing && (
            <div>
              <Input.Label htmlFor="maxLocations">
                Limite de Locais (apiários + meliponários)
              </Input.Label>
              <Input.Container>
                <Input
                  id="maxLocations"
                  type="number"
                  min={1}
                  value={formData.maxLocations}
                  onChange={(e) =>
                    handleInputChange('maxLocations', parseInt(e.target.value) || 1)
                  }
                />
              </Input.Container>
            </div>
          )}

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
