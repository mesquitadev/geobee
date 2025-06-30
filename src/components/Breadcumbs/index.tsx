import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  pageName: string
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {pageName}
      </h2>

      <nav
        aria-label="Breadcrumb"
        className="overflow-x-auto whitespace-nowrap scrollbar-none"
      >
        <ol className="flex items-center gap-1 text-sm">
          <li className="flex items-center">
            <Link
              className="flex items-center text-gray-500 transition-colors hover:text-indigo-600"
              to="/"
            >
              <Home className="mr-1 h-3.5 w-3.5" />
              <span>Início</span>
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="mx-1 h-3.5 w-3.5 text-gray-400" />
            <span
              className="font-medium text-indigo-600 dark:text-indigo-400"
              aria-current="page"
            >
              {pageName}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  )
}

export default Breadcrumb
