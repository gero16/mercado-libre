import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  useEffect(() => {
    // Limpiar carrito cuando el pago está pendiente
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
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '10px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <h1 style={{ color: '#856404', marginBottom: '20px' }}>
              Pago Pendiente
            </h1>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <p style={{ color: '#856404', fontSize: '18px', marginBottom: '10px' }}>
              Tu pago está siendo procesado.
            </p>
            {paymentId && (
              <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
                ID de pago: {paymentId}
              </p>
            )}
            <p style={{ color: '#856404', marginBottom: '20px' }}>
              Te notificaremos por correo electrónico cuando el pago sea aprobado.
            </p>
            <p style={{ color: '#6c757d', marginBottom: '30px' }}>
              Esto puede tomar unos minutos dependiendo del método de pago seleccionado.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#ffc107',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: '#212529',
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
            <button 
              onClick={() => navigate('/contacto')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#17a2b8',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPendingPage