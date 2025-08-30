import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MercadoPagoService } from '../services/mercadopago'
import { MERCADOPAGO_CONFIG, PAYMENT_METHODS_CONFIG } from '../config/mercadopago'
import type { PaymentInitialization, PaymentCustomization, PaymentFormData } from '../types/mercadopago'

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const navigate = useNavigate()

  /**
   * Crea una preferencia de MercadoPago con los items del carrito
   */
  const createPreference = useCallback(async (cartItems: any[], customerData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mpItems = MercadoPagoService.formatCartItemsForMP(cartItems)
      const mpPayer = MercadoPagoService.formatCustomerDataForMP(customerData)
      
      const { preferenceId: newPreferenceId } = await MercadoPagoService.createPreference(
        mpItems,
        mpPayer,
        `ORDER-${Date.now()}`
      )
      
      setPreferenceId(newPreferenceId)
      return newPreferenceId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando preferencia'
      setError(errorMessage)
      console.error('Error creating preference:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Configuración de inicialización del Payment Brick
   */
  const getInitialization = useCallback((amount: number, prefId?: string): PaymentInitialization => {
    return {
      amount,
      preferenceId: prefId || preferenceId || undefined,
      locale: 'es-AR' // Agregar esta línea para español
    }
  }, [preferenceId])

  /**
   * Configuración de personalización del Payment Brick
   */
  const getCustomization = useCallback((): PaymentCustomization => {
    return {
      paymentMethods: PAYMENT_METHODS_CONFIG
    }
  }, [])

  /**
   * Callback para cuando se envía el formulario de pago
   */
  const onSubmit = useCallback(async ({ formData }: PaymentFormData) => {
    setIsLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      MercadoPagoService.processPayment(formData)
        .then((response) => {
          console.log('Payment processed successfully:', response)
          // Navegar a página de éxito
          navigate(MERCADOPAGO_CONFIG.SUCCESS_URL)
          resolve(response)
        })
        .catch((error) => {
          console.error('Payment processing failed:', error)
          setError('Error procesando el pago')
          // Navegar a página de error
          navigate(MERCADOPAGO_CONFIG.FAILURE_URL)
          reject(error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    })
  }, [navigate])

  /**
   * Callback para errores del Payment Brick
   */
  const onError = useCallback(async (error: any) => {
    console.error('Payment Brick error:', error)
    setError(`Error en Payment Brick: ${error.message || 'Error desconocido'}`)
  }, [])

  /**
   * Callback para cuando el Payment Brick está listo
   */
  const onReady = useCallback(async () => {
    console.log('Payment Brick is ready')
    setError(null)
  }, [])

  return {
    // Estado
    isLoading,
    error,
    preferenceId,
    
    // Métodos
    createPreference,
    getInitialization,
    getCustomization,
    
    // Callbacks para Payment Brick
    onSubmit,
    onError,
    onReady,
    
    // Configuración
    publicKey: MERCADOPAGO_CONFIG.PUBLIC_KEY
  }
}
