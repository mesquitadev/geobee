import { Moon, Sun, X } from 'lucide-react'
import { Button } from '../Button'
import Logo from './Logo.tsx'
import Navigation from './MainNavigation'
import Profile from './Profile.tsx'
import { useEffect, useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <>
      {/* Overlay escuro para dispositivos móveis quando o sidebar estiver aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-[280px] flex-col gap-6 overflow-auto 
          border-r border-zinc-200 bg-white p-4 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          dark:border-zinc-800 dark:bg-zinc-900 lg:bottom-0 lg:w-80 lg:translate-x-0 lg:px-5 lg:py-8`}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" className="lg:hidden" onClick={onClose}>
            <X className="h-6 w-6 text-zinc-500" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <Navigation onNavigate={onClose} />

          <div className="mt-auto flex flex-col gap-6">
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Botão para alternar entre tema claro/escuro */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo Escuro</span>
                </>
              )}
            </Button>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <Profile />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
