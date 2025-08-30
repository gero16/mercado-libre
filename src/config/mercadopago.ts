// Configuración de MercadoPago
export const MERCADOPAGO_CONFIG = {

  PUBLIC_KEY:  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY , // Reemplaza con tu public key

  // URLs de la aplicación
  SUCCESS_URL: '/payment-success',
  FAILURE_URL: '/payment-failure', 
  PENDING_URL: '/payment-pending',
  
  // URL del backend para procesar pagos
  BACKEND_URL: '/process_payment'
}

// Configuración de métodos de pago para el Brick
export const PAYMENT_METHODS_CONFIG = {
  ticket: "all",
  creditCard: "all", 
  prepaidCard: "all",
  debitCard: "all",
  mercadoPago: "all",
} as const
