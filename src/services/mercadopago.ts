import { MercadoPagoItem, MercadoPagoPayer, MercadoPagoPreference } from '../types/mercadopago'
import { mercadoPagoConfig, validateMercadoPagoConfig } from '../config/mercadopago'
import { CartItem } from '../types'

// Servicio para manejar la integración con Mercado Pago
export class MercadoPagoService {
  private accessToken: string

  constructor() {
    this.accessToken = mercadoPagoConfig.accessToken
  }

  // Convertir items del carrito a formato de Mercado Pago
  private formatCartItems(cartItems: CartItem[]): MercadoPagoItem[] {
    return cartItems.map(item => ({
      title: item.name,
      quantity: item.cantidad,
      unit_price: item.price,
      currency_id: 'UYU',
      description: `${item.name} - Tienda Virtual`,
      picture_url: item.image.startsWith('http') ? item.image : `${window.location.origin}/${item.image}`
    }))
  }

  // Crear preferencia de pago
  async createPreference(
    cartItems: CartItem[], 
    customerData: { name: string; email: string; phone: string; address: string; city: string; state: string; postalCode: string }
  ): Promise<{ init_point: string; id: string } | null> {
    if (!validateMercadoPagoConfig()) {
      throw new Error('Configuración de Mercado Pago inválida')
    }

    const items = this.formatCartItems(cartItems)
    
    // Dividir nombre en nombre y apellido
    const nameParts = customerData.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const payer: MercadoPagoPayer = {
      name: firstName,
      surname: lastName,
      email: customerData.email,
      phone: {
        area_code: '598', // Código de área de Uruguay
        number: customerData.phone.replace(/[^\d]/g, '') // Solo números
      },
      address: {
        street_name: customerData.address,
        street_number: '1',
        zip_code: customerData.postalCode || '11000'
      }
    }

    const preference: MercadoPagoPreference = {
      items,
      payer,
      back_urls: mercadoPagoConfig.preferenceOptions.back_urls,
      auto_return: mercadoPagoConfig.preferenceOptions.auto_return,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: []
      },
      shipments: {
        mode: 'custom',
        cost: 0,
        receiver_address: {
          street_name: customerData.address,
          street_number: '1',
          zip_code: customerData.postalCode || '11000',
          city_name: customerData.city,
          state_name: customerData.state
        }
      }
    }

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error al crear preferencia:', errorData)
        throw new Error('Error al crear la preferencia de pago')
      }

      const data = await response.json()
      return {
        init_point: data.init_point,
        id: data.id
      }
    } catch (error) {
      console.error('Error en la integración con Mercado Pago:', error)
      throw error
    }
  }

  // Validar estado del pago
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener el estado del pago')
      }

      return await response.json()
    } catch (error) {
      console.error('Error al verificar el pago:', error)
      throw error
    }
  }
}