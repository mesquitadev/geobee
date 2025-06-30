// src/pages/NotFound/index.tsx
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mb-4 text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/inicio" className="text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  )
}

export default NotFound
