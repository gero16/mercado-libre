import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SpecialPromotionProps {
  title: string
  subtitle: string
  discount: string
  endDate: string
  theme: 'halloween' | 'blackfriday' | 'summer' | 'winter'
  linkTo?: string
  deadline?: string | Date // ISO/Date para countdown real
  countdownText?: string // Texto personalizado para el contador (ej: "¡Comienza el..." o "¡Termina el...")
  showButton?: boolean // Mostrar/ocultar el botón "¡Aprovecha Ahora!"
}

const SpecialPromotion: React.FC<SpecialPromotionProps> = ({ 
  title, 
  subtitle, 
  discount, 
  endDate, 
  theme,
  linkTo,
  deadline,
  countdownText,
  showButton = true // Por defecto mostrar el botón
}) => {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Calcular countdown si hay deadline
  useEffect(() => {
    if (!deadline) return
    const target = new Date(deadline).getTime()
    if (isNaN(target)) return
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  const pad = (n: number) => n.toString().padStart(2, '0')
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
          background: 'linear-gradient(135deg, #000000, #1a1a1a, #2d0000, #000000)',
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
            
            {endDate && deadline && (
              <div className="promotion-timer">
                <p className="timer-text">{countdownText || `¡Termina el ${endDate}!`}</p>
                <div className="countdown">
                  <div className="time-unit">
                    <span className="time-number">{pad(timeLeft.days)}</span>
                    <span className="time-label">Días</span>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <span className="time-number">{pad(timeLeft.hours)}</span>
                    <span className="time-label">Horas</span>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <span className="time-number">{pad(timeLeft.minutes)}</span>
                    <span className="time-label">Min</span>
                  </div>
                  <div className="time-separator">:</div>
                  <div className="time-unit">
                    <span className="time-number">{pad(timeLeft.seconds)}</span>
                    <span className="time-label">Seg</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {showButton && (
            <div className="promotion-action">
              <button 
                className="promotion-button"
                onClick={() => linkTo ? navigate(linkTo) : navigate('/tienda-ml')}
              >
                ¡Aprovecha Ahora!
              </button>
            </div>
          )}
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
