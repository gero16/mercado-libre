import { ProductoML } from '../types'
import { AuthService } from './auth'

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || PROD_BACKEND

// 🚀 Servicio de caché para productos ML
// Permite que múltiples componentes compartan una única llamada HTTP

class ProductsCacheService {
  private cache: ProductoML[] | null = null
  private loading: boolean = false
  private cacheTime: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
  private callbacks: ((products: ProductoML[]) => void)[] = []
  // 🆕 Caché en memoria por URL para respuestas paginadas
  private pageResponseCache: Map<string, { time: number; data: { total: number; items: ProductoML[] } }> = new Map()

  async getProducts(): Promise<ProductoML[]> {
    // Si ya tenemos cache válido, devolverlo inmediatamente
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('✅ Usando productos desde caché')
      return Promise.resolve(this.cache)
    }

    // Si ya hay una petición en curso, esperar a que termine
    if (this.loading) {
      console.log('⏳ Esperando petición en curso...')
      return new Promise((resolve) => {
        this.callbacks.push(resolve)
      })
    }

    // Hacer nueva petición
    console.log('🌐 Cargando productos desde API...')
    this.loading = true

    try {
      const response = await fetch(`${API_BASE_URL}/ml/productos?_ts=${Date.now()}`)
      if (!response.ok) {
        throw new Error(`Error obteniendo productos (${response.status})`)
      }
      const data: ProductoML[] = await response.json()
      
      this.cache = data
      this.cacheTime = Date.now()
      this.loading = false

      // Notificar a todos los callbacks esperando
      this.callbacks.forEach(callback => callback(data))
      this.callbacks = []

      console.log(`✅ Productos cargados: ${data.length} items`)
      return data
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      this.loading = false
      this.callbacks = []
      throw error
    }
  }

  // Limpiar caché manualmente si es necesario
  clearCache() {
    this.cache = null
    this.cacheTime = 0
    this.pageResponseCache.clear()
    console.log('🗑️ Caché limpiado')
  }

  // 🆕 Paginado desde servidor
  async getProductsPage(
    params: { limit: number; offset: number; fields?: string; status?: 'all' | 'active' | 'paused'; q?: string; categoryIds?: string | string[] },
    preferNoFields?: boolean
  ): Promise<{ total: number; items: ProductoML[] }> {
    const buildQS = (omitFields = false) => {
      const qs = new URLSearchParams()
      qs.set('limit', String(params.limit))
      qs.set('offset', String(params.offset))
      if (!omitFields && params.fields) qs.set('fields', params.fields)
      if (params.status && params.status !== 'all') qs.set('status', params.status)
      if (params.q && params.q.trim().length > 0) qs.set('q', params.q.trim())
      if (params.categoryIds) {
        const csv = Array.isArray(params.categoryIds) ? params.categoryIds.join(',') : params.categoryIds
        if (csv.trim().length > 0) qs.set('categoryIds', csv)
      }
      return qs
    }

    // URLs sin _ts para permitir caché HTTP/CDN y memo local
    const urlPrimary = `${API_BASE_URL}/ml/productos?${buildQS(!!preferNoFields).toString()}`
    const urlFallback = `${API_BASE_URL}/ml/productos?${buildQS(!preferNoFields).toString()}`

    // Memo en memoria breve
    const now = Date.now()
    const memo = this.pageResponseCache.get(urlPrimary)
    if (memo && (now - memo.time) < this.CACHE_DURATION) {
      return memo.data
    }

    // Estrategia: si preferNoFields, intentamos primero sin fields; si no, con fields primero
    let response = await fetch(urlPrimary)
    if (!response.ok) {
      try {
        response = await fetch(urlFallback)
      } catch {}
    }
    if (!response.ok) throw new Error('Error obteniendo productos paginados')
    const data = await response.json()

    // Nueva versión paginada del backend activo { productos, pagination }
    if (data && Array.isArray(data.productos) && data.pagination && typeof data.pagination.total === 'number') {
      const result = { total: data.pagination.total, items: data.productos }
      this.pageResponseCache.set(urlPrimary, { time: now, data: result })
      return result
    }

    // Soportar backends antiguos que devuelven array directo o {registros: [...]}
    if (Array.isArray(data)) {
      const total = data.length
      const start = Math.max(0, params.offset)
      const end = Math.min(total, start + params.limit)
      const items = data.slice(start, end)
      const result = { total, items }
      this.pageResponseCache.set(urlPrimary, { time: now, data: result })
      return result
    }
    if (data && Array.isArray(data.registros)) {
      // respuesta de /api/productos del backend viejo
      const registros = data.registros
      const total = registros.length
      const start = Math.max(0, params.offset)
      const end = Math.min(total, start + params.limit)
      const items = registros.slice(start, end)
      const result = { total, items }
      this.pageResponseCache.set(urlPrimary, { time: now, data: result })
      return result
    }

    // Nueva versión paginada { total, items }
    if (typeof data === 'object' && data && Array.isArray(data.items) && typeof data.total === 'number') {
      const result = { total: data.total, items: data.items }
      this.pageResponseCache.set(urlPrimary, { time: now, data: result })
      return result
    }

    // Fallback seguro
    const items = Array.isArray(data?.items) ? data.items : []
    const total = typeof data?.total === 'number' ? data.total : items.length
    const result = { total, items }
    this.pageResponseCache.set(urlPrimary, { time: now, data: result })
    return result
  }

  // 🆕 Paginado para Admin (endpoint protegido)
  async getAdminProductsPage(
    params: { limit: number; offset: number; fields?: string; status?: 'all' | 'active' | 'paused'; q?: string },
    preferNoFields?: boolean
  ): Promise<{ total: number; items: ProductoML[] }> {
    const qs = new URLSearchParams()
    qs.set('limit', String(params.limit))
    qs.set('offset', String(params.offset))
    if (params.fields) qs.set('fields', params.fields)
    if (params.status && params.status !== 'all') qs.set('status', params.status)
    if (params.q && params.q.trim().length > 0) qs.set('q', params.q.trim())
    qs.set('_ts', String(Date.now()))

    const headers: Record<string, string> = {
      ...(AuthService.getAuthHeader()),
    }
    // Intentar con/sin fields según preferNoFields
    const makeUrl = (omitFields: boolean) => {
      const q = new URLSearchParams(qs)
      if (omitFields) q.delete('fields')
      return `${API_BASE_URL}/ml/admin/productos?${q.toString()}`
    }
    let response = await fetch(makeUrl(!!preferNoFields), { headers })
    if (!response.ok) {
      try {
        response = await fetch(makeUrl(!preferNoFields), { headers })
      } catch {}
    }
    if (!response.ok) throw new Error('Error obteniendo productos paginados')
    const data = await response.json()
    // Forma A (admin v1): { productos, pagination: { total } }
    if (data && Array.isArray(data.productos) && data.pagination && typeof data.pagination.total === 'number') {
      return { total: data.pagination.total, items: data.productos }
    }
    // Forma B (admin v2): { total, items }
    if (typeof data === 'object' && data && Array.isArray(data.items) && typeof data.total === 'number') {
      // Si admin devuelve vacío, hacer fallback a público paginado
      if ((data.total || 0) === 0 && data.items.length === 0) {
        return this.getProductsPage({
          limit: params.limit,
          offset: params.offset,
          fields: params.fields,
          status: params.status,
          q: params.q
        }, preferNoFields)
      }
      return { total: data.total, items: data.items }
    }
    const items = Array.isArray(data?.items) ? data.items : []
    const total = typeof data?.total === 'number' ? data.total : items.length
    // Fallback a público si sigue vacío
    if (total === 0 && items.length === 0) {
      return this.getProductsPage({
        limit: params.limit,
        offset: params.offset,
        fields: params.fields,
        status: params.status,
        q: params.q
      }, preferNoFields)
    }
    return { total, items }
  }

  // 🆕 Productos por categorías ML (usa nuevo endpoint backend)
  async getProductsByCategories(
    params: { categoryIds: string | string[]; limit?: number; offset?: number; fields?: string; status?: 'all' | 'active' | 'paused' },
    preferNoFields?: boolean
  ): Promise<{ total: number; items: ProductoML[] }> {
    const qp = new URLSearchParams()
    const csv = Array.isArray(params.categoryIds) ? params.categoryIds.join(',') : params.categoryIds
    qp.set('categoryIds', csv)
    if (typeof params.limit === 'number') qp.set('limit', String(params.limit))
    if (typeof params.offset === 'number') qp.set('offset', String(params.offset))
    if (params.fields) qp.set('fields', params.fields)
    if (params.status && params.status !== 'all') qp.set('status', params.status)
    const url = `${API_BASE_URL}/ml/categories/productos?${qp.toString()}`
    // Intento respetando preferNoFields: si está activo, quitamos fields del query
    const urlWithoutFields = (() => {
      const q2 = new URLSearchParams(qp)
      q2.delete('fields')
      return `${API_BASE_URL}/ml/categories/productos?${q2.toString()}`
    })()
    // Memo por URL para categorías
    const now = Date.now()
    const key = preferNoFields ? urlWithoutFields : url
    const memo = this.pageResponseCache.get(key)
    if (memo && (now - memo.time) < this.CACHE_DURATION) {
      return memo.data
    }

    let response = await fetch(key)
    if (!response.ok) {
      try {
        response = await fetch(preferNoFields ? url : urlWithoutFields)
      } catch {}
    }
    if (!response.ok) throw new Error('Error obteniendo productos por categoría')
    const data = await response.json()
    if (typeof data?.total === 'number' && Array.isArray(data?.items)) {
      const result = { total: data.total, items: data.items }
      this.pageResponseCache.set(key, { time: now, data: result })
      return result
    }
    const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
    const total = typeof data?.total === 'number' ? data.total : items.length
    const result = { total, items }
    this.pageResponseCache.set(key, { time: now, data: result })
    return result
  }
}

// Exportar instancia singleton
export const productsCache = new ProductsCacheService()

