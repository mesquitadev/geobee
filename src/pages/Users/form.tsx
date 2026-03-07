import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import {
  useRegisterMutation,
  useGetUserConfigQuery,
  useUpdateLimitsMutation,
} from '@/redux/slices/usersSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export default function UserForm() {
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

    try {
      if (isEditing && userId) {
        await updateLimits({
          userId,
          max_locations: formData.maxLocations,
        }).unwrap()
        toast.success('Limites atualizados com sucesso!')
      } else {
        await register({
          fullName: formData.fullName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }).unwrap()
        toast.success('Usuário criado com sucesso!')
      }
      navigate('/usuarios')
    } catch (err: any) {
      const detail =
        err?.data?.detail || err?.data?.email?.[0] || err?.data?.cpf?.[0]
      toast.error(detail || 'Erro ao salvar usuário')
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/usuarios')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para usuários
      </Button>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Limites do Usuário' : 'Novo Usuário'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Atualize os limites do usuário'
              : 'Preencha os dados para criar um novo usuário'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isEditing && (
              <>
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Nome completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Digite o nome completo"
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">
                    CPF <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? 'border-destructive' : ''}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="usuario@email.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Digite a senha"
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar senha <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      placeholder="Confirme a senha"
                      className={
                        errors.confirmPassword
                          ? 'border-destructive pr-10'
                          : 'pr-10'
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Perfil */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Perfil de acesso <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger
                      className={errors.role ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Administrador</SelectItem>
                      <SelectItem value="Apicultor">Apicultor</SelectItem>
                      <SelectItem value="Meliponicultor">Meliponicultor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="maxLocations">
                  Limite de Locais (apiários + meliponários)
                </Label>
                <Input
                  id="maxLocations"
                  type="number"
                  min={1}
                  value={formData.maxLocations}
                  onChange={(e) =>
                    handleInputChange('maxLocations', parseInt(e.target.value) || 1)
                  }
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/usuarios')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
