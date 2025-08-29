import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  useEffect(() => {
    // Limpiar carrito cuando el pago es exitoso
    clearCart()
  }, [clearCart])

  const paymentId = searchParams.get('payment_id')
  
  return (
    <div className="container">
      <div className="principal">
        <div className="centrar-texto" style={{ 
          textAlign: 'center', 
          padding: '50px 20px',
          maxWidth: '600px',
          margin: '100px auto'
        }}>
          <div style={{ 
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '10px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <h1 style={{ color: '#155724', marginBottom: '20px' }}>
              ¡Pago Exitoso!
            </h1>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <p style={{ color: '#155724', fontSize: '18px', marginBottom: '10px' }}>
              Tu pago ha sido procesado correctamente.
            </p>
            {paymentId && (
              <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
                ID de pago: {paymentId}
              </p>
            )}
            <p style={{ color: '#155724', marginBottom: '30px' }}>
              Recibirás un correo electrónico con los detalles de tu compra.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#28a745',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Ir al Inicio
            </button>
            <button 
              onClick={() => navigate('/tienda')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#007bff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage