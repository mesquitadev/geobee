import {
  MapPin,
  MapPinned,
  Layers,
  Users,
  Settings,
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
import { NavGroup } from './nav-group'
import { UserMenu } from './user-menu'
import { SpaceIndicator } from './space-indicator'
import logoGeobee from '@/assets/logo-geobee.svg'

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
          'flex items-center border-b bg-primary/10',
          collapsed ? 'h-14 justify-center px-2' : 'h-16 gap-2 px-3'
        )}
      >
        <img
          src={logoGeobee}
          alt="GeoBEE"
          className={cn(
            'shrink-0 object-contain',
            collapsed ? 'h-9 w-9' : 'h-10 w-10'
          )}
        />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-accent-foreground">
            Geo<span className="text-primary">BEE</span>
          </span>
        )}
      </div>

      <nav className={cn('flex-1 overflow-y-auto', collapsed ? 'flex flex-col items-center gap-3 px-2 pt-6' : 'space-y-1 p-2')}>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        {isAdmin && (
          <NavGroup
            icon={Settings}
            label="Gestão"
            collapsed={collapsed}
            children={[
              { to: '/meus-mapas', icon: Layers, label: 'Mapas' },
              { to: '/usuarios', icon: Users, label: 'Usuários' },
            ]}
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
