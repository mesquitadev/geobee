import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

import {
  useGetApiariesQuery,
  useDeleteApiaryMutation,
  type Apiary,
} from '@/redux/slices/apiariesSlice'
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

export default function MyApiaries() {
  const navigate = useNavigate()
  const { data: apiaries = [], isLoading, error } = useGetApiariesQuery()
  const [deleteApiary] = useDeleteApiaryMutation()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (error) {
    toast.error('Erro ao carregar apiários')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteApiary(deleteId).unwrap()
      toast.success('Apiário removido com sucesso!')
    } catch {
      toast.error('Erro ao remover apiário')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Apiary>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'tipoInstalacao',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('tipoInstalacao')}</Badge>
      ),
    },
    {
      accessorKey: 'quantidadeColmeias',
      header: 'Colmeias',
    },
    {
      accessorKey: 'capacidadeDeSuporte',
      header: 'Capacidade',
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const apiary = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/meus-apiarios/${apiary.id}`)}>
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(apiary.id)}
              >
                Excluir
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
        <h1 className="text-2xl font-bold tracking-tight">Meus Apiários</h1>
        <Button asChild>
          <Link to="/meus-apiarios/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Apiário
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <DataTable
          columns={columns}
          data={apiaries}
          searchKey="name"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Apiário</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover este apiário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
