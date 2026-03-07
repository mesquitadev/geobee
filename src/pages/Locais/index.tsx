import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, PlusCircle, ArrowUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  useGetApiariesQuery,
  useDeleteApiaryMutation,
  type Apiary,
} from '@/redux/slices/apiariesSlice'
import {
  useGetMeliponariesQuery,
  useDeleteMeliponaryMutation,
  type Meliponary,
} from '@/redux/slices/meliponarySlice'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { especiesAbelhasOptions } from '@/utils/options'

const speciesFilterOptions = especiesAbelhasOptions.map((opt) => ({
  label: opt.label.split(' (')[0],
  value: opt.value,
}))

export default function Locais() {
  const navigate = useNavigate()

  // Apiaries data
  const { data: apiaries = [], isLoading: isLoadingApiaries, error: apiariesError } = useGetApiariesQuery()
  const [deleteApiary] = useDeleteApiaryMutation()

  // Meliponaries data
  const { data: meliponaries = [] } = useGetMeliponariesQuery()
  const [deleteMeliponary] = useDeleteMeliponaryMutation()

  // Shared delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'apiary' | 'meliponary' | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (apiariesError) {
    toast.error('Erro ao carregar apiarios')
  }

  const handleDeleteApiary = useCallback(async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteApiary(deleteId).unwrap()
      toast.success('Apiario removido com sucesso!')
    } catch {
      toast.error('Erro ao remover apiario')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
      setDeleteType(null)
    }
  }, [deleteApiary, deleteId])

  const handleDeleteMeliponary = useCallback(async () => {
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
      setDeleteType(null)
    }
  }, [deleteMeliponary, deleteId])

  const handleDelete = deleteType === 'apiary' ? handleDeleteApiary : handleDeleteMeliponary

  // Apiary columns
  const apiaryColumns: ColumnDef<Apiary>[] = [
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
      header: 'Acoes',
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
              <DropdownMenuItem onClick={() => navigate(`/meus-locais/apiario/${apiary.id}`)}>
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeleteId(apiary.id)
                  setDeleteType('apiary')
                }}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Meliponary columns
  const meliponaryColumns: ColumnDef<Meliponary>[] = [
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
              <DropdownMenuItem onClick={() => navigate(`/meus-locais/meliponario/${meliponary.id}`)}>
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDeleteId(meliponary.id)
                  setDeleteType('meliponary')
                }}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const deleteDialogTitle = deleteType === 'apiary' ? 'Remover Apiario' : 'Remover Meliponario'
  const deleteDialogDescription = deleteType === 'apiary'
    ? 'Voce tem certeza que deseja remover este apiario? Esta acao nao pode ser desfeita.'
    : 'Voce tem certeza que deseja remover este meliponario? Esta acao nao pode ser desfeita.'

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Meus Locais</h1>

      <Tabs defaultValue="apiaries">
        <TabsList>
          <TabsTrigger value="apiaries">
            Apiarios ({apiaries.length})
          </TabsTrigger>
          <TabsTrigger value="meliponaries">
            Meliponarios ({meliponaries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apiaries" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button asChild>
              <Link to="/meus-locais/novo-apiario">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Apiario
              </Link>
            </Button>
          </div>

          {isLoadingApiaries ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <DataTable
              columns={apiaryColumns}
              data={apiaries}
              searchKey="name"
              searchPlaceholder="Buscar por nome..."
            />
          )}
        </TabsContent>

        <TabsContent value="meliponaries" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={() => navigate('/meus-locais/novo-meliponario')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Meliponario
            </Button>
          </div>

          <DataTable
            columns={meliponaryColumns}
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
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) { setDeleteId(null); setDeleteType(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogDescription}
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
