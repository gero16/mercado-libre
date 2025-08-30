// Configuración de MercadoPago
export const MERCADOPAGO_CONFIG = {
  // IMPORTANTE: Necesitas reemplazar con tu Public Key REAL de MercadoPago
  // 
  // Para obtener tus claves:
  // 1. Ve a: https://www.mercadopago.com/developers/panel/app
  // 2. Crea una aplicación o selecciona una existente
  // 3. Ve a la sección "Credenciales" 
  // 4. Copia tu "Public key" de TEST o PROD
  //
  // Ejemplos de claves reales:
  // TEST: TEST-1234567890-123456-abc123def456-0a1b2c3d4e5f
  // PROD: APP_USR-1234567890-123456-abc123def456-0a1b2c3d4e5f
  PUBLIC_KEY: 'TEST-public-key-xxx', // ⚠️ REEMPLAZA CON TU CLAVE REAL
  
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
