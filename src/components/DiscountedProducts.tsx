import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import { useNavigate } from 'react-router-dom'
import '../css/discounted-products.css'

interface DiscountedProductsProps {
  limit?: number
}

const DiscountedProducts: React.FC<DiscountedProductsProps> = ({ limit = 8 }) => {
  const navigate = useNavigate()
  const [discountedProducts, setDiscountedProducts] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
        const data: ProductoML[] = await response.json()
        
        // Filtrar productos con descuento activo
        const productosConDescuento = data
          .filter(p => 
            p.descuento?.activo === true && 
            p.status !== 'paused' && 
            p.available_quantity > 0
          )
          .slice(0, limit)
        
        console.log('🔥 Productos con descuento:', productosConDescuento.length)
        
        setDiscountedProducts(productosConDescuento)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando productos con descuento:', error)
        setLoading(false)
      }
    }
    
    fetchDiscountedProducts()
  }, [limit])

  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 4
  const totalPages = Math.ceil(discountedProducts.length / productsPerPage)

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
    return discountedProducts.slice(startIndex, startIndex + productsPerPage)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Función para obtener URL de imagen optimizada
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return url
    return url.replace(/-[IOSV]\.jpg$/, '-V.jpg')
  }

  const handleProductClick = (product: ProductoML) => {
    navigate(`/producto/${product.ml_id}`)
  }

  const calcularAhorro = (producto: ProductoML) => {
    if (!producto.descuento?.precio_original) return 0
    return producto.descuento.precio_original - producto.price
  }

  if (loading) {
    return (
      <section className="discounted-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 Productos en Descuento</h2>
            <p className="section-subtitle">Cargando ofertas...</p>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay productos con descuento, no mostrar la sección
  if (discountedProducts.length === 0) {
    return null
  }

  return (
    <section className="discounted-products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">🔥 Productos en Descuento</h2>
          <p className="section-subtitle">¡Aprovecha estas ofertas especiales!</p>
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
              const ahorro = calcularAhorro(product)
              
              return (
                <div 
                  key={product._id} 
                  className="discount-product-card"
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-container">
                    <img 
                      src={imagenPrincipal} 
                      alt={product.title}
                      className="product-image"
                    />
                    <div className="discount-badge">
                      -{product.descuento?.porcentaje}%
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.title}</h3>
                    
                    <div className="price-info">
                      <div className="price-row">
                        <span className="original-price">
                          {formatPrice(product.descuento?.precio_original || 0)}
                        </span>
                        <span className="discount-price">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {ahorro > 0 && (
                        <span className="savings">
                          Ahorras {formatPrice(ahorro)}
                        </span>
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
        
        {totalPages > 1 && (
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
        )}
        
        <div className="section-footer">
          <button 
            className="view-all-button"
            onClick={() => navigate('/tienda-ml', { state: { categoryFilter: 'con-descuento' } })}
          >
            Ver Todos los Descuentos
          </button>
        </div>
      </div>
    </section>
  )
}

export default DiscountedProducts