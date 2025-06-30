import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar.tsx'
import { Menu } from 'lucide-react'

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 lg:grid lg:grid-cols-app dark:bg-zinc-900">
      {/* Mobile menu button visible only on small screens */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6 text-zinc-700" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="h-full w-full overflow-auto px-4 pb-4 pt-16 lg:col-start-2 lg:w-auto lg:pl-0 lg:pt-0">
        {children}
      </main>
    </div>
  )
}

export default Layout
