import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()

  useEffect(() => {
    // Limpiar los query params de la URL para evitar problemas de navegación
    if (location.search) {
      window.history.replaceState({}, '', '/payment-success')
    }
    
    // Limpiar el carrito cuando el pago es exitoso
    clearCart()
    
    // Asegurar que el overflow del body esté restaurado (por si quedó bloqueado del checkout)
    document.body.style.overflow = 'unset'
    
    // Limpiar cualquier overlay del modal de pago que pueda quedar visible
    const paymentOverlay = document.querySelector('.payment-modal-overlay')
    if (paymentOverlay instanceof HTMLElement) {
      paymentOverlay.style.display = 'none'
      paymentOverlay.remove()
    }
    
    // Limpiar iframes de MercadoPago que puedan quedar
    const mercadopagoIframes = document.querySelectorAll('iframe[src*="mercadopago"], iframe[src*="mercadolibre"]')
    mercadopagoIframes.forEach(iframe => {
      if (iframe instanceof HTMLElement) {
        iframe.style.display = 'none'
        iframe.remove()
      }
    })
    
    // Asegurar que no haya elementos con pointer-events: none bloqueando la navegación
    const blockedElements = document.querySelectorAll('[style*="pointer-events: none"]')
    blockedElements.forEach(el => {
      if (el instanceof HTMLElement && el.classList.contains('payment-modal-overlay')) {
        el.style.pointerEvents = 'auto'
        el.remove()
      }
    })
    
    // Forzar que todos los links y botones sean clickeables
    // Esto asegura que no haya overlays invisibles bloqueando
    setTimeout(() => {
      // Remover cualquier elemento que pueda estar bloqueando clicks
      const blockingElements = document.querySelectorAll('[style*="z-index"][style*="position: fixed"], [style*="z-index"][style*="position: absolute"]')
      blockingElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const zIndex = parseInt(window.getComputedStyle(el).zIndex || '0')
          // Si tiene z-index muy alto y está bloqueando, verificar si es necesario
          if (zIndex > 100 && el.classList.contains('payment-modal-overlay')) {
            el.remove()
          }
        }
      })
      
      // Asegurar que todos los links y botones sean clickeables
      const allLinks = document.querySelectorAll('a, button, [role="button"]')
      allLinks.forEach(el => {
        if (el instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(el)
          if (computedStyle.pointerEvents === 'none') {
            el.style.pointerEvents = 'auto'
          }
          if (computedStyle.cursor === 'not-allowed' || computedStyle.cursor === 'default') {
            el.style.cursor = 'pointer'
          }
        }
      })
    }, 100)
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [clearCart, location.search])

  return (
    <div className="container">
      <div className="principal">
        <div className="centrar-texto" style={{ padding: '40px 20px' }}>
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h1>¡Pago Exitoso! ✅</h1>
            <p style={{ fontSize: '18px', margin: '20px 0' }}>
              Tu compra ha sido procesada correctamente.
            </p>
            <p style={{ marginBottom: '30px' }}>
              Recibirás un email con los detalles de tu pedido y la información de seguimiento.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Usar window.location directamente para forzar navegación completa
                  window.location.href = '/'
                }} 
                className="btn-orden"
                style={{ minWidth: '150px', cursor: 'pointer' }}
              >
                Ir al Inicio
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Usar window.location directamente para forzar navegación completa
                  window.location.href = '/tienda-ml'
                }} 
                className="btn-orden"
                style={{ minWidth: '150px', cursor: 'pointer' }}
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

export default PaymentSuccessPage
