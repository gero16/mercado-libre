import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import { useNavigate } from 'react-router-dom'

interface FeaturedProductsProps {
  limit?: number
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ limit = 12 }) => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
        const data: ProductoML[] = await response.json()
        
        // Calcular score combinado para cada producto
        const calcularScore = (producto: ProductoML) => {
          const visitas = producto.metrics?.visits || 0
          const rating = producto.metrics?.reviews.rating_average || 0
          const totalReseñas = producto.metrics?.reviews.total || 0
          const health = producto.health || 0
          
          // Fórmula ponderada:
          // - Visitas tienen peso bajo (mucho volumen)
          // - Rating tiene peso alto (calidad)
          // - Total de reseñas indica popularidad
          // - Health indica salud del producto en ML
          return (visitas * 0.3) + (rating * 10) + (totalReseñas * 3) + (health * 5)
        }
        
        // Filtrar productos activos y ordenar por score
        const productosDestacados = data
          .filter(p => p.status !== 'paused' && p.available_quantity > 0)
          .map(p => ({ ...p, score: calcularScore(p) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
        
        console.log('⭐ Productos destacados:', productosDestacados.map(p => ({
          title: p.title,
          score: p.score,
          visits: p.metrics?.visits,
          rating: p.metrics?.reviews.rating_average,
          reviews: p.metrics?.reviews.total
        })))
        
        setFeaturedProducts(productosDestacados)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando productos destacados:', error)
        setLoading(false)
      }
    }
    
    fetchFeaturedProducts()
  }, [limit])

  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 4
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const getCurrentProducts = () => {
    const startIndex = currentPage * productsPerPage
    return featuredProducts.slice(startIndex, startIndex + productsPerPage)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Función para obtener URL de imagen optimizada (tamaño mediano)
  const getOptimizedImageUrl = (url: string) => {
    // Mercado Libre usa diferentes sufijos para diferentes tamaños:
    // -I.jpg = Original (grande)
    // -O.jpg = 500x500px
    // -V.jpg = 250x250px
    // -S.jpg = 150x150px
    if (!url) return url
    return url.replace(/-[IOSV]\.jpg$/, '-V.jpg')
  }

  const handleProductClick = (product: ProductoML) => {
    navigate(`/producto/${product.ml_id}`)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    return (
      <div className="product-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star full">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <span key={i} className="star empty">★</span>
        ))}
        <span className="rating-number">({rating})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⭐ Productos Destacados</h2>
            <p className="section-subtitle">Cargando productos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">⭐ Productos Destacados</h2>
          <p className="section-subtitle">Los favoritos de nuestros clientes</p>
        </div>
        
        <div className="products-carousel">
          <button 
            className="carousel-arrow carousel-arrow-left" 
            onClick={prevPage}
            aria-label="Productos anteriores"
          >
            &#8249;
          </button>
          
          <div className="products-grid">
            {getCurrentProducts().map((product) => {
              const imagenOriginal = product.images && product.images.length > 0 
                ? product.images[0].url 
                : product.main_image
              const imagenPrincipal = getOptimizedImageUrl(imagenOriginal)
              const tieneDescuento = product.descuento?.activo
              const precioOriginal = product.descuento?.precio_original
              const porcentajeDescuento = product.descuento?.porcentaje
              
              return (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-container">
                    <img 
                      src={imagenPrincipal} 
                      alt={product.title}
                      className="product-image"
                    />
                    {tieneDescuento && porcentajeDescuento ? (
                      <div className="product-badge" style={{
                        background: 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)',
                        boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)'
                      }}>
                        -{porcentajeDescuento}%
                      </div>
                    ) : (
                      <div className="product-badge">
                        Destacado
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    {product.metrics?.reviews.rating_average && 
                      renderStars(product.metrics.reviews.rating_average)}
                    <div className="product-price-container">
                      {tieneDescuento && precioOriginal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontSize: '1rem',
                            lineHeight: '1'
                          }}>
                            {formatPrice(precioOriginal)}
                          </span>
                          <span className="product-price" style={{ 
                            color: '#d32f2f',
                            fontWeight: '700',
                            fontSize: '1rem',
                            lineHeight: '1'
                          }}>
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="product-price">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <button 
            className="carousel-arrow carousel-arrow-right" 
            onClick={nextPage}
            aria-label="Siguientes productos"
          >
            &#8250;
          </button>
        </div>
        
        <div className="carousel-indicators">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="section-footer">
          <button 
            className="view-all-button"
            onClick={() => navigate('/tienda-ml')}
          >
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
