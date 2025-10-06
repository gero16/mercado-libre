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
      name: 'María González',
      rating: 5,
      comment: 'Excelente calidad y muy buena atención al cliente. La campera llegó perfecta y antes de lo esperado. Totalmente recomendado!',
      date: '15 de Noviembre, 2024',
      product: 'Campera Adidas Originals',
      verified: true
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      rating: 5,
      comment: 'Primera vez que compro online y quedé súper satisfecho. El producto es exactamente como se muestra en las fotos.',
      date: '12 de Noviembre, 2024',
      product: 'Mochila Champion',
      verified: true
    },
    {
      id: 3,
      name: 'Ana Martínez',
      rating: 4,
      comment: 'Muy buena experiencia de compra. La remera es de excelente calidad, solo tardó un poco más en llegar pero vale la pena.',
      date: '10 de Noviembre, 2024',
      product: 'Remera Adidas',
      verified: true
    },
    {
      id: 4,
      name: 'Luis Fernández',
      rating: 5,
      comment: 'El gorro es perfecto para el invierno. Muy cálido y de buena calidad. El envío fue súper rápido.',
      date: '8 de Noviembre, 2024',
      product: 'Gorro Champion',
      verified: true
    },
    {
      id: 5,
      name: 'Sofia López',
      rating: 5,
      comment: 'Increíble atención al cliente y productos de primera calidad. Ya he comprado varias veces y siempre todo perfecto.',
      date: '5 de Noviembre, 2024',
      product: 'Campera Adidas Originals',
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
    <section className="customer-reviews">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">💬 Reseñas de Nuestros Clientes</h2>
          <p className="section-subtitle">Lo que dicen quienes ya compraron con nosotros</p>
        </div>

        <div className="reviews-container">
          <button 
            className="review-nav review-nav-left" 
            onClick={prevReview}
            aria-label="Reseña anterior"
          >
            &#8249;
          </button>

          <div className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {reviews[currentReview].name.charAt(0)}
                </div>
                <div className="reviewer-details">
                  <h3 className="reviewer-name">
                    {reviews[currentReview].name}
                    {reviews[currentReview].verified && (
                      <span className="verified-badge">✓</span>
                    )}
                  </h3>
                  <p className="review-product">{reviews[currentReview].product}</p>
                  <p className="review-date">{reviews[currentReview].date}</p>
                </div>
              </div>
              
              <div className="review-rating">
                {renderStars(reviews[currentReview].rating)}
              </div>
            </div>
            
            <div className="review-content">
              <p className="review-comment">"{reviews[currentReview].comment}"</p>
            </div>
          </div>

          <button 
            className="review-nav review-nav-right" 
            onClick={nextReview}
            aria-label="Siguiente reseña"
          >
            &#8250;
          </button>
        </div>

        <div className="review-indicators">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`review-indicator ${index === currentReview ? 'active' : ''}`}
              onClick={() => goToReview(index)}
              aria-label={`Ir a reseña ${index + 1}`}
            />
          ))}
        </div>

        <div className="reviews-stats">
          <div className="stat-item">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Calificación promedio</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Reseñas positivas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Clientes satisfechos</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerReviews
