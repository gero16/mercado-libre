// Configuración de Mercado Pago
export const mercadoPagoConfig = {
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '',
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || '',
  environment: import.meta.env.VITE_NODE_ENV === 'production' ? 'production' : 'sandbox',
  
  // Configuración de la preferencia de pago
  preferenceOptions: {
    currency: 'UYU', // Peso uruguayo
    marketplace_fee: 0,
    notification_url: '', // URL para notificaciones IPN
    back_urls: {
      success: window.location.origin + '/checkout/success',
      failure: window.location.origin + '/checkout/failure',
      pending: window.location.origin + '/checkout/pending'
    },
    auto_return: 'approved' as const
  }
}

// Función para validar la configuración
export const validateMercadoPagoConfig = (): boolean => {
  if (!mercadoPagoConfig.publicKey) {
    console.error('Mercado Pago Public Key no está configurado')
    return false
  }
  
  if (!mercadoPagoConfig.accessToken) {
    console.error('Mercado Pago Access Token no está configurado')
    return false
  }
  
  return true
}