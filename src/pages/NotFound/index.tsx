import React from 'react'
import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-zinc-900">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <SearchX className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="mt-6 text-6xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-zinc-700 dark:text-zinc-300">
        Página não encontrada
      </h2>
      <p className="mt-3 max-w-md text-zinc-500 dark:text-zinc-400">
        A página que você está procurando não existe ou foi movida para outro endereço.
      </p>
      <Link
        to="/home"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <Home className="h-4 w-4" />
        Voltar ao início
      </Link>
    </div>
  )
}

export default NotFound
