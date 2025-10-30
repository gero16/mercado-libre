import React, { useState, useEffect, useMemo } from 'react'
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
        // 🚀 Usar endpoint con paginación para reducir datos
        const response = await fetch(
          `https://poppy-shop-production.up.railway.app/ml/productos?limit=${limit * 3}` // Pedimos más para asegurar suficientes con descuento
        )
        const data = await response.json()
        
        // El endpoint con paginación devuelve {productos: [], pagination: {}}
        const productos = data.productos || data
        
        // Filtrar productos con descuento activo y con imagen
        const productosConDescuento = productos.filter((p: ProductoML) => {
          const tieneImagen = (p.images && p.images.length > 0 && p.images[0].url) || p.main_image
          const tieneDescuento = p.descuento?.activo === true
          const estaActivo = p.status === 'active'
          const tieneStock = p.available_quantity > 0
          
          return tieneDescuento && estaActivo && tieneStock && tieneImagen
        }).slice(0, limit)
        
        console.log('🔥 Productos con descuento:', productosConDescuento.length, 'productos')
        
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
  
  // Calcular totalPages con useMemo para asegurar que se recalcule cuando cambie discountedProducts
  const totalPages = useMemo(() => {
    const pages = Math.max(1, Math.ceil(discountedProducts.length / productsPerPage))
    console.log('🔢 Total de páginas calculadas:', pages, '| Productos:', discountedProducts.length)
    return pages
  }, [discountedProducts.length])
  
  // Calcular productos actuales con useMemo
  const getCurrentProducts = useMemo(() => {
    const startIndex = currentPage * productsPerPage
    const products = discountedProducts.slice(startIndex, startIndex + productsPerPage)
    console.log('📄 Página actual:', currentPage, '| Mostrando productos:', products.length)
    return products
  }, [discountedProducts, currentPage])

  const nextPage = () => {
    console.log('➡️ Click en flecha siguiente | totalPages:', totalPages)
    if (totalPages <= 1) {
      console.log('⚠️ No hay más páginas para avanzar')
      return
    }
    setCurrentPage((prev) => {
      const next = (prev + 1) % totalPages
      console.log('➡️ Avanzando de página', prev, 'a', next)
      return next
    })
  }

  const prevPage = () => {
    console.log('⬅️ Click en flecha anterior | totalPages:', totalPages)
    if (totalPages <= 1) {
      console.log('⚠️ No hay más páginas para retroceder')
      return
    }
    setCurrentPage((prev) => {
      const next = (prev - 1 + totalPages) % totalPages
      console.log('⬅️ Retrocediendo de página', prev, 'a', next)
      return next
    })
  }

  const goToPage = (page: number) => {
    console.log('🎯 Ir a página:', page)
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
    }
  }
  
  // Reset currentPage si excede el número de páginas
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0)
    }
  }, [totalPages, currentPage])

  const formatPrice = (price: number) => {
    const value = (Number(price) || 0).toFixed(2)
    return `US$ ${value}`
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
          {totalPages > 1 && (
            <button 
              className="carousel-arrow carousel-arrow-left" 
              onClick={prevPage}
              aria-label="Productos anteriores"
            >
              &#8249;
            </button>
          )}
          
          <div className="products-grid">
            {getCurrentProducts.map((product) => {
              const imagenOriginal = product.images && product.images.length > 0 
                ? product.images[0].url 
                : product.main_image
              const imagenPrincipal = getOptimizedImageUrl(imagenOriginal)
              const ahorro = calcularAhorro(product)
              
              // No mostrar productos sin imagen
              if (!imagenPrincipal) return null
              
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
                      loading="lazy"
                      decoding="async"
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
          
          {totalPages > 1 && (
            <button 
              className="carousel-arrow carousel-arrow-right" 
              onClick={nextPage}
              aria-label="Siguientes productos"
            >
              &#8250;
            </button>
          )}
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