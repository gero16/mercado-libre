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

export interface ClientePerfil {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: {
    calle: string
    numero: string
    apartamento?: string
    codigo_postal: string
    ciudad: string
    departamento: string
    pais: string
  }
  fecha_registro?: string
  ultima_actividad?: string
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

  async register(
    nombre: string, 
    email: string, 
    password: string,
    datosAdicionales?: {
      apellido?: string;
      telefono?: string;
      direccion?: {
        calle?: string;
        numero?: string;
        apartamento?: string;
        codigo_postal?: string;
        ciudad?: string;
        departamento?: string;
        pais?: string;
      };
    }
  ): Promise<LoginResponse> {
    const body: any = { nombre, email, password };
    
    if (datosAdicionales) {
      if (datosAdicionales.apellido) body.apellido = datosAdicionales.apellido;
      if (datosAdicionales.telefono) body.telefono = datosAdicionales.telefono;
      if (datosAdicionales.direccion) body.direccion = datosAdicionales.direccion;
    }
    
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Error registrando usuario')
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

  async getProfile(): Promise<ClientePerfil | null> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...this.getAuthHeader() }
    if (!headers.Authorization) return null
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, { headers })
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error('Error obteniendo perfil')
      }
      const data = await res.json()
      return data.cliente || null
    } catch {
      return null
    }
  },

  async updateProfile(perfilData: {
    nombre?: string
    apellido?: string
    telefono?: string
    direccion?: {
      calle?: string
      numero?: string
      apartamento?: string
      codigo_postal?: string
      ciudad?: string
      departamento?: string
      pais?: string
    }
  }): Promise<ClientePerfil> {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json', 
      ...this.getAuthHeader() 
    }
    if (!headers.Authorization) {
      throw new Error('No autenticado')
    }
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(perfilData)
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.error || 'Error actualizando perfil')
    }
    const data = await res.json()
    return data.cliente
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
