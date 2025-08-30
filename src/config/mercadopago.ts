// Configuración de MercadoPago
export const MERCADOPAGO_CONFIG = {
  // Reemplaza con tu Public Key de MercadoPago
  // Para testing puedes usar TEST-public-key-xxx
  // Para producción usa APP_USR-public-key-xxx
  PUBLIC_KEY: 'TEST-public-key-xxx', // Reemplaza con tu public key
  
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
