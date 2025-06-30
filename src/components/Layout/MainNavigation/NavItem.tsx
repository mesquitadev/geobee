import { ChevronRight } from 'lucide-react'
import { ElementType } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItemProps {
  title: string
  to: string
  icon: ElementType
}

const NavItem = ({ title, to, icon: Icon }: NavItemProps) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <nav className="w-full space-y-0.5">
      <Link
        to={to}
        className={`group flex items-center gap-3 rounded-lg px-4 py-3 outline-none transition-all duration-200 
          ${
            isActive
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
              : 'hover:bg-violet-50 dark:hover:bg-zinc-800'
          } focus-visible:ring-2 focus-visible:ring-violet-500`}
      >
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${
            isActive
              ? 'text-violet-700 dark:text-violet-300'
              : 'text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400'
          }`}
        />
        <span
          className={`font-medium ${
            isActive
              ? 'text-violet-700 dark:text-violet-300'
              : 'text-zinc-700 group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400'
          }`}
        >
          {title}
        </span>
        <ChevronRight
          className={`ml-auto h-5 w-5 transition-transform group-hover:translate-x-1 ${
            isActive
              ? 'text-violet-700 dark:text-violet-300'
              : 'text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400'
          }`}
        />
      </Link>
    </nav>
  )
}

export default NavItem
