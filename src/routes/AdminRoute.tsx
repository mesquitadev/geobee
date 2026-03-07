import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading } = usePermissions()

  if (isLoading) return null
  if (!isAdmin) return <Navigate to="/home" replace />

  return <>{children}</>
}
