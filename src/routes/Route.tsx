import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'

const PrivateRoute: React.FC = () => {
  const { token } = useAuth()

  return token ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/" />
  )
}

const PublicRoute: React.FC = () => {
  const { token } = useAuth()
  return token ? <Navigate to="/home" /> : <Outlet />
}

export { PrivateRoute, PublicRoute }
