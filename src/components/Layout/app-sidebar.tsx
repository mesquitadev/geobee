import {
  MapPin,
  MapPinned,
  Layers,
  Users,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useGetApiariesQuery } from '@/redux/slices/apiariesSlice'
import { useGetMeliponariesQuery } from '@/redux/slices/meliponarySlice'
import { usePermissions } from '@/hooks/usePermissions'
import { NavItem } from './nav-item'
import { UserMenu } from './user-menu'
import { SpaceIndicator } from './space-indicator'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user, isAdmin } = usePermissions()
  const { data: apiaries = [] } = useGetApiariesQuery()
  const { data: meliponaries = [] } = useGetMeliponariesQuery()

  const navItems = [
    { to: '/home', icon: MapPin, label: 'Mapa' },
    { to: '/meus-locais', icon: MapPinned, label: 'Meus Locais' },
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

      <nav className={cn('flex-1 overflow-y-auto', collapsed ? 'flex flex-col items-center gap-3 px-2 pt-6' : 'space-y-1 p-2')}>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        {isAdmin && (
          <NavItem
            to="/meus-mapas"
            icon={Layers}
            label="Mapas"
            collapsed={collapsed}
          />
        )}
        {isAdmin && (
          <NavItem
            to="/usuarios"
            icon={Users}
            label="Usuarios"
            collapsed={collapsed}
          />
        )}
      </nav>

      <div className={cn('border-t', collapsed ? 'flex flex-col items-center gap-3 py-4' : 'space-y-3 p-2')}>
        <SpaceIndicator
          used={apiaries.length + meliponaries.length}
          max={user?.maxLocations ?? 5}
          apiariesCount={apiaries.length}
          meliponariesCount={meliponaries.length}
          collapsed={collapsed}
        />
        {!collapsed && <Separator />}
        <UserMenu collapsed={collapsed} user={user} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary',
            collapsed ? 'h-11 w-11 justify-center' : 'w-full justify-start'
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
