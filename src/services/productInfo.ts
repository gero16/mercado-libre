const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

export interface ProductoBD {
  _id: string
  ml_id: string
  title: string
  price: number
  available_quantity: number
  status: string
  seller_sku?: string
  catalog_product_id?: string
  es_catalogo?: boolean
  tipo_venta?: 'stock_fisico' | 'dropshipping' | 'mixto'
  stock_fisico?: {
    cantidad_disponible: number
    ubicacion: string
    reorder_point: number
    ultima_actualizacion_stock: Date
  }
  last_updated: Date
}

export interface ProductoML {
  ml_id: string
  title: string
  price: number
  available_quantity: number
  sold_quantity: number
  status: string
  condition: string
  permalink: string
  category_id: string
  listing_type_id: string
  health: number
  shipping: {
    mode?: string
    free_shipping?: boolean
    logistic_type?: string
  }
  date_created: string
  last_updated: string
}

export interface ComparacionStock {
  stock_bd: number
  stock_ml: number | null
  diferencia: number | null
  sincronizado: boolean | null
}

export interface ProductInfoResponse {
  producto_bd: ProductoBD
  producto_ml: ProductoML | null
  comparacion_stock: ComparacionStock
  error_ml: string | null
}

export const ProductInfoService = {
  async getProductInfo(productId: string): Promise<ProductInfoResponse> {
    const res = await fetch(`${API_BASE_URL}/api/producto/${productId}/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error?.error || `Error ${res.status}: ${res.statusText}`)
    }
    
    return res.json()
  }
}

