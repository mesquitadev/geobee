import { useState } from 'react'
import { Edit, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react'
import { Button } from '../../components/Button'
import Input from '../../components/Input/SimpleInput'
import Dialog from '../../components/Dialog/Dialog'
import { tw } from '../../utils/tw'
import { Link } from 'react-router-dom'

interface User {
  id: string
  name: string
  role?: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

// Mock data - substituir por dados reais da API
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-15',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    role: 'APICULTOR',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-14',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    role: 'MELIPONICULTOR',
    status: 'inactive',
    createdAt: '2024-03-10',
    lastLogin: '2024-11-20',
  },
]

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  APICULTOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  MELIPONICULTOR:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const statusColors = {
  active:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !selectedRole || user.role === selectedRole
    const matchesStatus = !selectedStatus || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    setShowDeleteDialog(null)
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === 'active' ? 'inactive' : 'active',
            }
          : user,
      ),
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
            <option value="ADMIN">Administrador</option>
            <option value="APICULTOR">Apicultor</option>
            <option value="MELIPONICULTOR">Meliponicultor</option>
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Último Login
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
                        {user.name}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={tw(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        roleColors[user.role as keyof typeof roleColors],
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={tw(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        statusColors[user.status],
                      )}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
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
                        onClick={() => handleToggleStatus(user.id)}
                        className={
                          user.status === 'active'
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-green-600 hover:text-green-700'
                        }
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
        title="Confirmar Exclusão"
      >
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir este usuário? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              showDeleteDialog && handleDeleteUser(showDeleteDialog)
            }
          >
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default UsersPage
