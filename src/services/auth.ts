export interface AuthUser {
  id: string
  nombre: string
  email: string
  rol: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
// Preferir variable de entorno; si no está, elegir Railway en producción y localhost en desarrollo
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Error de login')
    }
    const data = await res.json()
    saveToken(data.token)
    saveUser(data.user)
    return data
  },

  async me(): Promise<{ user: AuthUser } | null> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...this.getAuthHeader() }
    if (!headers.Authorization) return null
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async registerFirstAdmin(nombre: string, email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Error registrando admin')
    }
    const data = await res.json()
    saveToken(data.token)
    return data
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user')
    if (!raw) return null
    try { return JSON.parse(raw) as AuthUser } catch { return null }
  },

  getAuthHeader(): Record<string, string> {
    const t = this.getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}

function saveToken(token: string) {
  localStorage.setItem('auth_token', token)
}

function saveUser(user: AuthUser) {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

async function safeJson(res: Response) {
  try { return await res.json() } catch { return null }
}
