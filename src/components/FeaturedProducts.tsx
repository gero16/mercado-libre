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
        // 🆕 Obtener TODOS los productos y filtrar los destacados en el frontend
        // (Solución temporal mientras el backend se actualiza en Railway)
        const response = await fetch(
          `https://poppy-shop-production.up.railway.app/ml/productos`
        )
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        const productos = data.productos || data
        
        console.log('📦 Estructura de respuesta:', Array.isArray(productos) ? 'Array directo' : 'Objeto anidado')
        console.log('⭐ Total productos obtenidos:', productos.length)
        
        // 🎯 Filtrar SOLO productos marcados manualmente como destacados
        const productosDestacadosManuales = productos.filter((p: ProductoML) => 
          p.destacado === true && 
          p.status !== 'paused' && 
          p.available_quantity > 0
        )
        
        console.log('🎯 Productos destacados manualmente:', productosDestacadosManuales.length)
        console.log('📝 Títulos de destacados:', productosDestacadosManuales.map((p: ProductoML) => p.title))
        
        // Si hay productos destacados manualmente, usarlos
        // Si no, mostrar sección vacía o usar los primeros productos activos
        if (productosDestacadosManuales.length > 0) {
          setFeaturedProducts(productosDestacadosManuales.slice(0, limit))
        } else {
          // Si no hay destacados, no mostrar nada (o puedes usar automáticos)
          setFeaturedProducts([])
          console.log('⚠️ No hay productos destacados. Marca productos desde /admin')
        }
        
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
              // Descuento de MercadoLibre
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
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-container">
                    <img 
                      src={imagenPrincipal} 
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                      decoding="async"
                    />
                    {(tieneDescuento && porcentajeDescuento) || tieneDescuentoML ? (
                      <div className="product-badge" style={{
                        background: tieneDescuentoML
                          ? 'linear-gradient(135deg, #FFE600 0%, #FFC300 100%)'
                          : 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)',
                        color: tieneDescuentoML ? '#000' : 'white',
                        boxShadow: tieneDescuentoML
                          ? '0 4px 15px rgba(255, 230, 0, 0.4)'
                          : '0 4px 15px rgba(211, 47, 47, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {tieneDescuentoML && <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>ML</span>}
                        -{tieneDescuentoML ? porcentajeDescuentoML : porcentajeDescuento}%
                      </div>
                    ) : (
                      <div className="product-badge">
                        Destacado
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    {(product.metrics?.reviews.rating_average && product.metrics.reviews.rating_average > 0) && 
                      renderStars(product.metrics.reviews.rating_average)}
                    <div className="product-price-container">
                      {(tieneDescuento && precioOriginal) || tieneDescuentoML ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontSize: '1rem',
                            lineHeight: '1'
                          }}>
                            {formatPrice(tieneDescuentoML ? precioOriginalML! : precioOriginal)}
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
