import { MERCADOPAGO_CONFIG } from '../config/mercadopago'
import { PreferenceRequest, PreferenceItem, PayerInfo } from '../types/mercadopago'

// Servicio para crear preferencias de MercadoPago (Checkout Pro)
export class MercadoPagoService {
  
  /**
   * Crea una preferencia usando Checkout Pro (para cobrar en USD)
   */
  static async createCheckoutProPreference(
    cartItems: any[],
    customerData: any,
    cupon_codigo?: string
  ): Promise<{ preferenceId: string; init_point: string }> {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/checkout-pro/create-preference-checkout-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            cantidad: item.cantidad,
            price: item.price
          })),
          customerData: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address
          },
          cupon_codigo: cupon_codigo || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error creating preference: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Preferencia de Checkout Pro creada:', result)
      
      return {
        preferenceId: result.preferenceId,
        init_point: result.init_point
      }
    } catch (error) {
      console.error('Error creating Checkout Pro preference:', error)
      throw error
    }
  }
  
  /**
   * Crea una preferencia en MercadoPago
   */
  static async createPreference(
    items: PreferenceItem[],
    payer: PayerInfo,
    externalReference?: string
  ): Promise<{ preferenceId: string; initPoint: string }> {
    
    const preferenceData: PreferenceRequest = {
      items,
      payer,
      back_urls: {
        success: `${window.location.origin}${MERCADOPAGO_CONFIG.SUCCESS_URL}`,
        failure: `${window.location.origin}${MERCADOPAGO_CONFIG.FAILURE_URL}`,
        pending: `${window.location.origin}${MERCADOPAGO_CONFIG.PENDING_URL}`
      },
      auto_return: 'approved',
      external_reference: externalReference || `ORDER-${Date.now()}`
    }

    try {
      // En un entorno real, esto debería ir a tu backend
      // El backend debería manejar las credenciales privadas de MercadoPago
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/create_preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData)
      })

      console.log(response)
      if (!response.ok) {
        throw new Error(`Error creating preference: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        preferenceId: result.id,
        initPoint: result.init_point
      }
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error)
      throw error
    }
  }

  /**
   * Procesa el pago usando el formulario del Payment Brick
   */
  static async processPayment(formData: any, cartItems?: any[], customerData?: any): Promise<any> {
    try {
      // Preparar los datos para enviar al backend
      const paymentData = {
        ...formData,
        // Agregar información del carrito y cliente
        items: cartItems ? this.formatCartItemsForMP(cartItems) : [],
        customer: customerData ? this.formatCustomerDataForMP(customerData) : null,
        external_reference: `ORDER-${Date.now()}`
      };

      console.log('📤 Enviando datos al backend:', paymentData)

      const response = await fetch(MERCADOPAGO_CONFIG.BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error(`Error processing payment: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  /**
   * Convierte los items del carrito al formato de MercadoPago
   */
  static formatCartItemsForMP(cartItems: any[]): PreferenceItem[] {
    return cartItems.map((item, index) => ({
      id: item.ml_id?.toString() || item.id?.toString() || index.toString(),
      title: item.name || item.title,
      quantity: item.cantidad || item.quantity || 1,
      currency_id: 'USD', // 💵 Dólares estadounidenses
      unit_price: item.price
    }))
  }

  /**
   * Convierte los datos del cliente al formato de MercadoPago
   */
  static formatCustomerDataForMP(customerData: any): PayerInfo {
    return {
      name: customerData.name,
      email: customerData.email,
      phone: {
        area_code: '598', // Código de área de Uruguay
        number: customerData.phone.replace(/\D/g, '') // Remover caracteres no numéricos
      },
      address: {
        street_name: customerData.address,
        street_number: '1', // Podrías extraer esto de la dirección
        zip_code: customerData.postalCode || '11000'
      }
    }
  }
}
