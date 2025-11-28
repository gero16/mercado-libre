import React from 'react'

const PromotionalBanner: React.FC = () => {
  return (
    <div className="promotional-banner">
      <div className="promotional-content">
        <div className="promotional-text">
          <span className="shipping-text">🚚 Envío gratuito a todo el país</span>
          <span className="separator">•</span>
          <span className="discount-text">+ 10%OFF primera compra con cupón <strong>"POPPYWEB"</strong></span>
          <span className="separator">•</span>
        </div>
      </div>
    </div>
  )
}

export default PromotionalBanner
