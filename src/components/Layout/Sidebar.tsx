import { X } from 'lucide-react'
import { Button } from '../Button'
import Logo from './Logo.tsx'
import Navigation from './MainNavigation'
import Profile from './Profile.tsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay escuro para dispositivos móveis quando o sidebar estiver aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col gap-6 overflow-auto 
          border-r border-zinc-200 bg-white p-4 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:bottom-0 lg:w-80 lg:translate-x-0 lg:px-5 lg:py-8 dark:border-zinc-800 dark:bg-zinc-900`}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" className="lg:hidden" onClick={onClose}>
            <X className="h-6 w-6 text-zinc-500" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <Navigation />

          <div className="mt-auto flex flex-col gap-6">
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <Profile />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
