import React, { useState, useEffect } from 'react'
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
  postalCode: string
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
    postalCode: ''
  })

  const [showPaymentBrick, setShowPaymentBrick] = useState(false)
  const [isCreatingPreference, setIsCreatingPreference] = useState(false)
  
  const {
    createPreference,
    getInitialization,
    getCustomization,
    onSubmit,
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
        <div className="order-page" id="order">
          {/* Datos del Comprador */}
          <h1 className="titulo-envio">Detalles del Cliente</h1>
          <form onSubmit={handleSubmit}>
            <div id="order-shipping" className="order-shipping">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo:</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  value={customerData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={customerData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefono:</label>
                <input 
                  type="tel" 
                  name="phone" 
                  id="phone" 
                  value={customerData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Direccion:</label>
                <input 
                  type="text" 
                  name="address" 
                  id="address" 
                  value={customerData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">Ciudad:</label>
                <input 
                  type="text" 
                  name="city" 
                  id="city" 
                  value={customerData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">Departamento:</label>
                <input 
                  type="text" 
                  name="state" 
                  id="state" 
                  value={customerData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Codigo Postal:</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  id="postalCode" 
                  value={customerData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div id="order-actions" className="order-actions">
              <button type="button" className="btn-orden volver" onClick={handleGoBack}>
                Volver
              </button>
              {!showPaymentBrick && (
                <button 
                  type="submit" 
                  className="btn-orden confirmar"
                  disabled={isCreatingPreference}
                >
                  {isCreatingPreference ? 'Creando orden...' : 'Proceder al Pago'}
                </button>
              )}
            </div>
          </form>

          {/* Mostrar errores si los hay */}
          {mpError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              margin: '10px 0',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              <strong>Error:</strong> {mpError}
            </div>
          )}
          
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
                    onSubmit={onSubmit}
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
                className="editar-carrito"
                onClick={() => navigate('/tienda')}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                Editar Carrito
              </button>
            </div>

            <div className="contenido-pedido">
              {cartItems.map(item => (
                <div key={item.id} className="producto-pedido">
                  <img 
                    src={item.image.startsWith('img/') ? `/${item.image}` : item.image} 
                    alt={item.name}
                  />
                  <div className="info-pedido">
                    <p>{item.name}</p>
                    <div className='item-meta'>
                      <div><strong> Cantidad: </strong> <span>{item.cantidad}</span></div>
                      <div><strong> Precio: </strong> <span> ${item.price * item.cantidad} </span></div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="total-pedido">
                <h3>Total: ${cartTotal}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage 