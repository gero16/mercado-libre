import React from 'react'
import ImageCarousel from '../components/ImageCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import SpecialPromotion from '../components/SpecialPromotion'
import ProductCategories from '../components/ProductCategories'
import FeaturedProducts from '../components/FeaturedProducts'
import DiscountedProducts from '../components/DiscountedProducts'
import CustomerReviews from '../components/CustomerReviews'

const HomePage: React.FC = () => {
  // Array de imágenes para el carrusel
  const carouselImages = [
    '/src/img/adidas.png',
    '/img/banner.png', 
    '/src/img/runnin.jpg',
    '/src/img/portada4.jpg',
    '/src/img/run.jpg'
  ]

  return (
    <>
      {/* Banner promocional en la parte superior */}
      <PromotionalBanner />

      {/* Carrusel de imágenes principal */}
      <ImageCarousel 
        images={carouselImages}
        interval={4000}
        showDots={true}
        showArrows={true}
      />

      {/* Sección especial de promoción */}
      <SpecialPromotion 
        title="🎃 Halloween Sale"
        subtitle="¡No te pierdas las mejores ofertas de Halloween!"
        discount="Hasta 50% OFF"
        endDate="31 de Octubre"
        theme="halloween"
      />
      
      {/* Sección de productos destacados */}
      <FeaturedProducts />
      
      {/* Sección de categorías de productos */}
      <ProductCategories />
      
      {/* Sección de productos con descuento */}
      <DiscountedProducts />
      
      {/* Sección de reseñas de clientes */}
      <CustomerReviews />
      
      <div className="metodo-pago centrar-texto">
      </div>
    </>
  )
}

export default HomePage 