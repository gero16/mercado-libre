import { ProductoML } from '../types'

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
      const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
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
}

// Exportar instancia singleton
export const productsCache = new ProductsCacheService()

