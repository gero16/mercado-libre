import { ProductoML } from '../types'

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
    console.log('🗑️ Caché limpiado')
  }

  // 🆕 Paginado desde servidor
  async getProductsPage(params: { limit: number; offset: number; fields?: string; status?: 'all' | 'active' | 'paused' }): Promise<{ total: number; items: ProductoML[] }> {
    const qp = new URLSearchParams()
    qp.set('limit', String(params.limit))
    qp.set('offset', String(params.offset))
    if (params.fields) qp.set('fields', params.fields)
    if (params.status && params.status !== 'all') qp.set('status', params.status)
    qp.set('_ts', String(Date.now()))
    const response = await fetch(`${API_BASE_URL}/ml/productos?${qp.toString()}`)
    if (!response.ok) throw new Error('Error obteniendo productos paginados')
    const data = await response.json()

    // Soportar backends antiguos que devuelven array directo o {registros: [...]}
    if (Array.isArray(data)) {
      const total = data.length
      const start = Math.max(0, params.offset)
      const end = Math.min(total, start + params.limit)
      const items = data.slice(start, end)
      return { total, items }
    }
    if (data && Array.isArray(data.registros)) {
      // respuesta de /api/productos del backend viejo
      const registros = data.registros
      const total = registros.length
      const start = Math.max(0, params.offset)
      const end = Math.min(total, start + params.limit)
      const items = registros.slice(start, end)
      return { total, items }
    }

    // Nueva versión paginada { total, items }
    if (typeof data === 'object' && data && Array.isArray(data.items) && typeof data.total === 'number') {
      return { total: data.total, items: data.items }
    }

    // Fallback seguro
    const items = Array.isArray(data?.items) ? data.items : []
    const total = typeof data?.total === 'number' ? data.total : items.length
    return { total, items }
  }
}

// Exportar instancia singleton
export const productsCache = new ProductsCacheService()

