import React, { useCallback, useState } from 'react'
import { useLoading } from '../../hooks/useLoading.tsx'
import Breadcumbs from '../../components/Breadcumbs'
import 'leaflet/dist/leaflet.css'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useSnackbar } from 'notistack'
import { Eye, PlusCircle, Trash2 } from 'lucide-react'
import {
  useDeleteMeliponaryMutation,
  useGetMeliponariesQuery,
} from '../../redux/slices/meliponarySlice'

const MyMeliponaries = () => {
  const navigate = useNavigate()
  const { setLoading } = useLoading()
  const { enqueueSnackbar } = useSnackbar()
  const {
    data: meliponaries = [],
    isLoading: meliponariesLoading,
    error: meliponariesError,
  } = useGetMeliponariesQuery()
  // Adiciona controle de loading global
  React.useEffect(() => {
    setLoading(meliponariesLoading)
  }, [meliponariesLoading, setLoading])

  React.useEffect(() => {
    if (meliponariesError) {
      enqueueSnackbar('Erro ao carregar meliponários', { variant: 'error' })
    }
  }, [meliponariesError, enqueueSnackbar])

  const [deleteMeliponary] = useDeleteMeliponaryMutation()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenCloseModal = useCallback((id: string) => {
    setOpen((state) => !state)
    setSelectedId(id)
  }, [])

  const handleViewMeliponary = useCallback(
    (id: string) => {
      navigate(`/meus-meliponarios/${id}`)
    },
    [navigate],
  )

  const handleDeleteMeliponary = useCallback(async () => {
    if (!selectedId) return
    setIsDeleting(true)
    try {
      await deleteMeliponary(selectedId)
      setOpen(false)
      enqueueSnackbar('Meliponário removido com sucesso!', {
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Erro ao remover meliponário', { variant: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }, [deleteMeliponary, selectedId, enqueueSnackbar])

  return (
    <div className="h-full w-full p-4 md:p-6 lg:p-10">
      {/* <BackdropLoading isLoading={loading} /> */}
      <Breadcumbs pageName="Meus Meliponários" />

      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Meus Meliponários
        </h1>

        <Link
          to="/meus-meliponarios/novo"
          className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Adicionar Meliponário</span>
        </Link>
      </div>

      {meliponaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-10 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="text-center">
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Nenhum meliponário encontrado.
            </p>
            <Link
              to="/meus-meliponarios/novo"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Adicionar seu primeiro meliponário</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Versão para Desktop - Tabela */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-zinc-700 md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Tipo Instalação
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Capacidade Suporte
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                {meliponaries.map((apiary) => (
                  <tr
                    key={apiary.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {apiary.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {apiary.tipoInstalacao}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                      MELIPONÁRIO
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {apiary.capacidadeDeSuporte}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewMeliponary(apiary.id)}
                          className="rounded-md bg-indigo-100 p-1.5 text-indigo-700 transition-colors hover:bg-indigo-200"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenCloseModal(apiary.id)}
                          className="rounded-md bg-red-100 p-1.5 text-red-700 transition-colors hover:bg-red-200"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão para Mobile - Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {meliponaries.map((apiary) => (
              <div
                key={apiary.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {apiary.name}
                  </h3>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                    MELIPONÁRIO
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tipo Instalação:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {apiary.tipoInstalacao}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Capacidade de Suporte:
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {apiary.capacidadeDeSuporte}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleViewMeliponary(apiary.id)}
                    className="flex items-center justify-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Visualizar</span>
                  </button>
                  <button
                    onClick={() => handleOpenCloseModal(apiary.id)}
                    className="flex items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog
        open={open}
        onClose={() => !isDeleting && setOpen(false)}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-800">
              <DialogTitle
                as="h3"
                className="flex items-center gap-2 text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
              >
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
                <span>Remover Meliponário</span>
              </DialogTitle>
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Você tem certeza que deseja remover este meliponário? Esta
                  ação não pode ser desfeita.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
                  onClick={() => setOpen(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleDeleteMeliponary}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default MyMeliponaries
