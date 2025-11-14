import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

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
        // 🚀 Usar endpoint dedicado de destacados (mezcla manuales y automáticos)
        const response = await fetch(`${API_BASE_URL}/ml/productos/featured?limit=${limit}`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        const productos = Array.isArray(data) ? data : (data.productos || data.items || [])
        
        console.log('📦 Estructura de respuesta:', Array.isArray(productos) ? 'Array directo' : 'Objeto anidado')
        console.log('⭐ Total productos obtenidos:', productos.length)
        
        // 🎯 Validación: ocultar pausados o sin stock
        const productosDestacadosManuales = productos.filter((p: ProductoML) => p && p.status !== 'paused' && (p.available_quantity || 0) > 0)
        
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
    const value = (Number(price) || 0).toFixed(2)
    return `US$ ${value}`
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

  const renderStars = (rating?: number | string) => {
    const numericRating = Number(rating)
    if (!Number.isFinite(numericRating) || numericRating <= 0) return null
    const fullStars = Math.floor(numericRating)
    const hasHalfStar = numericRating % 1 !== 0
    
    return (
      <div className="product-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star full">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(5 - Math.ceil(numericRating))].map((_, i) => (
          <span key={i} className="star empty">★</span>
        ))}
        <span className="rating-number">({numericRating})</span>
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
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-card skeleton">
                <div className="product-image-container">
                  <div className="skeleton skeleton-image" />
                </div>
                <div className="product-info">
                  <div className="skeleton skeleton-line w-80" />
                  <div className="skeleton skeleton-line w-60" />
                  <div className="skeleton skeleton-price" />
                </div>
              </div>
            ))}
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
              // Descuento propio (tienda)
              const showDescuentoTienda = !!(
                product.descuento?.activo &&
                typeof product.descuento?.porcentaje === 'number' && product.descuento.porcentaje > 0 &&
                typeof product.descuento?.precio_original === 'number' && product.descuento.precio_original > product.price
              )
              const precioOriginal = showDescuentoTienda ? product.descuento!.precio_original : undefined
              const porcentajeDescuento = showDescuentoTienda ? product.descuento!.porcentaje : undefined
              // Descuento de MercadoLibre
              const precioOriginalML = product.descuento_ml?.original_price
              const showDescuentoML = typeof precioOriginalML === 'number' && precioOriginalML > product.price
              const porcentajeDescuentoTienda = showDescuentoTienda ? product.descuento!.porcentaje : undefined
              
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
                    {showDescuentoTienda && typeof porcentajeDescuentoTienda === 'number' ? (
                      <div className="product-badge">
                        -{porcentajeDescuentoTienda}%
                      </div>
                    ) : (
                      <div className="product-badge">
                        Destacado
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    {((product.metrics?.reviews?.rating_average ?? 0) > 0) && 
                      renderStars(product.metrics?.reviews?.rating_average)}
                    <div className="product-price-container">
                      {(showDescuentoTienda || showDescuentoML) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontSize: '1rem',
                            lineHeight: '1'
                          }}>
                            {formatPrice(showDescuentoML ? (precioOriginalML as number) : (precioOriginal as number))}
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
