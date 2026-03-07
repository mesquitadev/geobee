import {
  MapPin,
  Warehouse,
  Bug,
  Layers,
  Users,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useGetMeQuery } from '@/redux/slices/usersSlice'
import { useGetApiariesQuery } from '@/redux/slices/apiariesSlice'
import { useGetMeliponariesQuery } from '@/redux/slices/meliponarySlice'
import { NavItem } from './nav-item'
import { UserMenu } from './user-menu'
import { SpaceIndicator } from './space-indicator'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const profileMap: Record<number, string> = {
  1: 'ADMIN',
  2: 'APICULTOR',
  3: 'MELIPONICULTOR',
  4: 'USER',
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { data: user } = useGetMeQuery()
  const { data: apiaries = [] } = useGetApiariesQuery()
  const { data: meliponaries = [] } = useGetMeliponariesQuery()

  const userRoles = Array.isArray(user?.profiles)
    ? user.profiles
        .map((p: string | number) => profileMap[Number(p)])
        .filter(Boolean)
    : []
  const isAdmin = userRoles.includes('ADMIN')

  const navItems = [
    { to: '/home', icon: MapPin, label: 'Mapa' },
    { to: '/meus-apiarios', icon: Warehouse, label: 'Apiarios' },
    { to: '/meus-meliponarios', icon: Bug, label: 'Meliponarios' },
    { to: '/meus-mapas', icon: Layers, label: 'Mapas' },
  ]

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b px-3',
          collapsed && 'justify-center'
        )}
      >
        <img
          src="/geobee.png"
          alt="GeoBEE"
          className="h-8 w-8"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        {!collapsed && (
          <span className="ml-2 text-lg font-semibold text-primary">
            GeoBEE
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        {isAdmin && (
          <NavItem
            to="/usuarios"
            icon={Users}
            label="Usuarios"
            collapsed={collapsed}
          />
        )}
      </nav>

      <div className="space-y-3 border-t p-2">
        <SpaceIndicator
          used={apiaries.length + meliponaries.length}
          max={user?.maxLocations ?? 5}
          apiariesCount={apiaries.length}
          meliponariesCount={meliponaries.length}
          collapsed={collapsed}
        />
        <Separator />
        <UserMenu collapsed={collapsed} user={user} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!collapsed && <span className="ml-2">Recolher</span>}
        </Button>
      </div>
    </aside>
  )
}
