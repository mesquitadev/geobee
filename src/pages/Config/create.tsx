// @ts-nocheck
import { yupResolver } from '@hookform/resolvers/yup'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import Breadcumbs from '../../components/Breadcumbs'
import InputContainer from '../../components/Input/Container.tsx'
import InputLabel from '../../components/Input/Label.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'

import { useNavigate } from 'react-router-dom'
import { useUploadMapsMutation } from '../../redux/slices/mapsSlice'

interface Inputs {
  files: FileList
}

export default function AddMap() {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [uploadMaps] = useUploadMapsMutation()

  const apiarioFormSchema = yup.object().shape({
    files: yup.mixed().required('Este campo é obrigatório'),
  })
  const { handleSubmit, formState, register } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(apiarioFormSchema),
  })
  const { errors } = formState

  const handleSignUp = async (data: Inputs) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Array.from(data.files).forEach((file) => {
        formData.append('files', file)
      })

      await uploadMaps(formData).unwrap()
      toast.success('Cadastro realizado com sucesso!')
      navigate(-1)
    } catch (err: any) {
      const message = err?.data?.message || 'Ocorreu um erro ao cadastrar.'
      toast.error(`Erro no cadastro! ${message}`)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full p-4 md:p-6 lg:p-10">
      <Breadcumbs pageName="Cadastrar Mapa" />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="mb-5">
          <form onSubmit={handleSubmit(handleSignUp)} className="w-full">
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <InputContainer className="w-full">
                <InputLabel label="Arquivo GeoJSON" name="files" />
                <input
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                  type="file"
                  {...register('files')}
                  multiple
                  accept={'.geojson'}
                />
                {errors.files && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.files.message}
                  </p>
                )}
              </InputContainer>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Salvar Mapa
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
