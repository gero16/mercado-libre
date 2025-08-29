// Tipos para Mercado Pago
export interface MercadoPagoItem {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
  description?: string
  picture_url?: string
}

export interface MercadoPagoPayer {
  name: string
  surname?: string
  email: string
  phone?: {
    area_code: string
    number: string
  }
  address?: {
    street_name: string
    street_number: string
    zip_code: string
  }
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[]
  payer: MercadoPagoPayer
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: 'approved' | 'all'
  payment_methods: {
    excluded_payment_methods: Array<{ id: string }>
    excluded_payment_types: Array<{ id: string }>
  }
  shipments?: {
    mode: string
    cost: number
    receiver_address: {
      street_name: string
      street_number: string
      zip_code: string
      city_name: string
      state_name: string
    }
  }
}

export interface MercadoPagoError {
  error: string
  message: string
  status: number
}