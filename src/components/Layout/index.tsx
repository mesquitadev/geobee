import React, { ReactNode, useState, useMemo, useEffect } from 'react'
import { Menu, Home, Folder, Plus, Users, Settings, LogOut } from 'lucide-react'
import BackdropLoading from '../BackdropLoading'
import { useLoading } from '../../hooks/useLoading'
import { useGetMeQuery } from '../../redux/slices/usersSlice'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Profile from './Profile'
import UsedSpace from './UsedSpace'
import Sidebar, { MenuItem } from './Sidebar'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  })

  const { loading } = useLoading()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const { data: userData, isLoading: userLoading } = useGetMeQuery()

  const userRoles = userData?.role || []
  const userName = userData?.name || 'Usuário'

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Início',
        icon: Home,
        to: '/home',
        startsWith: '/home',
        roles: [], // Disponível para todos
      },
      {
        label: 'Apiários',
        icon: Folder,
        startsWith: '/apiarios',
        roles: ['ADMIN', 'APICULTOR'],
        submenu: [
          {
            label: 'Meus Apiários',
            to: '/meus-apiarios',
            startsWith: '/meus-apiarios',
            roles: ['ADMIN', 'APICULTOR'],
          },
          {
            label: 'Novo Apiário',
            icon: Plus,
            to: '/meus-apiarios/novo',
            roles: ['ADMIN', 'APICULTOR'],
          },
        ],
      },
      {
        label: 'Meliponários',
        icon: Users,
        startsWith: '/meliponarios',
        roles: ['ADMIN', 'MELIPONICULTOR'],
        submenu: [
          {
            label: 'Meus Meliponários',
            to: '/meus-meliponarios',
            startsWith: '/meus-meliponarios',
            roles: ['ADMIN', 'MELIPONICULTOR'],
          },
          {
            label: 'Novo Meliponário',
            icon: Plus,
            to: '/meus-meliponarios/novo',
            roles: ['ADMIN', 'MELIPONICULTOR'],
          },
        ],
      },
      {
        label: 'Configurações',
        icon: Settings,
        startsWith: '/configuracoes',
        roles: ['ADMIN'],
        submenu: [
          {
            label: 'Mapas',
            to: '/meus-mapas',
            roles: ['ADMIN'],
          },
          {
            label: 'Usuários',
            to: '/usuarios',
            roles: ['ADMIN'],
          },
        ],
      },
    ],
    [],
  )

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const sidebarFooterContent = (
    <>
      <UsedSpace
        apiariesCount={2}
        meliponariesCount={1}
        maxCount={3}
        userRoles={userRoles}
      />
      <Profile />
    </>
  )

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar - usando o mesmo componente Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          menuItems={menuItems}
          userRoles={userRoles}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        >
          {sidebarFooterContent}
        </Sidebar>
      </div>

      {/* Layout principal */}
      <div className="flex w-full flex-col lg:flex-row">
        {/* Mobile Topbar - apenas mobile */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-800 lg:hidden">
          <div className="flex items-center">
            <button
              className="mr-3 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            </button>
            <h1 className="text-lg font-semibold text-violet-600 dark:text-violet-400">
              GeoBEE
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-zinc-700 dark:text-zinc-300 sm:block">
              {getGreeting()}, {userName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar - apenas desktop */}
          <div className="hidden lg:block">
            <Sidebar
              menuItems={menuItems}
              userRoles={userRoles}
              isOpen={sidebarOpen}
              onClose={handleCloseSidebar}
              isMobile={false}
            >
              {sidebarFooterContent}
            </Sidebar>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <BackdropLoading isLoading={loading || userLoading}>
              {children}
            </BackdropLoading>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
