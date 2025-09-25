import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcumbs from '../../components/Breadcumbs'
import { useLoading } from '../../hooks/useLoading.tsx'
import {
  useDeleteMapMutation,
  useGetMapsQuery,
} from '../../redux/slices/mapsSlice'
import { Eye, PlusCircle, Trash2 } from 'lucide-react'
import { useSnackbar } from 'notistack'

function AppearanceSettings() {
  // Tema: claro, escuro, sistema
  const THEME_KEY = 'theme-preference'
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'system' || !saved) return 'system'
    return saved
  }

  const [theme, setTheme] = useState(getInitialTheme())

  // Aplica tema
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme()
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
      localStorage.setItem(THEME_KEY, 'system')
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem(THEME_KEY, theme)
    }
  }, [theme])

  return (
    <div className="mb-6">
      <label className="mb-2 block font-medium">Tema</label>
      <select
        className="rounded border px-3 py-2"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="system">Acompanhar sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </div>
  )
}

export default function MyMaps() {
  const {
    data: maps = [],
    isLoading: mapsLoading,
    error: mapsError,
  } = useGetMapsQuery()
  const [deleteMap] = useDeleteMapMutation()
  const { setLoading } = useLoading()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setLoading(mapsLoading)
  }, [mapsLoading, setLoading])

  useEffect(() => {
    if (mapsError) {
      enqueueSnackbar('Erro ao carregar mapas', { variant: 'error' })
    }
  }, [mapsError, enqueueSnackbar])

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()

  const handleOpenCloseModal = useCallback((id: string) => {
    setOpen((state) => !state)
    setSelectedId(id)
  }, [])
  const handleDeleteApiary = useCallback(async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await deleteMap(selectedId)
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [deleteMap, selectedId, setLoading])

  const [submenu, setSubmenu] = useState<'main' | 'appearance'>('main')

  return (
    <div className="h-full w-full p-4 md:p-6 lg:p-10">
      <Breadcumbs pageName="Configurações" />
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Configurações
        </h1>
        <Link
          to="/meus-mapas/novo"
          className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Adicionar mapa</span>
        </Link>
      </div>
      <div className="mb-6 flex gap-2 border-b pb-2">
        <button
          className={`rounded px-3 py-1 ${
            submenu === 'main'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200'
          }`}
          onClick={() => setSubmenu('main')}
        >
          Geral
        </button>
        <button
          className={`rounded px-3 py-1 ${
            submenu === 'appearance'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200'
          }`}
          onClick={() => setSubmenu('appearance')}
        >
          Aparência
        </button>
      </div>
      {submenu === 'main' && (
        <>{/* ...aqui ficam as configurações gerais existentes... */}</>
      )}
      {submenu === 'appearance' && <AppearanceSettings />}
      {maps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-10 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="text-center">
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Nenhum mapa encontrado.
            </p>
            <Link
              to="/meus-mapas/novo"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Adicionar seu primeiro mapa</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-zinc-700 md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                {maps.map((map) => (
                  <tr
                    key={map.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {map.name}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Link
                          to={`/meus-mapas/${map.id}`}
                          className="rounded-md bg-indigo-100 p-1.5 text-indigo-700 transition-colors hover:bg-indigo-200"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenCloseModal(map.id)}
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
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {maps.map((map) => (
              <div
                key={map.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {map.name}
                  </h3>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <Link
                    to={`/meus-mapas/${map.id}`}
                    className="flex items-center justify-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Visualizar</span>
                  </Link>
                  <button
                    onClick={() => handleOpenCloseModal(map.id)}
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
        onClose={() => setOpen(false)}
        className="relative z-10"
        style={{ zIndex: 9999 }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-red-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Deletar Apiário?
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Deseja apagar o apiário?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleDeleteApiary}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Não
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
