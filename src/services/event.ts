const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

export const EventService = {
  async create(payload: { slug: string; titulo: string; descripcion?: string; theme?: string; activo?: boolean; fecha_inicio?: string; fecha_fin?: string; subtitle?: string; discount_text?: string }, token: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error creando evento')
    return res.json()
  },

  async listAll() {
    const res = await fetch(`${API_BASE_URL}/api/eventos`)
    if (!res.ok) throw new Error('Error listando eventos')
    return res.json()
  },

  async update(slug: string, payload: any, token: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error actualizando evento')
    return res.json()
  },

  async remove(slug: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error eliminando evento')
    return res.json()
  },
  async addToEvent(slug: string, productIds: string[], token?: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/agregar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ product_ids: productIds })
    })
    if (!res.ok) throw new Error('Error agregando productos al evento')
    return res.json()
  },

  async removeFromEvent(slug: string, productIds: string[], token?: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/remover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ product_ids: productIds })
    })
    if (!res.ok) throw new Error('Error removiendo productos del evento')
    return res.json()
  },

  async list(slug: string) {
    const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/productos`)
    return res.json()
  }
  ,
  async listActive() {
    const res = await fetch(`${API_BASE_URL}/api/eventos/activos`)
    if (!res.ok) throw new Error('Error listando eventos activos')
    return res.json()
  }
}
