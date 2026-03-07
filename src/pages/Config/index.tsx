import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, MapIcon, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useLoading } from '@/hooks/useLoading'
import {
  useDeleteMapMutation,
  useGetMapsQuery,
} from '@/redux/slices/mapsSlice'

export default function MyMaps() {
  const {
    data: maps = [],
    isLoading: mapsLoading,
    error: mapsError,
  } = useGetMapsQuery()
  const [deleteMap] = useDeleteMapMutation()
  const { setLoading } = useLoading()

  useEffect(() => {
    setLoading(mapsLoading)
  }, [mapsLoading, setLoading])

  useEffect(() => {
    if (mapsError) {
      toast.error('Erro ao carregar mapas')
    }
  }, [mapsError])

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setSelectedId(id)
    setOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await deleteMap(selectedId).unwrap()
      toast.success('Mapa removido com sucesso')
      setOpen(false)
    } catch (e) {
      toast.error('Erro ao remover mapa')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [deleteMap, selectedId, setLoading])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Meus Mapas</h1>
        <Button asChild>
          <Link to="/meus-mapas/novo">
            <PlusCircle className="h-4 w-4" />
            Novo Mapa
          </Link>
        </Button>
      </div>

      {maps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum mapa encontrado.
            </p>
            <Button variant="outline" asChild>
              <Link to="/meus-mapas/novo">
                <PlusCircle className="h-4 w-4" />
                Adicionar seu primeiro mapa
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[120px]">Features</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maps.map((map) => (
                <TableRow key={map.id}>
                  <TableCell className="font-medium">{map.name}</TableCell>
                  <TableCell>{map.feature_count ?? '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          to={`/meus-mapas/${map.id}`}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(map.id)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Mapa</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover este mapa e todos os seus
              dados de vegetação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
