import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
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
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '10px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <h1 style={{ color: '#721c24', marginBottom: '20px' }}>
              Pago No Procesado
            </h1>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <p style={{ color: '#721c24', fontSize: '18px', marginBottom: '10px' }}>
              Hubo un problema al procesar tu pago.
            </p>
            {paymentId && (
              <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
                ID de pago: {paymentId}
              </p>
            )}
            <p style={{ color: '#721c24', marginBottom: '20px' }}>
              No te preocupes, no se realizó ningún cargo a tu cuenta.
            </p>
            <p style={{ color: '#6c757d', marginBottom: '30px' }}>
              Puedes intentar nuevamente o contactar a nuestro servicio de atención al cliente.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/checkout')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#dc3545',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Intentar Nuevamente
            </button>
            <button 
              onClick={() => navigate('/tienda')} 
              className="btn-orden"
              style={{ 
                backgroundColor: '#6c757d',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Volver a la Tienda
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

export default PaymentFailurePage