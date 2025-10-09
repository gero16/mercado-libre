import React from 'react'
import '../css/welcome-section.css'

interface WelcomeSectionProps {
  title?: string
  subtitle?: string
  description?: string
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  title = "¡Bienvenido a Nuestra Tienda!",
  subtitle = "Encuentra los mejores productos al mejor precio",
  description = "Descubre nuestra amplia selección de productos de calidad. Envíos rápidos, garantía de satisfacción y las mejores ofertas del mercado."
}) => {
  return (
    <section className="welcome-section">
      <div className="welcome-container">
        <div className="welcome-content">
          <div className="welcome-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">Tienda Oficial</span>
          </div>
          
          <h1 className="welcome-title">{title}</h1>
          
          <p className="welcome-subtitle">{subtitle}</p>
          
          <p className="welcome-description">{description}</p>
          
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <span className="feature-text">Envío Gratis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Compra Segura</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span className="feature-text">Pagos Flexibles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span className="feature-text">Calidad Garantizada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection

