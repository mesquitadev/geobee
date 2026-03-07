import { LogOut, Moon, Sun, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import useTheme from '@/hooks/useTheme'
import { User } from '@/redux/slices/usersSlice'

interface UserMenuProps {
  collapsed: boolean
  user?: User
}

export function UserMenu({ collapsed, user }: UserMenuProps) {
  const { signOut } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-auto rounded-xl transition-all duration-200 hover:bg-primary/10',
            collapsed
              ? 'h-11 w-11 justify-center p-0'
              : 'w-full justify-start gap-3 px-2 py-2'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">{user?.fullName}</span>
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate('/minha-conta')}>
          <UserCog className="mr-2 h-4 w-4" />
          Minha Conta
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {darkMode ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {darkMode ? 'Modo claro' : 'Modo escuro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
