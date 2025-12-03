import React, { useState } from 'react'

interface Review {
  id: number
  name: string
  rating: number
  comment: string
  date: string
  product: string
  verified: boolean
}

const CustomerReviews: React.FC = () => {
  const [currentReview, setCurrentReview] = useState(0)

  const reviews: Review[] = [
    {
      id: 1,
      name: 'ALEXISJAC',
      rating: 5,
      comment: 'La mejor experiencia de compra en 10 años de usar ML. Compre el producto a las 14:30. a las 15:30 lo tuve en mis manos, hasta link con rastreo del envio en vivo',
      date: '01/12/23',
      product: 'Producto Premium',
      verified: true
    },
    {
      id: 2,
      name: 'CACA7327065',
      rating: 5,
      comment: 'Excelente el tiempo de entrega, incluso me sorprendió. El lapiz tal cual lo que me dijeron (original, sellado) y funciona perfecto.',
      date: '20/04/24',
      product: 'Lápiz Original',
      verified: true
    },
    {
      id: 3,
      name: 'VISUALTECH_UY',
      rating: 5,
      comment: 'EXCELENTE: servicio, seriedad y rapidez en respuestas. Tenía incertidumbre al encargar 1 artículo tan caro para traer de USA pero estoy MUY conforme con todo!!',
      date: '08/06/24',
      product: 'Artículo USA',
      verified: true
    },
    {
      id: 4,
      name: 'DUVI7594668',
      rating: 5,
      comment: 'Excelente!! Respondieron a todos mis mensajes y me cambiaron el producto incluso cuando fui yo la que cometí el error. Recomiendo ampliamente!!!!!',
      date: '28/02/24',
      product: 'Producto Reemplazado',
      verified: true
    },
    {
      id: 5,
      name: 'VETGARCIA',
      rating: 5,
      comment: 'Gran profesionalidad en la venta. Responsables y atentos. el producto 10 puntos. Lo recomiendo. Es casi "el tocadisco" que tuvieron nuestros padres. Valio',
      date: '23/04/24',
      product: 'Tocadiscos',
      verified: true
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        ⭐
      </span>
    ))
  }

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToReview = (index: number) => {
    setCurrentReview(index)
  }

  return (
    <section className="customer-reviews-new">
      <div className="reviews-header">
        <h2 className="reviews-title">Clientes felices</h2>
        <div className="heart-icon">❤️</div>
      </div>

      <div className="rating-section">
        <div className="rating-left">
          <span className="rating-label">RESEÑAS</span>
        </div>
        <div className="rating-separator"></div>
        <div className="rating-right">
          <span className="rating-number">5,0</span>
          <div className="rating-stars">
            {renderStars(5)}
          </div>
        </div>
      </div>

      <div className="featured-review">
        <div className="review-header-new">
          <span className="smiley">😊</span>
          <span className="review-status">Buena</span>
          <div className="review-stars-small">
            {renderStars(5)}
          </div>
        </div>
        
        <div className="review-text">
          {reviews[currentReview].comment}
        </div>
        
        <div className="review-footer">
          <span className="reviewer-name-new">{reviews[currentReview].name}</span>
          <span className="review-date-new">- {reviews[currentReview].date}</span>
        </div>
      </div>

      <div className="brand-section">
        <div className="brand-logo">
          <div className="logo-circle">
            <img src="/img/logo.png" alt="Poppy Shop Logo" className="brand-logo-img" />
          </div>
          <div className="brand-name">Poppy Shop</div>
          <div className="brand-tagline">LO QUERÉS, LO TENÉS </div>
        </div>
      </div>

      {/* Navegación discreta */}
      <div className="review-navigation">
        <button 
          className="nav-btn nav-prev" 
          onClick={prevReview}
          aria-label="Reseña anterior"
        >
          ‹
        </button>
        <div className="review-indicators-new">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentReview ? 'active' : ''}`}
              onClick={() => goToReview(index)}
              aria-label={`Ir a reseña ${index + 1}`}
            />
          ))}
        </div>
        <button 
          className="nav-btn nav-next" 
          onClick={nextReview}
          aria-label="Siguiente reseña"
        >
          ›
        </button>
      </div>
    </section>
  )
}

export default CustomerReviews
