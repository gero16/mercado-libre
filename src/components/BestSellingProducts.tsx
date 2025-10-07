import React, { useState } from 'react'
import { Producto } from '../types'

interface BestSellingProductsProps {
  products?: BestSellingProduct[]
}

interface BestSellingProduct extends Producto {
  unitsSold: number
  rating?: number
}

const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ products }) => {
  // Productos más vendidos de ejemplo
  const bestSellingProducts: BestSellingProduct[] = products || [
    {
      id: '1',
      name: 'Zapatillas Adidas Running',
      image: '/img/champion4.png',
      category: 'Calzado',
      price: 18999,
      stock: 12,
      cantidad: 1,
      color: 'Negro/Blanco',
      unitsSold: 245,
      rating: 4.8
    },
    {
      id: '2', 
      name: 'Remera Deportiva Adidas',
      image: '/img/remera2.webp',
      category: 'Ropa',
      price: 6999,
      stock: 20,
      cantidad: 1,
      color: 'Varios',
      unitsSold: 189,
      rating: 4.6
    },
    {
      id: '3',
      name: 'Short Champion Training',
      image: '/img/short2.webp', 
      category: 'Ropa',
      price: 7999,
      stock: 15,
      cantidad: 1,
      color: 'Negro',
      unitsSold: 167,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Mochila Champion Pro',
      image: '/img/mochila3.jpg',
      category: 'Accesorios', 
      price: 11999,
      stock: 8,
      cantidad: 1,
      color: 'Negro',
      unitsSold: 156,
      rating: 4.9
    },
    {
      id: '5',
      name: 'Campera Deportiva',
      image: '/img/campera.webp',
      category: 'Ropa',
      price: 15999,
      stock: 10,
      cantidad: 1,
      color: 'Negro',
      unitsSold: 143,
      rating: 4.5
    },
    {
      id: '6',
      name: 'Pantalón Deportivo',
      image: '/img/pantalon2.webp',
      category: 'Ropa',
      price: 9999,
      stock: 18,
      cantidad: 1,
      color: 'Gris',
      unitsSold: 128,
      rating: 4.6
    },
    {
      id: '7',
      name: 'Gorro Champion',
      image: '/img/gorro2.webp',
      category: 'Accesorios',
      price: 4999,
      stock: 25,
      cantidad: 1,
      color: 'Negro',
      unitsSold: 112,
      rating: 4.4
    },
    {
      id: '8',
      name: 'Remera Estampada Champion',
      image: '/img/remera3.webp',
      category: 'Ropa',
      price: 7999,
      stock: 14,
      cantidad: 1,
      color: 'Blanco',
      unitsSold: 98,
      rating: 4.5
    }
  ]

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
            {getCurrentProducts().map((product, index) => (
              <div key={product.id} className="product-card">
                <div className="bestseller-rank">
                  #{currentPage * productsPerPage + index + 1}
                </div>
                
                <div className="product-image-container">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="bestseller-badge">
                    <span className="badge-icon">🏆</span>
                    <span className="badge-text">Top Ventas</span>
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  
                  {renderStars(product.rating)}
                  
                  <div className="sales-info">
                    <span className="units-sold">
                      <strong>{product.unitsSold}</strong> vendidos
                    </span>
                  </div>
                  
                  <div className="product-price-container">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <span className="product-stock">
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                    </span>
                  </div>
                  
                  <button className="product-button">
                    Comprar Ahora
                  </button>
                </div>
              </div>
            ))}
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
          <button className="view-all-button">
            Ver Todos los Bestsellers
          </button>
        </div>
      </div>
    </section>
  )
}

export default BestSellingProducts

