import React, { useState } from 'react'
import { Producto } from '../types'

interface DiscountedProductsProps {
  products?: DiscountedProduct[]
}

interface DiscountedProduct extends Producto {
  originalPrice: number
  discountPercentage: number
}

const DiscountedProducts: React.FC<DiscountedProductsProps> = ({ products }) => {
  // Productos con descuento de ejemplo
  const discountedProducts: DiscountedProduct[] = products || [
    {
      id: '1',
      name: 'Campera Adidas Originals',
      image: '/img/campera.webp',
      category: 'Ropa',
      price: 12799,
      originalPrice: 15999,
      discountPercentage: 20,
      stock: 15,
      cantidad: 1,
      color: 'Negro'
    },
    {
      id: '2', 
      name: 'Mochila Champion',
      image: '/img/mochila.webp',
      category: 'Accesorios',
      price: 7199,
      originalPrice: 8999,
      discountPercentage: 20,
      stock: 8,
      cantidad: 1,
      color: 'Azul'
    },
    {
      id: '3',
      name: 'Remera Adidas',
      image: '/img/remera.webp', 
      category: 'Ropa',
      price: 4799,
      originalPrice: 5999,
      discountPercentage: 20,
      stock: 25,
      cantidad: 1,
      color: 'Blanco'
    },
    {
      id: '4',
      name: 'Gorro Champion',
      image: '/img/gorro.webp',
      category: 'Accesorios', 
      price: 3999,
      originalPrice: 4999,
      discountPercentage: 20,
      stock: 12,
      cantidad: 1,
      color: 'Gris'
    },
    {
      id: '5',
      name: 'Pantalón Adidas',
      image: '/img/pantalon.webp',
      category: 'Ropa',
      price: 10399,
      originalPrice: 12999,
      discountPercentage: 20,
      stock: 10,
      cantidad: 1,
      color: 'Negro'
    },
    {
      id: '6',
      name: 'Short Champion',
      image: '/img/short.webp',
      category: 'Ropa',
      price: 5599,
      originalPrice: 6999,
      discountPercentage: 20,
      stock: 18,
      cantidad: 1,
      color: 'Azul'
    },
    {
      id: '7',
      name: 'Medias Adidas',
      image: '/img/medias.webp',
      category: 'Accesorios',
      price: 3199,
      originalPrice: 3999,
      discountPercentage: 20,
      stock: 30,
      cantidad: 1,
      color: 'Blanco'
    },
    {
      id: '8',
      name: 'Mochila Adidas',
      image: '/img/mochila2.jpg',
      category: 'Accesorios',
      price: 8799,
      originalPrice: 10999,
      discountPercentage: 20,
      stock: 6,
      cantidad: 1,
      color: 'Negro'
    }
  ]

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
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <section className="discounted-products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">🔥 Productos con Descuento</h2>
          <p className="section-subtitle">Aprovecha estas ofertas limitadas</p>
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
            {getCurrentProducts().map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-badge discount-badge">
                    -{product.discountPercentage}%
                  </div>
                  <div className="discount-ribbon">
                    ¡En Oferta!
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  
                  <div className="product-price-container">
                    <div className="price-info">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    </div>
                    <span className="product-stock">
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                    </span>
                  </div>
                  
                  <div className="savings-info">
                    <span className="savings-text">
                      Ahorrás {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </div>
                  
                  <button className="product-button">
                    Aprovechar Oferta
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
            Ver Todas las Ofertas
          </button>
        </div>
      </div>
    </section>
  )
}

export default DiscountedProducts
