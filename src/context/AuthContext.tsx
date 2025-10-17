import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthService, AuthUser } from '../services/auth'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(AuthService.getStoredUser())
  const [token, setToken] = useState<string | null>(AuthService.getToken())

  useEffect(() => {
    const t = AuthService.getToken()
    if (t) {
      setToken(t)
      if (typeof (AuthService as any).me === 'function') {
        ;(AuthService as any).me().then(({ user }: { user: AuthUser }) => {
          setUser(user)
        }).catch(() => {
          // Mantener sesión con datos locales si /auth/me falla
        })
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { token, user } = await AuthService.login(email, password)
    setUser(user)
    setToken(token)
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setToken(null)
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout
  }), [user, token])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
