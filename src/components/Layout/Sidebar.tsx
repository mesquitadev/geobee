import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, X, ElementType } from 'lucide-react'
import { tw } from '../../utils/tw'
import { Button } from '../Button'
import Logo from './Logo'

export type MenuItem = {
  label: string
  icon?: ElementType
  to?: string
  startsWith?: string
  roles?: string[]
  submenu?: MenuItem[]
}

interface SidebarProps {
  menuItems: MenuItem[]
  userRoles: string[]
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
  className?: string
  children?: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  userRoles,
  isOpen,
  onClose,
  isMobile = false,
  className,
  children,
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<{
    [key: string]: boolean
  }>({})
  const location = useLocation()

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
                    onClick={() => isMobile && onClose()}
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
        onClick={() => isMobile && onClose()}
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

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={tw(
            'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900 lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full',
            'flex flex-col',
            className,
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <Logo />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
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
          {children && (
            <div className="space-y-4 border-t border-zinc-100 p-4 dark:border-zinc-800">
              {children}
            </div>
          )}
        </aside>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className="hidden h-full w-64 flex-shrink-0 lg:block">
      <aside
        className={tw(
          'flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900',
          className,
        )}
      >
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
        {children && (
          <div className="space-y-4 border-t border-zinc-100 p-4 dark:border-zinc-800">
            {children}
          </div>
        )}
      </aside>
    </div>
  )
}

export default Sidebar
