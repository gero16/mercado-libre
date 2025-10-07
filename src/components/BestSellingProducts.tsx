import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import { useNavigate } from 'react-router-dom'

interface BestSellingProductsProps {
  limit?: number
}

const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ limit = 8 }) => {
  const navigate = useNavigate()
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
        const data: ProductoML[] = await response.json()
        
        // Filtrar productos con ventas y ordenar por cantidad vendida
        const productosMasVendidos = data
          .filter(p => p.status !== 'paused' && (p.sold_quantity || 0) > 0)
          .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
          .slice(0, limit)
        
        console.log('🏆 Productos más vendidos:', productosMasVendidos.map(p => ({
          title: p.title,
          sold_quantity: p.sold_quantity,
          price: p.price
        })))
        
        setBestSellingProducts(productosMasVendidos)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando productos más vendidos:', error)
        setLoading(false)
      }
    }
    
    fetchBestSellers()
  }, [limit])

  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 4
  const totalPages = Math.ceil(bestSellingProducts.length / productsPerPage)

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
    return bestSellingProducts.slice(startIndex, startIndex + productsPerPage)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
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
      <section className="best-selling-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🏆 Productos Más Vendidos</h2>
            <p className="section-subtitle">Cargando productos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (bestSellingProducts.length === 0) {
    return null
  }

  return (
    <section className="best-selling-products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">🏆 Productos Más Vendidos</h2>
          <p className="section-subtitle">Los favoritos de todos nuestros clientes</p>
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
            {getCurrentProducts().map((product, index) => {
              const imagenPrincipal = product.images && product.images.length > 0 
                ? product.images[0].url 
                : product.main_image
              
              return (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bestseller-rank">
                    #{currentPage * productsPerPage + index + 1}
                  </div>
                  
                  <div className="product-image-container">
                    <img 
                      src={imagenPrincipal} 
                      alt={product.title}
                      className="product-image"
                    />
                    <div className="bestseller-badge">
                      <span className="badge-icon">🏆</span>
                      <span className="badge-text">Top Ventas</span>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    {product.metrics?.reviews.rating_average && 
                      renderStars(product.metrics.reviews.rating_average)}
                    <div className="product-price-container">
                      <span className="product-price">{formatPrice(product.price)}</span>
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

export default BestSellingProducts
