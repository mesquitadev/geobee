import React, { ReactNode, useState, useMemo, useEffect } from 'react'
import {
  Menu,
  Home,
  Folder,
  Plus,
  Users,
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  Moon,
  Sun,
  X,
  LogOut,
  ElementType,
} from 'lucide-react'
import { tw } from '../../utils/tw'
import BackdropLoading from '../BackdropLoading'
import { useLoading } from '../../hooks/useLoading'
import { useGetMeQuery } from '../../redux/slices/usersSlice'
import { useAuth } from '../../hooks/useAuth'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Profile from './Profile'
import UsedSpace from './UsedSpace'
import { Button } from '../Button'

type MenuItem = {
  label: string
  icon?: ElementType
  to?: string
  startsWith?: string
  roles?: string[]
  submenu?: MenuItem[]
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<{
    [key: string]: boolean
  }>({})
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
  const location = useLocation()

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
      // {
      //   label: 'Relatórios',
      //   icon: BarChart3,
      //   startsWith: '/relatorios',
      //   roles: ['ADMIN'],
      //   submenu: [
      //     {
      //       label: 'Apiários',
      //       icon: FileText,
      //       to: '/relatorios/apiarios',
      //       roles: ['ADMIN'],
      //     },
      //     {
      //       label: 'Meliponários',
      //       icon: FileText,
      //       to: '/relatorios/meliponarios',
      //       roles: ['ADMIN'],
      //     },
      //   ],
      // },
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

  // Auto-open parent menu when on child route
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        item.submenu.forEach((subItem) => {
          if (location.pathname.startsWith(subItem.to || '')) {
            setIsSubmenuOpen((prev) => ({ ...prev, [item.label]: true }))
          }
        })
      }
    })
  }, [menuItems, location.pathname])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const toggleSubmenu = (menu: string) => {
    setIsSubmenuOpen((prev) => {
      if (prev[menu]) return {}
      return { [menu]: true }
    })
  }

  const hasPermission = (
    userRoles: string[],
    requiredRoles: string[],
  ): boolean => {
    return (
      requiredRoles.length === 0 ||
      requiredRoles.some((role) => userRoles.includes(role))
    )
  }

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(userRoles, item.roles || []),
  )

  const isActiveRoute = (item: MenuItem): boolean => {
    if (item.to && location.pathname === item.to) return true
    if (item.startsWith && location.pathname.startsWith(item.startsWith))
      return true
    if (item.submenu) {
      return item.submenu.some((subItem) => isActiveRoute(subItem))
    }
    return false
  }

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item)
    const isExpanded = isSubmenuOpen[item.label]
    const hasSubMenu = item.submenu && item.submenu.length > 0
    const Icon = item.icon

    if (hasSubMenu) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={tw(
              'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition-colors duration-200',
              'hover:bg-violet-50 dark:hover:bg-zinc-700',
              isActive
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                : 'text-zinc-700 dark:text-zinc-300',
            )}
          >
            <div className="flex items-center">
              {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              className={tw(
                'h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200',
                isExpanded ? 'rotate-180' : '',
              )}
            />
          </button>

          {isExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {item.submenu
                ?.filter((subItem) =>
                  hasPermission(userRoles, subItem.roles || []),
                )
                .map((subItem) => (
                  <Link
                    key={subItem.to}
                    to={subItem.to || '#'}
                    onClick={() => setSidebarOpen(false)}
                    className={tw(
                      'flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-200',
                      'hover:bg-violet-50 dark:hover:bg-zinc-700',
                      location.pathname.startsWith(subItem.to || '')
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                        : 'text-zinc-600 dark:text-zinc-400',
                    )}
                  >
                    {subItem.icon && (
                      <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{subItem.label}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        to={item.to || '#'}
        onClick={() => setSidebarOpen(false)}
        className={tw(
          'flex items-center rounded-lg px-4 py-2.5 transition-colors duration-200',
          'hover:bg-violet-50 dark:hover:bg-zinc-700',
          isActive
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
            : 'text-zinc-700 dark:text-zinc-300',
        )}
      >
        {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Mobile Header */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-800 lg:hidden">
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
        {/* Desktop Sidebar */}
        <div className="hidden h-full w-64 flex-shrink-0 lg:block">
          <aside className="flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {/* Logo Section */}
            <div className="flex items-center justify-center border-b border-zinc-100 px-6 py-6 dark:border-zinc-800">
              <Logo />
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
              <nav className="space-y-2 px-4 py-6">
                {filteredMenuItems.map((item) => renderMenuItem(item))}
              </nav>
            </div>

            {/* Footer Section */}
            <div className="space-y-4 border-t border-zinc-100 p-4 dark:border-zinc-800">
              {/* Used Space Component */}
              <UsedSpace usedCount={2} maxCount={3} userRoles={userRoles} />

              {/* Profile */}
              <Profile />
            </div>
          </aside>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <aside
            className={tw(
              'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
              'flex flex-col',
            )}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <Logo />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-2 px-4 py-6">
                {filteredMenuItems.map((item) => renderMenuItem(item))}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="space-y-4 border-t border-zinc-100 p-4 dark:border-zinc-800">
              <UsedSpace usedCount={2} maxCount={3} userRoles={userRoles} />

              <Profile />
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <BackdropLoading isLoading={loading || userLoading}>
            {children}
          </BackdropLoading>
        </main>
      </div>
    </div>
  )
}

export default Layout
