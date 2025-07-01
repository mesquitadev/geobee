import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar.tsx'
import { Menu } from 'lucide-react'

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Barra superior fixa com botão do menu - visível apenas no mobile */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        <div className="flex items-center">
          <button
            className="mr-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              GeoBEE
            </h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal - ajustado para scroll suave */}
        <main className="flex-1 overflow-y-auto scroll-smooth lg:pl-80">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
