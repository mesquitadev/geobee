import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

import {
  useGetUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  type User,
} from '@/redux/slices/usersSlice'
import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useGetUsersQuery()
  const [activateUser] = useActivateUserMutation()
  const [deactivateUser] = useDeactivateUserMutation()

  const [toggleUser, setToggleUser] = useState<User | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  if (error) {
    toast.error('Erro ao carregar usuários')
  }

  const handleToggleStatus = async () => {
    if (!toggleUser) return
    setIsToggling(true)
    try {
      if (toggleUser.isActive) {
        await deactivateUser(toggleUser.id).unwrap()
        toast.success(`Usuário "${toggleUser.fullName}" desativado com sucesso!`)
      } else {
        await activateUser(toggleUser.id).unwrap()
        toast.success(`Usuário "${toggleUser.fullName}" ativado com sucesso!`)
      }
    } catch {
      toast.error('Erro ao alterar status do usuário')
    } finally {
      setIsToggling(false)
      setToggleUser(null)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.fullName}</p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableHiding: true,
      cell: ({ row }) => row.original.email,
      meta: { hidden: true },
    },
    {
      accessorKey: 'perfis',
      header: 'Perfil',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.perfis.map((perfil) => (
            <Badge key={perfil} variant="secondary">
              {perfil}
            </Badge>
          ))}
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.perfis.some((p) => p === filterValue)
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <Badge
            className={
              isActive
                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300'
            }
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        )
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue) return true
        return filterValue === 'active' ? row.original.isActive : !row.original.isActive
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/usuarios/${user.id}/editar`}>Editar limites</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setToggleUser(user)}
                className={
                  user.isActive
                    ? 'text-red-600 focus:text-red-600'
                    : 'text-green-600 focus:text-green-600'
                }
              >
                {user.isActive ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <Button asChild>
          <Link to="/usuarios/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="fullName"
        searchPlaceholder="Buscar por nome..."
        filterOptions={[
          {
            key: 'isActive',
            label: 'Status',
            options: [
              { label: 'Ativo', value: 'active' },
              { label: 'Inativo', value: 'inactive' },
            ],
          },
        ]}
      />

      <AlertDialog open={!!toggleUser} onOpenChange={() => setToggleUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração</AlertDialogTitle>
            <AlertDialogDescription>
              {toggleUser?.isActive
                ? `Deseja desativar o usuário "${toggleUser?.fullName}"? Ele não poderá acessar o sistema.`
                : `Deseja ativar o usuário "${toggleUser?.fullName}"? Ele voltará a ter acesso ao sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={
                toggleUser?.isActive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {isToggling
                ? 'Processando...'
                : toggleUser?.isActive
                  ? 'Desativar'
                  : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
