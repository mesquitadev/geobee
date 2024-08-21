import { ReactNode } from 'react'
import Sidebar from './Sidebar.tsx'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen  lg:grid lg:grid-cols-app">
      <Sidebar />
      <main className="w-screen h-screen lg:col-start-2 lg:w-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
