import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

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
  const { cartItems, cartTotal, clearCart } = useCart()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
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

    // Aquí se podría integrar con Mercado Pago como en el original
    alert('Orden procesada correctamente!')
    clearCart()
    navigate('/')
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
              <button type="submit" className="btn-orden confirmar">
                Confirmar
              </button>
            </div>
          </form>
          
          <div id="wallet_container"></div>
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