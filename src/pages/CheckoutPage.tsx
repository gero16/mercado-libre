import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { MercadoPagoService } from '../services/mercadopago'
import { FEATURE_FLAGS } from '../config/featureFlags'

interface CustomerData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

const CheckoutPage: React.FC = () => {
  const { 
    cartItems, 
    cartTotal, 
    setCartOpen,
    cuponAplicado,
    aplicarCupon,
    quitarCupon,
    cartTotalConDescuento,
    descuentoCupon
  } = useCart()
  const navigate = useNavigate()
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const [isProcessing, setIsProcessing] = useState(false)
  
  // 🆕 Estados para cupón
  const [codigoCupon, setCodigoCupon] = useState('')
  const [aplicandoCupon, setAplicandoCupon] = useState(false)
  const [mensajeCupon, setMensajeCupon] = useState<{ tipo: 'success' | 'error', texto: string} | null>(null)

  useEffect(() => {
    setCartOpen(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 🆕 Función para aplicar cupón
  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      setMensajeCupon({ tipo: 'error', texto: 'Ingresa un código de cupón' })
      return
    }

    setAplicandoCupon(true)
    setMensajeCupon(null)

    try {
      const resultado = await aplicarCupon(codigoCupon, customerData.email)
      
      if (resultado.valido) {
        setMensajeCupon({ 
          tipo: 'success', 
          texto: `¡Cupón aplicado! Ahorras $${resultado.descuento?.toFixed(2)}` 
        })
      } else {
        setMensajeCupon({ 
          tipo: 'error', 
          texto: resultado.error || 'Cupón inválido' 
        })
      }
    } catch (error) {
      setMensajeCupon({ 
        tipo: 'error', 
        texto: 'Error al validar el cupón' 
      })
    } finally {
      setAplicandoCupon(false)
    }
  }

  // 🆕 Función para quitar cupón
  const handleQuitarCupon = () => {
    quitarCupon()
    setCodigoCupon('')
    setMensajeCupon(null)
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
      setIsProcessing(true)
      
      console.log('🛒 Creando preferencia de Checkout Pro...')
      console.log('Items:', cartItems)
      console.log('Customer:', customerData)
      console.log('Cupón:', cuponAplicado?.cupon?.codigo)
      
      // Crear preferencia de Checkout Pro
      const { init_point } = await MercadoPagoService.createCheckoutProPreference(
        cartItems,
        customerData,
        cuponAplicado?.cupon?.codigo
      )
      
      console.log('✅ Preferencia creada, redirigiendo a:', init_point)
      
      // Redirigir a MercadoPago para completar el pago
      window.location.href = init_point
      
    } catch (error: any) {
      console.error('Error creating preference:', error)
      alert(error.message || 'Error creando la preferencia de pago. Por favor intenta nuevamente.')
      setIsProcessing(false)
    }
  }

  const handleGoBack = () => {
    navigate('/tienda')
  }

  if (FEATURE_FLAGS.DISABLE_CHECKOUT) {
    return (
      <main className="container" style={{ padding: '40px 20px', maxWidth: 720 }}>
        <h1>Checkout temporalmente deshabilitado</h1>
        <p>
          Por mantenimiento, el proceso de compra está deshabilitado momentáneamente. Por favor, vuelve a intentarlo más tarde.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/tienda-ml')}>Volver a la tienda</button>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="principal">
          <div className="centrar-texto">
            <h2>No hay productos en el carrito</h2>
            <button onClick={() => navigate('/tienda')} className="btn-orden">
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

            <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-orden"
                  disabled={isProcessing}
                  style={{
                    backgroundColor: isProcessing ? '#ccc' : '',
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? '🔄 Procesando...' : '💳 Pagar con MercadoPago (USD)'}
                </button>
                <p style={{
                  marginTop: '10px',
                  fontSize: '0.9rem',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Serás redirigido a MercadoPago para completar tu pago en USD
                </p>
            </div>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="resumen-pedido">
          <div className="container">
            <div className="titulo-pedido">
              <h2>Resumen del pedido</h2>
              <button 
                className="editar-carrito link-like"
                onClick={() => navigate('/tienda')}
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

            {/* 🆕 Sección de cupón */}
            <div className="cupon-section" style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>
                🎟️ ¿Tienes un cupón de descuento?
              </h3>
              
              {!cuponAplicado ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="VERANO2026"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontSize: '1rem',
                        textTransform: 'uppercase'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAplicarCupon()}
                    />
                    <button
                      type="button"
                      onClick={handleAplicarCupon}
                      disabled={aplicandoCupon}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: aplicandoCupon ? 'not-allowed' : 'pointer',
                        opacity: aplicandoCupon ? 0.7 : 1
                      }}
                    >
                      {aplicandoCupon ? 'Validando...' : 'Aplicar'}
                    </button>
                  </div>
                  
                  {mensajeCupon && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: mensajeCupon.tipo === 'success' ? '#d4edda' : '#f8d7da',
                      color: mensajeCupon.tipo === 'success' ? '#155724' : '#721c24',
                      border: `2px solid ${mensajeCupon.tipo === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}>
                      {mensajeCupon.texto}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                  borderRadius: '10px',
                  border: '2px solid #28a745'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '700', color: '#155724', fontSize: '1.1rem' }}>
                        ✅ {cuponAplicado.cupon?.codigo}
                      </p>
                      <p style={{ margin: 0, color: '#155724', fontSize: '0.9rem' }}>
                        {cuponAplicado.cupon?.descripcion}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuitarCupon}
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        color: '#dc3545',
                        border: '2px solid #dc3545',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="total-pedido">
              <div className="total-box">
                <span>Subtotal</span>
                <strong>$ {cartTotal.toFixed(2)}</strong>
              </div>
              
              {descuentoCupon > 0 && (
                <div className="total-box" style={{
                  background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  margin: '10px 0'
                }}>
                  <span style={{ color: '#155724', fontWeight: '600' }}>
                    🎟️ Descuento ({cuponAplicado?.cupon?.valor_descuento}
                    {cuponAplicado?.cupon?.tipo_descuento === 'porcentaje' ? '%' : ' UYU'})
                  </span>
                  <strong style={{ color: '#155724' }}>
                    - $ {descuentoCupon.toFixed(2)}
                  </strong>
                </div>
              )}
              
              <div className="total-box" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '1.2rem'
              }}>
                <span>Total a Pagar</span>
                <strong>$ {cartTotalConDescuento.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage 