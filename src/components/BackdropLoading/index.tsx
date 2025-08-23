// BackdropLoading.tsx
import React from 'react'
import './styles.css'

interface BackdropLoadingProps {
  isLoading: boolean
}

const BackdropLoading: React.FC<BackdropLoadingProps> = ({
  isLoading,
  children,
}) => {
  if (isLoading) {
    return (
      <>
        {children}
        <div
          className="z-9999 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="loader"></div>
        </div>
      </>
    )
  }
  return <>{children}</>
}

export default BackdropLoading
