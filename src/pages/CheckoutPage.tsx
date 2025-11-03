import React, { useState, useEffect, useCallback } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Payment } from '@mercadopago/sdk-react'
import { useMercadoPago } from '../hooks/useMercadoPago'
import { FEATURE_FLAGS } from '../config/featureFlags'
import { MercadoPagoService } from '../services/mercadopago'
import { CuponService, ValidacionCupon } from '../services/cupones'
import { useAuth } from '../context/AuthContext'

interface CustomerData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, setCartOpen } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const [showPaymentBrick, setShowPaymentBrick] = useState(false)
  const [isCreatingPreference, setIsCreatingPreference] = useState(false)
  
  // Estado para cupón - restaurar desde location state si viene de login/register
  const [cuponCodigo, setCuponCodigo] = useState(() => {
    const state = location.state as { cupon?: string } | null
    return state?.cupon || ''
  })
  const [cuponValidacion, setCuponValidacion] = useState<ValidacionCupon | null>(null)
  const [isValidatingCupon, setIsValidatingCupon] = useState(false)
  const [descuentoAplicado, setDescuentoAplicado] = useState(0)
  
  const {
    createPreference,
    getInitialization,
    getCustomization,
    onSubmit: originalOnSubmit,
    onError,
    onReady,
    preferenceId,
    isLoading: _mpLoading,
    error: _mpError
  } = useMercadoPago()

  // Efecto para controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showPaymentBrick) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPaymentBrick])

  // Efecto para cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPaymentBrick) {
        setShowPaymentBrick(false)
      }
    }

    if (showPaymentBrick) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showPaymentBrick])

  useEffect(() => {
    setCartOpen(false)
  }, [])

  // Validar cupón automáticamente cuando se restaura desde login/register
  useEffect(() => {
    const state = location.state as { cupon?: string } | null
    if (state?.cupon && user) {
      // El cupón ya está en el estado, se validará automáticamente por el otro useEffect
      // Solo necesitamos limpiar el state para evitar que se restaure en refresco
      if (state.cupon) {
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [user, location.state, navigate, location.pathname])

  // Validar cupón cuando cambia el código o el total
  useEffect(() => {
    const validarCupon = async () => {
      if (!cuponCodigo.trim()) {
        setCuponValidacion(null)
        setDescuentoAplicado(0)
        return
      }

      // Para cupón POPPYWEB, requiere usuario logueado
      const codigoUpper = cuponCodigo.toUpperCase().trim()
      if (codigoUpper === 'POPPYWEB' && !user) {
        setCuponValidacion({
          valido: false,
          error: 'Este cupón requiere una cuenta. Regístrate o inicia sesión para usarlo'
        })
        setDescuentoAplicado(0)
        return
      }

      setIsValidatingCupon(true)
      try {
        // Para usuarios logueados, siempre usar su email (no el del formulario)
        // Para usuarios no logueados, usar el email del formulario solo si lo ingresaron
        const emailParaValidar = user?.email || (customerData.email || undefined)
        
        const validacion = await CuponService.validar(
          cuponCodigo,
          cartTotal,
          emailParaValidar
        )
        setCuponValidacion(validacion)
        if (validacion.valido && validacion.descuento) {
          setDescuentoAplicado(validacion.descuento)
        } else {
          setDescuentoAplicado(0)
        }
      } catch (error) {
        console.error('Error validando cupón:', error)
        setCuponValidacion({ valido: false, error: 'Error al validar el cupón' })
        setDescuentoAplicado(0)
      } finally {
        setIsValidatingCupon(false)
      }
    }

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    // Pero si es POPPYWEB y no hay usuario, validar inmediatamente
    const codigoUpper = cuponCodigo.toUpperCase().trim()
    const isPOPPYWEB = codigoUpper === 'POPPYWEB'
    const delay = isPOPPYWEB && !user ? 0 : 500
    
    const timeoutId = setTimeout(validarCupon, delay)
    return () => clearTimeout(timeoutId)
  }, [cuponCodigo, cartTotal, user, customerData.email])

  // Calcular total con descuento
  const totalConDescuento = Math.max(0, cartTotal - descuentoAplicado)

  // 🆕 Crear un wrapper para onSubmit que pase los datos del carrito y cliente
  const handlePaymentSubmit = useCallback(async ({ formData, selectedPaymentMethod }: any) => {
    console.log('💳 Datos del pago recibidos:', formData)
    console.log('🛒 Items del carrito:', cartItems)
    console.log('👤 Datos del cliente:', customerData)
    
    // Llamar al onSubmit original pasando los datos adicionales
    return originalOnSubmit({ formData, selectedPaymentMethod }, cartItems, customerData)
  }, [originalOnSubmit, cartItems, customerData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    const requiredFields = ['name', 'email', 'phone', 'address']
    const emptyFields = requiredFields.filter(field => !customerData[field as keyof CustomerData])
    
    if (emptyFields.length > 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (cartItems.length === 0) {
      alert('No hay productos en el carrito')
      return
    }

    try {
      setIsCreatingPreference(true)

      // Validar cupón ANTES de proceder al pago - validación final en backend
      if (cuponCodigo.trim()) {
        // Usar el email del usuario logueado o el del formulario para validación final
        const emailFinal = user?.email || customerData.email
        
        if (!emailFinal && cuponCodigo.toUpperCase().trim() === 'POPPYWEB') {
          alert('El cupón POPPYWEB requiere una cuenta. Por favor regístrate o inicia sesión primero.')
          setIsCreatingPreference(false)
          return
        }

        // Validación final antes de crear la preferencia
        const validacionFinal = await CuponService.validar(
          cuponCodigo,
          cartTotal,
          emailFinal
        )

        if (!validacionFinal.valido) {
          alert(`Cupón inválido: ${validacionFinal.error}`)
          setCuponValidacion(validacionFinal)
          setDescuentoAplicado(0)
          setIsCreatingPreference(false)
          return
        }

        // Actualizar la validación y descuento con la respuesta del backend
        setCuponValidacion(validacionFinal)
        if (validacionFinal.descuento) {
          setDescuentoAplicado(validacionFinal.descuento)
        }
      }

      if (FEATURE_FLAGS.USE_CHECKOUT_PRO) {
        // Crear preferencia vía backend y redirigir a Checkout Pro
        // El backend volverá a validar el cupón (doble validación de seguridad)
        const pref = await MercadoPagoService.createCheckoutProPreference(
          cartItems as any[], 
          customerData as any,
          cuponValidacion?.valido ? cuponCodigo.trim() : undefined
        )
        if (pref?.init_point) {
          window.location.href = pref.init_point
          return
        }
        throw new Error('No se obtuvo init_point de Checkout Pro')
      } else {
        // Flujo Bricks (existente)
        await createPreference(cartItems, customerData)
        setShowPaymentBrick(true)
      }

    } catch (error) {
      console.error('Error creando preferencia:', error)
      alert('Error creando la preferencia de pago. Por favor intenta nuevamente.')
    } finally {
      setIsCreatingPreference(false)
    }
  }

  const handleGoBack = () => {
    navigate('/tienda-ml')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="principal">
          <div className="centrar-texto">
            <h2>No hay productos en el carrito</h2>
            <button onClick={() => navigate('/tienda-ml')} className="btn-orden">
              Ir a la Tienda
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="principal">
        <div className="checkout-form">
          <div className="form-header">
            <h2>Datos del Cliente</h2>
            <button 
              className="btn-orden volver"
              onClick={handleGoBack}
            >
              ← Volver a la Tienda
            </button>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form-content">
              <div className="form-group">
              <label htmlFor="name">Nombre completo *</label>
                <input 
                  type="text" 
                id="name"
                  name="name" 
                  value={customerData.name}
                  onChange={handleInputChange}
                  required
                placeholder="Tu nombre completo"
                />
              </div>

              <div className="form-group">
              <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                id="email"
                  name="email" 
                  value={customerData.email}
                  onChange={handleInputChange}
                  required
                placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
                <input 
                  type="tel" 
                id="phone"
                  name="phone" 
                  value={customerData.phone}
                  onChange={handleInputChange}
                  required
                placeholder="099 123 456"
                />
              </div>

              <div className="form-group">
              <label htmlFor="address">Dirección *</label>
                <input 
                  type="text" 
                id="address"
                  name="address" 
                  value={customerData.address}
                  onChange={handleInputChange}
                  required
                placeholder="Calle, número, apartamento"
                />
              </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ciudad</label>
                <input 
                  type="text" 
                  id="city"
                  name="city" 
                  value={customerData.city}
                  onChange={handleInputChange}
                  placeholder="Montevideo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">Departamento</label>
                <input 
                  type="text" 
                  id="state"
                  name="state" 
                  value={customerData.state}
                  onChange={handleInputChange}
                  placeholder="Montevideo"
                />
              </div>
            </div>
          </form>
          
          {/* Botón fuera del área scrolleable para que siempre sea visible */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={(e) => {
                const form = e.currentTarget.closest('.checkout-form')?.querySelector('form')
                if (form) {
                  form.requestSubmit()
                }
              }}
              className="btn-orden confirmar"
              disabled={isCreatingPreference}
              style={{ width: '100%' }}
            >
              {isCreatingPreference ? 'Creando preferencia...' : 'Proceder al Pago'}
            </button>
          </div>
          
          {/* Modal de Payment Brick de MercadoPago */}
          {!FEATURE_FLAGS.USE_CHECKOUT_PRO && showPaymentBrick && preferenceId && (
            <div className="payment-modal-overlay" onClick={() => setShowPaymentBrick(false)}>
              <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                  <h2>Selecciona tu método de pago</h2>
                  <button 
                    className="payment-modal-close"
                    onClick={() => setShowPaymentBrick(false)}
                    title="Cerrar"
                  >
                    ×
                  </button>
                </div>
                
                <div id="paymentBrick_container">
                  <Payment
                    initialization={getInitialization(cartTotal, preferenceId)}
                    customization={getCustomization()}
                    onSubmit={handlePaymentSubmit}
                    onReady={onReady}
                    onError={onError}
                  />
                </div>
                
                <div className="payment-modal-actions">
                  <button 
                    type="button" 
                    className="btn-orden volver"
                    onClick={() => setShowPaymentBrick(false)}
                  >
                    Volver a datos del cliente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen del pedido */}
        <div className="resumen-pedido">
          <div className="container">
            <div className="titulo-pedido">
              <h2>Resumen del pedido</h2>
              <button 
                className="editar-carrito link-like"
                onClick={() => navigate('/tienda-ml')}
              >
                Editar Carrito
              </button>
            </div>

            <div className="contenido-pedido">
              {cartItems.map(item => (
                <div key={item.id} className="item-pedido">
                  <img 
                    className="item-thumb"
                    src={item.image.startsWith('img/') ? `/${item.image}` : item.image} 
                    alt={item.name}
                  />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <div className='item-meta'>
                      <span className='badge qty'>x{item.cantidad}</span>
                      <span className='price'>$ {item.price * item.cantidad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Campo de cupón en resumen del pedido */}
            <div style={{ 
              margin: '20px 0',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              borderLeft: '4px solid #007bff'
            }}>
              <label htmlFor="cupon-resumen" style={{ 
                display: 'block',
                fontSize: '15px', 
                fontWeight: '700',
                color: '#007bff',
                marginBottom: '10px'
              }}>
                🎟️ Cupón de descuento
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  id="cupon-resumen"
                  name="cupon-resumen"
                  value={cuponCodigo}
                  onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej: POPPYWEB"
                  style={{ 
                    flex: 1,
                    minWidth: '180px',
                    padding: '10px 12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    border: cuponValidacion?.valido ? '2px solid #28a745' : '2px solid #ced4da',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
                {isValidatingCupon && (
                  <span style={{ 
                    paddingTop: '10px', 
                    fontSize: '13px',
                    color: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid #007bff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Validando...
                  </span>
                )}
              </div>
              {cuponValidacion && (
                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: cuponValidacion.valido ? '#d4edda' : '#f8d7da',
                  color: cuponValidacion.valido ? '#155724' : '#721c24',
                  border: `1px solid ${cuponValidacion.valido ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  {cuponValidacion.valido ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>✓</span>
                      <span>Cupón válido - Descuento aplicado</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: cuponCodigo.toUpperCase().trim() === 'POPPYWEB' && !user ? '8px' : '0' }}>
                        <span style={{ fontSize: '16px' }}>✗</span>
                        <span>{cuponValidacion.error}</span>
                      </div>
                      {cuponCodigo.toUpperCase().trim() === 'POPPYWEB' && !user && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(114, 28, 36, 0.2)'
                        }}>
                          <span style={{ marginRight: '8px', display: 'block', marginBottom: '6px' }}>Este cupón requiere una cuenta:</span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate('/register', { state: { returnTo: '/checkout', cupon: 'POPPYWEB' } })
                              }}
                              style={{ 
                                color: '#fff',
                                background: '#007bff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Regístrate gratis
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate('/login', { state: { returnTo: '/checkout', cupon: 'POPPYWEB' } })
                              }}
                              style={{ 
                                color: '#fff',
                                background: '#28a745',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Inicia sesión
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!cuponCodigo.trim() && !cuponValidacion && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '11px',
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  💡 Ingresa un código promocional para obtener descuentos
                </div>
              )}
            </div>

            <div className="total-pedido">
              <div className="total-box">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span>$ {cartTotal}</span>
                  </div>
                  {descuentoAplicado > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      color: '#28a745',
                      fontSize: '14px'
                    }}>
                      <span>Descuento {cuponCodigo}</span>
                      <span>-$ {descuentoAplicado.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid #ddd',
                    paddingTop: '8px',
                    marginTop: '4px'
                  }}>
                    <span>Total</span>
                    <strong>$ {totalConDescuento.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage 