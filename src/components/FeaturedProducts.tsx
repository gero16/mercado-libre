import React, { useState } from 'react'
import { Producto } from '../types'

interface FeaturedProductsProps {
  products?: Producto[]
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  // Productos destacados de ejemplo (puedes reemplazar con datos reales)
  const featuredProducts: Producto[] = products || [
    {
      id: '1',
      name: 'Campera Adidas Originals',
      image: '/img/campera.webp',
      category: 'Ropa',
      price: 15999,
      stock: 15,
      cantidad: 1,
      color: 'Negro'
    },
    {
      id: '2', 
      name: 'Mochila Champion',
      image: '/img/mochila.webp',
      category: 'Accesorios',
      price: 8999,
      stock: 8,
      cantidad: 1,
      color: 'Azul'
    },
    {
      id: '3',
      name: 'Remera Adidas',
      image: '/img/remera.webp', 
      category: 'Ropa',
      price: 5999,
      stock: 25,
      cantidad: 1,
      color: 'Blanco'
    },
    {
      id: '4',
      name: 'Gorro Champion',
      image: '/img/gorro.webp',
      category: 'Accesorios', 
      price: 4999,
      stock: 12,
      cantidad: 1,
      color: 'Gris'
    },
    {
      id: '5',
      name: 'Pantalón Adidas',
      image: '/img/pantalon.webp',
      category: 'Ropa',
      price: 12999,
      stock: 10,
      cantidad: 1,
      color: 'Negro'
    },
    {
      id: '6',
      name: 'Short Champion',
      image: '/img/short.webp',
      category: 'Ropa',
      price: 6999,
      stock: 18,
      cantidad: 1,
      color: 'Azul'
    },
    {
      id: '7',
      name: 'Medias Adidas',
      image: '/img/medias.webp',
      category: 'Accesorios',
      price: 3999,
      stock: 30,
      cantidad: 1,
      color: 'Blanco'
    },
    {
      id: '8',
      name: 'Mochila Adidas',
      image: '/img/mochila2.jpg',
      category: 'Accesorios',
      price: 10999,
      stock: 6,
      cantidad: 1,
      color: 'Negro'
    }
  ]

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
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
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
            {getCurrentProducts().map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-badge">
                    Destacado
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  
                  <div className="product-price-container">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <span className="product-stock">
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                    </span>
                  </div>
                  
                  <button className="product-button">
                    Ver Detalles
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
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
