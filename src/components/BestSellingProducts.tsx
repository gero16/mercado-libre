import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import { useNavigate } from 'react-router-dom'

interface BestSellingProductsProps {
  limit?: number
}

const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ limit = 12 }) => {
  const navigate = useNavigate()
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // 🚀 Usar endpoint con paginación para reducir datos
        const response = await fetch(`/ml/productos?limit=${limit}`)
        const data = await response.json()
        
        // El endpoint con paginación devuelve {productos: [], pagination: {}}
        const productos = data.productos || data
        
        // Filtrar y ordenar solo lo necesario
        const productosMasVendidos = productos
          .filter((p: ProductoML) => p.status !== 'paused' && (p.sold_quantity || 0) > 0)
          .sort((a: ProductoML, b: ProductoML) => (b.sold_quantity || 0) - (a.sold_quantity || 0))
          .slice(0, limit)
        
        console.log('🏆 Productos más vendidos:', productosMasVendidos.length, 'productos')
        
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
    if (!rating || rating === 0) return null
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
        <span className="rating-number">({rating.toFixed(1)})</span>
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
              const imagenOriginal = product.images && product.images.length > 0 
                ? product.images[0].url 
                : product.main_image
              const imagenPrincipal = getOptimizedImageUrl(imagenOriginal)
              
              // Calcular el índice global del producto
              const globalIndex = currentPage * productsPerPage + index
              
              // Descuentos
              const tieneDescuento = product.descuento?.activo
              const porcentajeDescuento = product.descuento?.porcentaje || 0
              const tieneDescuentoML = !!product.descuento_ml?.original_price
              const precioOriginalML = product.descuento_ml?.original_price
              const porcentajeDescuentoML = precioOriginalML 
                ? Math.round(((precioOriginalML - product.price) / precioOriginalML) * 100)
                : 0
              
              return (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className={`bestseller-rank ${globalIndex === 0 ? 'gold-medal' : globalIndex === 1 ? 'silver-medal' : globalIndex === 2 ? 'bronze-medal' : ''}`}>
                    {globalIndex === 0 && '🥇'}
                    {globalIndex === 1 && '🥈'}
                    {globalIndex === 2 && '🥉'}
                    {globalIndex > 2 && `#${globalIndex + 1}`}
                  </div>
                  
                  {/* Badge de descuento */}
                  {(tieneDescuento && porcentajeDescuento || tieneDescuentoML) && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: tieneDescuentoML 
                        ? 'linear-gradient(135deg, #FFE600 0%, #FFC300 100%)' // Amarillo de MercadoLibre
                        : 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)', // Rojo para descuentos web
                      color: tieneDescuentoML ? '#000' : 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      boxShadow: tieneDescuentoML 
                        ? '0 3px 10px rgba(255, 230, 0, 0.4)'
                        : '0 3px 10px rgba(211, 47, 47, 0.4)',
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {tieneDescuentoML && <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>ML</span>}
                      -{tieneDescuentoML ? porcentajeDescuentoML : porcentajeDescuento}%
                    </div>
                  )}
                  
                  <div className="product-image-container">
                    <img 
                      src={imagenPrincipal} 
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="bestseller-badge">
                      <span className="badge-icon">🏆</span>
                      <span className="badge-text">Top Ventas</span>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    {(() => {
                      const rating = product.metrics?.reviews?.rating_average
                      // Debug: mostrar solo si hay rating válido
                      if (rating && rating > 0) {
                        return renderStars(rating)
                      }
                      return null
                    })()}
                    <div className="product-price-container">
                      {product.descuento_ml?.original_price ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontSize: '0.9rem'
                          }}>
                            {formatPrice(product.descuento_ml.original_price)}
                          </span>
                          <span className="product-price" style={{ color: '#d32f2f', fontWeight: '700' }}>
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

export default BestSellingProducts
