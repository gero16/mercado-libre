import React, { useState, useEffect, useCallback } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { Payment } from '@mercadopago/sdk-react'
import { useMercadoPago } from '../hooks/useMercadoPago'

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
  
  const {
    createPreference,
    getInitialization,
    getCustomization,
    onSubmit: originalOnSubmit,
    onError,
    onReady,
    preferenceId,
    isLoading: _mpLoading,
    error: mpError
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
      
      // Crear preferencia en MercadoPago
      await createPreference(cartItems, customerData)
      
      // Mostrar el Payment Brick
      setShowPaymentBrick(true)
      
    } catch (error) {
      console.error('Error creating preference:', error)
      alert('Error creando la preferencia de pago. Por favor intenta nuevamente.')
    } finally {
      setIsCreatingPreference(false)
    }
  }

  const handleGoBack = () => {
    navigate('/tienda')
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
                disabled={isCreatingPreference}
              >
                {isCreatingPreference ? 'Creando preferencia...' : 'Proceder al Pago'}
              </button>
            </div>
          </form>
          
          {/* Modal de Payment Brick de MercadoPago */}
          {showPaymentBrick && preferenceId && (
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
            <div className="total-pedido">
              <div className="total-box">
                <span>Total</span>
                <strong>$ {cartTotal}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage 