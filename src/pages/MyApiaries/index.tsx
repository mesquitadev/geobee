import { useCallback, useEffect, useState } from 'react'
import api from '../../services'
import { useLoading } from '../../hooks/useLoading.tsx'
import Breadcumbs from '../../components/Breadcumbs'
import 'leaflet/dist/leaflet.css'
import { Link, useHistory } from 'react-router-dom'
import BackdropLoading from '../../components/BackdropLoading/index.tsx'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function MyApiaries() {
  const history = useHistory()
  const { loading, setLoading } = useLoading()
  const [apiaries, setApiaries] = useState(null)

  const fetchApiaries = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/apiary')
      setApiaries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  useEffect(() => {
    fetchApiaries()
  }, [fetchApiaries])

  const handleViewApiary = useCallback(
    (id: number) => {
      history.push(`meus-apiarios/${id}`)
    },
    [history],
  )

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number>()

  const handleOpenCloseModal = useCallback((id: number) => {
    setOpen((state) => !state)
    setSelectedId(id)
  }, [])
  const handleDeleteApiary = useCallback(() => {
    api
      .delete(`/apiary/${selectedId}`)
      .then(() => {
        setOpen(false)
        fetchApiaries()
      })
      .catch((e) => console.error(e))
  }, [fetchApiaries, selectedId])

  return (
    <div className="w-full h-full p-10">
      <BackdropLoading isLoading={loading} />
      <Breadcumbs pageName="Meus Apiários" />

      <div className="py-5 justify-end items-end">
        <Link
          to="/meus-apiarios/novo"
          data-modal-target="authentication-modal"
          data-modal-toggle="authentication-modal"
          className="flex rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Adicionar Apiário
        </Link>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Meus Apiários
        </h4>

        <div className="flex flex-col">
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Nome
              </h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Tipo Instalação
              </h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Tipo
              </h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Capacidade Suporte
              </h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">
                Ações
              </h5>
            </div>
          </div>

          {apiaries?.map((brand, key) => {
            return (
              <div
                className={`grid grid-cols-3 sm:grid-cols-5 ${
                  key === apiaries.length - 1
                    ? ''
                    : 'border-b border-stroke dark:border-strokedark'
                }`}
                key={key}
              >
                <div className="flex items-center gap-3 p-2.5 xl:p-5">
                  <p className="hidden text-black sm:block">{brand.name}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black">{brand.tipoInstalacao}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-meta-3">APIÁRIO</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-meta-3">{brand.capacidadeDeSuporte}</p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <button
                    onClick={() => handleViewApiary(brand.id)}
                    className=" mr-2 flex rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleOpenCloseModal(brand.id)}
                    className=" mr-2 flex rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleOpenCloseModal}
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
                  data-autofocus
                  onClick={handleOpenCloseModal}
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
