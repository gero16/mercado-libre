export const FEATURE_FLAGS = {
  DISABLE_CHECKOUT: false, // poner en false para habilitar nuevamente
  USE_CHECKOUT_PRO_SANDBOX: false, // usar init_point en producción
  USE_CHECKOUT_PRO: true, // activar flujo de Checkout Pro en el frontend
  // Temporal: manejar moneda en UYU en frontend y payloads
  PRICE_IN_UYU: false,
  PRICE_CONVERSION_RATE: 1, // multiplica montos (ej: 40 si tus precios base están en USD)
}
