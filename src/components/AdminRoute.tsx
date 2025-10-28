import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthService } from '../services/auth'

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const effectiveUser = user || AuthService.getStoredUser()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!effectiveUser || String(effectiveUser.rol).toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default AdminRoute


