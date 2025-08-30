import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    // Limpiar el carrito cuando el pago es exitoso
    clearCart()
  }, [clearCart])

  return (
    <div className="container">
      <div className="principal">
        <div className="centrar-texto" style={{ padding: '40px 20px' }}>
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h1>¡Pago Exitoso! ✅</h1>
            <p style={{ fontSize: '18px', margin: '20px 0' }}>
              Tu compra ha sido procesada correctamente.
            </p>
            <p style={{ marginBottom: '30px' }}>
              Recibirás un email con los detalles de tu pedido y la información de seguimiento.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/')} 
                className="btn-orden"
                style={{ minWidth: '150px' }}
              >
                Ir al Inicio
              </button>
              <button 
                onClick={() => navigate('/tienda')} 
                className="btn-orden"
                style={{ minWidth: '150px' }}
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage