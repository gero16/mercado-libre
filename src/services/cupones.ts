const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

export interface ValidacionCupon {
  valido: boolean
  error?: string
  cupon?: {
    _id: string
    codigo: string
    descripcion: string
    tipo_descuento: 'porcentaje' | 'monto_fijo'
    valor_descuento: number
  }
  descuento?: number
  monto_final?: number
}

export const CuponService = {
  async validar(codigo: string, montoCompra: number, emailUsuario?: string): Promise<ValidacionCupon> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cupones/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, monto_compra: montoCompra, email_usuario: emailUsuario })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error validando cupón' }))
        return { valido: false, error: err.error || 'Error validando cupón' }
      }

      return await res.json()
    } catch (error: any) {
      return { valido: false, error: error.message || 'Error de conexión' }
    }
  }
}

