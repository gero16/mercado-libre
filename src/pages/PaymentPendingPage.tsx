import React from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="container">
      <div className="principal">
        <div className="centrar-texto" style={{ padding: '40px 20px' }}>
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h1>Pago Pendiente ⏳</h1>
            <p style={{ fontSize: '18px', margin: '20px 0' }}>
              Tu pago está siendo procesado.
            </p>
            <p style={{ marginBottom: '30px' }}>
              Te notificaremos por email cuando el pago sea confirmado. 
              Esto puede tomar unos minutos dependiendo del método de pago seleccionado.
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

export default PaymentPendingPage
