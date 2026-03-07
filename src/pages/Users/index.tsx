import { useState } from 'react'
import { Edit, Plus, Search, UserCheck, UserX } from 'lucide-react'
import { Button } from '../../components/Button'
import Input from '../../components/Input/SimpleInput'
import Dialog from '../../components/Dialog/Dialog'
import { tw } from '../../utils/tw'
import { Link } from 'react-router-dom'
import {
  useGetUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../redux/slices/usersSlice'

const roleColors: Record<string, string> = {
  Admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Apicultor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Meliponicultor:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const UsersPage = () => {
  const { data: users = [], isLoading, error } = useGetUsersQuery()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showToggleDialog, setShowToggleDialog] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole =
      !selectedRole || user.perfis.some((p) => p === selectedRole)
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === 'active' ? user.isActive : !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser(userId).unwrap()
      } else {
        await activateUser(userId).unwrap()
      }
    } catch {
      // Error handled by RTK Query
    }
    setShowToggleDialog(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando usuários...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Erro ao carregar usuários. Verifique suas permissões.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Gestão de Usuários
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Gerencie usuários do sistema
            </p>
          </div>
          <Link to="/usuarios/novo">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={tw(
              'rounded-md border border-zinc-300 dark:border-zinc-600',
              'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
              'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
            )}
          >
            <option value="">Todas as roles</option>
            <option value="Admin">Administrador</option>
            <option value="Apicultor">Apicultor</option>
            <option value="Meliponicultor">Meliponicultor</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={tw(
              'rounded-md border border-zinc-300 dark:border-zinc-600',
              'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
              'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
            )}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>

          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
            {filteredUsers.length} usuário(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Limites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.perfis.map((perfil) => (
                        <span
                          key={perfil}
                          className={tw(
                            'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                            roleColors[perfil] || 'bg-gray-100 text-gray-800',
                          )}
                        >
                          {perfil}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={tw(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                      )}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div>{user.maxLocations} locais</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/usuarios/${user.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToggleDialog(user.id)}
                        className={
                          user.isActive
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              Nenhum usuário encontrado
            </p>
          </div>
        )}
      </div>

      {/* Toggle Status Confirmation Dialog */}
      <Dialog
        isOpen={!!showToggleDialog}
        onClose={() => setShowToggleDialog(null)}
        title="Confirmar Alteração"
      >
        {(() => {
          const targetUser = users.find((u) => u.id === showToggleDialog)
          return (
            <>
              <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                {targetUser?.isActive
                  ? `Deseja desativar o usuário "${targetUser?.fullName}"?`
                  : `Deseja ativar o usuário "${targetUser?.fullName}"?`}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowToggleDialog(null)}>
                  Cancelar
                </Button>
                <Button
                  variant={targetUser?.isActive ? 'danger' : 'success'}
                  onClick={() =>
                    showToggleDialog &&
                    handleToggleStatus(showToggleDialog, !!targetUser?.isActive)
                  }
                >
                  {targetUser?.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </>
          )
        })()}
      </Dialog>
    </div>
  )
}

export default UsersPage
