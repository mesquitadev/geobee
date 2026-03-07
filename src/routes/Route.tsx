import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/Layout/app-layout'
import { getToken } from '../utils/auth'

const PrivateRoute: React.FC = () => {
  const token = getToken()

  return token ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/" />
  )
}

const PublicRoute: React.FC = () => {
  const token = getToken()
  return token ? <Navigate to="/home" /> : <Outlet />
}

export { PrivateRoute, PublicRoute }
