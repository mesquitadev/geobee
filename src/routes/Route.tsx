import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Layout from '../components/Layout'
import { getToken } from '../utils/auth' // Adjust the import based on where you place the getToken function

const PrivateRoute: React.FC = () => {
  const token = getToken()

  return token ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/" />
  )
}

const PublicRoute: React.FC = () => {
  const token = getToken()
  return token ? <Navigate to="/home" /> : <Outlet />
}

export { PrivateRoute, PublicRoute }
