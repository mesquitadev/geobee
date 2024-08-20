import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { userService } from '../../services/UserService.ts'
import { useLoading } from '../../hooks/useLoading.tsx'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth.tsx'

const Profile = () => {
  const { setLoading } = useLoading()
  const { signOut } = useAuth()
  const [userData, setUserData] = useState<any>({})
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setLoading(true)
    userService
      .buscarDadosUsuarioLogado()
      .then((response) => {
        setUserData(response)
        setLoading(false)
      })
      .catch()
      .finally(() => {
        setLoading(false)
      })
  }, [setLoading])

  const handleSignOut = () => {
    signOut()
  }
  return (
    <div className="flex items-center gap-3">
      {/* <img */}
      {/*  src="https://github.com/mesquitadev.png" */}
      {/*  alt="" */}
      {/*  className="w-10 h-10 rounded-full" */}-{/* /> */}
      <div className="flex flex-col truncate">
        <span className="text-sm font-semibold text-zinc-700">
          {userData.fullName}
        </span>
        <span className="truncate text-sm text-zinc-500">{userData.email}</span>
      </div>
      <button
        type="button"
        className="ml-auto p-2 hover:bg-zinc-50 rounded-md"
        onClick={() => setOpen(true)}
      >
        <LogOut className="h-5 w-5 text-zinc-500" />
      </button>
      <Dialog
        open={open}
        onClose={setOpen}
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
                      Sair da Plataforma
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Deseja desconectar-se da plataforma?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Sim
                </button>
                <button
                  type="button"
                  data-autofocus
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

export default Profile
