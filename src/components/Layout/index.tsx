import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar.tsx'
import { Menu } from 'lucide-react'
import Logo from './Logo.tsx'

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Barra superior fixa com botão do menu */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center">
          <button
            className="mr-3 rounded-md p-2 hover:bg-gray-100 lg:hidden dark:hover:bg-zinc-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal (onde ficará o mapa) */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout
