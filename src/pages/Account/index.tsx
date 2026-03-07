import { useState } from 'react'
import { toast } from 'sonner'
import { User, KeyRound, Shield, MapPinned } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePermissions } from '@/hooks/usePermissions'
import { useChangePasswordMutation } from '@/redux/slices/usersSlice'
import { useGetApiariesQuery } from '@/redux/slices/apiariesSlice'
import { useGetMeliponariesQuery } from '@/redux/slices/meliponarySlice'

export default function AccountPage() {
  const { user, perfis } = usePermissions()
  const { data: apiaries = [] } = useGetApiariesQuery()
  const { data: meliponaries = [] } = useGetMeliponariesQuery()
  const [changePassword, { isLoading }] = useChangePasswordMutation()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const usedLocations = apiaries.length + meliponaries.length
  const maxLocations = user?.maxLocations ?? 5

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap()
      toast.success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Erro ao alterar senha.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados pessoais e configurações
        </p>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Dados Pessoais</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <p className="text-sm font-medium">{user?.fullName || '—'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{user?.email || '—'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CPF</Label>
              <p className="text-sm font-medium">{user?.cpf || '—'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm font-medium">{user?.phone || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano e Perfis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Plano & Perfis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {perfis.map((perfil) => (
              <Badge key={perfil} variant="secondary">
                {perfil}
              </Badge>
            ))}
            {perfis.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum perfil atribuído</p>
            )}
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <MapPinned className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Locais utilizados</p>
              <p className="text-xs text-muted-foreground">
                {apiaries.length} apiários, {meliponaries.length} meliponários
              </p>
            </div>
            <Badge variant={usedLocations >= maxLocations ? 'destructive' : 'outline'}>
              {usedLocations} / {maxLocations}
            </Badge>
          </div>

          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min((usedLocations / maxLocations) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Troca de Senha */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Alterar Senha</CardTitle>
              <CardDescription className="text-xs">
                Informe sua senha atual e a nova senha
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
