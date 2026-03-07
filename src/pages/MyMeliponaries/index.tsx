import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  useGetMeliponariesQuery,
  useDeleteMeliponaryMutation,
  type Meliponary,
} from '@/redux/slices/meliponarySlice'
import { especiesAbelhasOptions } from '@/utils/options'

const speciesFilterOptions = especiesAbelhasOptions.map((opt) => ({
  label: opt.label.split(' (')[0],
  value: opt.value,
}))

export default function MyMeliponaries() {
  const navigate = useNavigate()
  const { data: meliponaries = [] } = useGetMeliponariesQuery()
  const [deleteMeliponary] = useDeleteMeliponaryMutation()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteMeliponary(deleteId).unwrap()
      toast.success('Meliponario removido com sucesso!')
    } catch {
      toast.error('Erro ao remover meliponario')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }, [deleteMeliponary, deleteId])

  const columns: ColumnDef<Meliponary>[] = [
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
      accessorKey: 'especieAbelha',
      header: 'Especie',
      cell: ({ row }) => {
        const species = row.getValue('especieAbelha') as string | undefined
        return species ? (
          <Badge variant="secondary">{species}</Badge>
        ) : (
          <span className="text-muted-foreground">--</span>
        )
      },
    },
    {
      accessorKey: 'quantidadeColmeias',
      header: 'Colmeias',
      cell: ({ row }) => {
        const val = row.getValue('quantidadeColmeias') as string | number | undefined
        return val ?? '--'
      },
    },
    {
      accessorKey: 'capacidadeDeSuporte',
      header: 'Capacidade',
      cell: ({ row }) => {
        const val = row.getValue('capacidadeDeSuporte') as string | number | undefined
        return val ?? '--'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const meliponary = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/meus-meliponarios/${meliponary.id}`)}>
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(meliponary.id)}
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
        <h1 className="text-2xl font-bold tracking-tight">Meus Meliponarios</h1>
        <Button onClick={() => navigate('/meus-meliponarios/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Meliponario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={meliponaries}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
        filterOptions={[
          {
            key: 'especieAbelha',
            label: 'Especie',
            options: speciesFilterOptions,
          },
        ]}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Meliponario</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja remover este meliponario? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
