import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { LogOut, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'
import { useGetMeQuery } from '../../redux/slices/usersSlice'
import { tw } from '../../utils/tw'

const Profile = () => {
  const { setLoading } = useLoading()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { data: userData, isLoading } = useGetMeQuery()

  useEffect(() => {
    setLoading(isLoading)
    return () => setLoading(false)
  }, [isLoading, setLoading])

  const handleSignOut = () => signOut()

  const perfis = Array.isArray(userData?.perfis)
    ? userData.perfis
    : [userData?.perfis].filter(Boolean)

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col truncate">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {userData?.fullName}
        </span>
        <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {userData?.email}
        </span>
        {perfis.length > 0 && (
          <span className="truncate text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {perfis.join(', ')}
          </span>
        )}
      </div>
      <button
        type="button"
        className={tw(
          'ml-auto rounded-md p-2 transition-colors',
          'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
          'dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
        )}
        onClick={() => setOpen(true)}
        aria-label="Sair"
      >
        <LogOut className="h-5 w-5" />
      </button>

      <Dialog
        open={open}
        onClose={setOpen}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 dark:bg-zinc-800"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Sair da plataforma
                </DialogTitle>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Deseja desconectar-se da plataforma?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default Profile
