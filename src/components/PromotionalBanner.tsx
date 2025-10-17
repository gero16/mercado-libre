import React from 'react'
import { useNavigate } from 'react-router-dom'

const PromotionalBanner: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="promotional-banner">
      <div className="promotional-content">
        <div className="promotional-text">
          <span className="shipping-text">🚚 Envío gratuito a todo el país</span>
          <span className="separator">•</span>
          <span className="discount-text">+ 10%OFF primera compra con cupón <strong>"POPPYWEB"</strong></span>
          <span className="separator">•</span>
          <button
            onClick={() => navigate('/eventos/halloween')}
            style={{ marginLeft: 8, background: 'transparent', color: 'white', textDecoration: 'underline', border: 'none', cursor: 'pointer' }}
          >
            🎃 Ver especiales de Halloween
          </button>
        </div>
      </div>
    </div>
  )
}

export default PromotionalBanner
