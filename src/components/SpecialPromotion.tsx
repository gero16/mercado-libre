import React from 'react'
import { useNavigate } from 'react-router-dom'

interface SpecialPromotionProps {
  title: string
  subtitle: string
  discount: string
  endDate: string
  theme: 'halloween' | 'blackfriday' | 'summer' | 'winter'
  linkTo?: string
}

const SpecialPromotion: React.FC<SpecialPromotionProps> = ({ 
  title, 
  subtitle, 
  discount, 
  endDate, 
  theme,
  linkTo
}) => {
  const navigate = useNavigate()
  const getThemeStyles = () => {
    switch (theme) {
      case 'halloween':
        return {
          background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
          icon: '🎃',
          accentColor: '#ff6b35'
        }
      case 'blackfriday':
        return {
          background: 'linear-gradient(135deg, #000000, #333333, #000000)',
          icon: '🛍️',
          accentColor: '#ff0000'
        }
      case 'summer':
        return {
          background: 'linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef)',
          icon: '☀️',
          accentColor: '#ff6b9d'
        }
      case 'winter':
        return {
          background: 'linear-gradient(135deg, #74b9ff, #0984e3, #74b9ff)',
          icon: '❄️',
          accentColor: '#74b9ff'
        }
      default:
        return {
          background: 'linear-gradient(135deg, var(--color-primary), #e08a00, var(--color-primary))',
          icon: '🎉',
          accentColor: 'var(--color-primary)'
        }
    }
  }

  const themeStyles = getThemeStyles()

  return (
    <section className="special-promotion">
      <div className="promotion-container" style={{ background: themeStyles.background }}>
        <div className="promotion-content">
          <div className="promotion-icon">
            {themeStyles.icon}
          </div>
          
          <div className="promotion-text">
            <h2 className="promotion-title">{title}</h2>
            <p className="promotion-subtitle">{subtitle}</p>
            
            <div className="promotion-discount">
              <span className="discount-text">{discount}</span>
            </div>
            
            <div className="promotion-timer">
              <p className="timer-text">¡Termina el {endDate}!</p>
              <div className="countdown">
                <div className="time-unit">
                  <span className="time-number">07</span>
                  <span className="time-label">Días</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">23</span>
                  <span className="time-label">Horas</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">45</span>
                  <span className="time-label">Min</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">30</span>
                  <span className="time-label">Seg</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="promotion-action">
          <button 
            className="promotion-button"
            onClick={() => linkTo ? navigate(linkTo) : navigate('/tienda-ml')}
          >
              ¡Aprovecha Ahora!
            </button>
          </div>
        </div>
        
        <div className="promotion-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </section>
  )
}

export default SpecialPromotion
