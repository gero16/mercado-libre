import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useMercadoPago } from '../hooks/useMercadoPago'
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react'
import { mercadoPagoConfig, validateMercadoPagoConfig } from '../config/mercadopago'

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
  const { cartItems, cartTotal } = useCart()
  const navigate = useNavigate()
  const { createPayment, isLoading, error, preferenceId, resetState } = useMercadoPago()
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  })

  const [isFormValid, setIsFormValid] = useState(false)
  const [showMercadoPago, setShowMercadoPago] = useState(false)

  // Inicializar Mercado Pago cuando el componente se monta
  useEffect(() => {
    if (validateMercadoPagoConfig()) {
      initMercadoPago(mercadoPagoConfig.publicKey)
    }
  }, [])

  // Validar formulario en tiempo real
  useEffect(() => {
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state']
    const isValid = requiredFields.every(field => customerData[field as keyof CustomerData])
    setIsFormValid(isValid && cartItems.length > 0)
  }, [customerData, cartItems])

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
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state']
    const emptyFields = requiredFields.filter(field => !customerData[field as keyof CustomerData])
    
    if (emptyFields.length > 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (cartItems.length === 0) {
      alert('No hay productos en el carrito')
      return
    }

    if (!validateMercadoPagoConfig()) {
      alert('Error: Configuración de Mercado Pago no encontrada. Por favor contacta al administrador.')
      return
    }

    try {
      // Crear preferencia de pago con Mercado Pago
      const preference = await createPayment(cartItems, customerData)
      
      if (preference) {
        setShowMercadoPago(true)
        // El botón de Mercado Pago aparecerá automáticamente
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      alert('Error al procesar el pago. Por favor intenta nuevamente.')
    }
  }

  const handleGoBack = () => {
    resetState()
    navigate('/tienda')
  }

  const handlePaymentCancel = () => {
    setShowMercadoPago(false)
    resetState()
    // Mantener el carrito intacto para que el usuario pueda intentar nuevamente
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
      {/* Overlay de carga */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Procesando tu solicitud...</p>
          </div>
        </div>
      )}
      
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
                  required
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
                  required
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
              {!showMercadoPago && (
                <button 
                  type="submit" 
                  className="btn-orden confirmar"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? 'Procesando...' : 'Continuar al Pago'}
                </button>
              )}
            </div>
          </form>

          {/* Mostrar errores si los hay */}
          {error && (
            <div className="error-message" style={{ 
              color: 'red', 
              textAlign: 'center', 
              margin: '20px 0',
              padding: '10px',
              backgroundColor: '#ffe6e6',
              border: '1px solid #ff4444',
              borderRadius: '5px'
            }}>
              {error}
            </div>
          )}

          {/* Wallet de Mercado Pago */}
          {showMercadoPago && preferenceId && validateMercadoPagoConfig() && (
            <div id="wallet_container" style={{ marginTop: '20px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                Pagar con Mercado Pago
              </h3>
              <Wallet 
                initialization={{ 
                  preferenceId: preferenceId
                }}
                onReady={() => console.log('Mercado Pago Wallet ready')}
              />
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  className="btn-orden volver"
                  onClick={handlePaymentCancel}
                  style={{ marginRight: '10px' }}
                >
                  Cambiar Datos
                </button>
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
                <div key={item.id} className="item-pedido">
                  <img 
                    src={item.image.startsWith('img/') ? `/${item.image}` : item.image} 
                    alt={item.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div className="item-info">
                    <p>{item.name}</p>
                    <p>Cantidad: {item.cantidad}</p>
                    <p>Precio: ${item.price * item.cantidad}</p>
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