import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoading } from '@/hooks/useLoading'
import { useUploadMapsMutation } from '@/redux/slices/mapsSlice'

export default function AddMap() {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [uploadMaps] = useUploadMapsMutation()
  const [files, setFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!files || files.length === 0) {
        toast.error('Selecione pelo menos um arquivo GeoJSON.')
        return
      }

      setLoading(true)
      try {
        const formData = new FormData()
        Array.from(files).forEach((file) => {
          formData.append('files', file)
        })

        await uploadMaps(formData).unwrap()
        toast.success('Mapa cadastrado com sucesso!')
        navigate('/meus-mapas')
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          'Ocorreu um erro ao cadastrar.'
        toast.error(`Erro no cadastro! ${message}`)
      } finally {
        setLoading(false)
      }
    },
    [files, uploadMaps, navigate, setLoading],
  )

  return (
    <div className="p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Novo Mapa</CardTitle>
          <CardDescription>
            Faça upload de um arquivo GeoJSON para adicionar um novo mapa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="geojson-file">Arquivo GeoJSON</Label>
              <Input
                ref={fileInputRef}
                id="geojson-file"
                type="file"
                accept=".geojson"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
            <Button type="submit" className="w-full">
              <Upload className="h-4 w-4" />
              Salvar Mapa
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
