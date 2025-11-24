import React, { useEffect, useState } from 'react'
import { EventService } from '../services/event'

const PromotionalBanner: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<{ slug: string; titulo: string; theme?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    EventService.listActive()
      .then(res => {
        const ev = (res.eventos || [])[0] || null
        if (mounted) setActiveEvent(ev)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const theme = activeEvent?.theme?.toLowerCase() || 'default'
  const isBlackFriday = theme === 'blackfriday'
  const isHalloween = theme === 'halloween'

  // Texto del banner según el tema
  const getBannerText = () => {
    if (isBlackFriday) {
      return (
        <>
          <span className="shipping-text">🛍️ <strong>BLACK FRIDAY</strong> - Descuentos increíbles</span>
          <span className="separator">•</span>
          <span className="discount-text">Hasta 70% OFF en productos seleccionados</span>
        </>
      )
    }
    if (isHalloween) {
      return (
        <>
          <span className="shipping-text">🎃 <strong>HALLOWEEN</strong> - Ofertas espeluznantes</span>
          <span className="separator">•</span>
          <span className="discount-text">Descuentos de miedo por tiempo limitado</span>
        </>
      )
    }
    return (
      <>
        <span className="shipping-text">🚚 Envío gratuito a todo el país</span>
        <span className="separator">•</span>
        <span className="discount-text">+ 10%OFF primera compra con cupón <strong>"POPPYWEB"</strong></span>
        <span className="separator">•</span>
      </>
    )
  }

  return (
    <div className={`promotional-banner ${isBlackFriday ? 'promotional-banner-blackfriday' : isHalloween ? 'promotional-banner-halloween' : ''}`}>
      <div className="promotional-content">
        <div className="promotional-text">
          {getBannerText()}
        </div>
      </div>
    </div>
  )
}

export default PromotionalBanner
