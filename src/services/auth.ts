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

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000'

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
    return data
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

  getAuthHeader(): Record<string, string> {
    const t = this.getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
  },

  logout() {
    localStorage.removeItem('auth_token')
  }
}

function saveToken(token: string) {
  localStorage.setItem('auth_token', token)
}

async function safeJson(res: Response) {
  try { return await res.json() } catch { return null }
}
