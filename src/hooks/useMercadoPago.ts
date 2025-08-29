import { useState } from 'react'
import { MercadoPagoService } from '../services/mercadopago'
import { CartItem } from '../types'

interface CustomerData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
}

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [initPoint, setInitPoint] = useState<string | null>(null)

  const mercadoPagoService = new MercadoPagoService()

  const createPayment = async (cartItems: CartItem[], customerData: CustomerData) => {
    setIsLoading(true)
    setError(null)

    try {
      const preference = await mercadoPagoService.createPreference(cartItems, customerData)
      
      if (preference) {
        setPreferenceId(preference.id)
        setInitPoint(preference.init_point)
        return preference
      } else {
        throw new Error('No se pudo crear la preferencia de pago')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear el pago'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async (paymentId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const status = await mercadoPagoService.getPaymentStatus(paymentId)
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar el estado del pago'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setPreferenceId(null)
    setInitPoint(null)
    setIsLoading(false)
  }

  return {
    isLoading,
    error,
    preferenceId,
    initPoint,
    createPayment,
    checkPaymentStatus,
    resetState
  }
}