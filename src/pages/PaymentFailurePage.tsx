import React from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="container">
      <div className="principal">
        <div className="centrar-texto" style={{ padding: '40px 20px' }}>
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h1>Pago Fallido ❌</h1>
            <p style={{ fontSize: '18px', margin: '20px 0' }}>
              Hubo un problema procesando tu pago.
            </p>
            <p style={{ marginBottom: '30px' }}>
              Por favor verifica tus datos de pago e intenta nuevamente.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/checkout')} 
                className="btn-orden"
                style={{ minWidth: '150px' }}
              >
                Intentar Nuevamente
              </button>
              <button 
                onClick={() => navigate('/tienda')} 
                className="btn-orden volver"
                style={{ minWidth: '150px' }}
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailurePage