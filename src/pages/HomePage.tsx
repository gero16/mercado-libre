import React from 'react'
import ImageCarousel from '../components/ImageCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import SpecialPromotion from '../components/SpecialPromotion'
import ProductCategories from '../components/ProductCategories'
import ProductCategories2 from '../components/ProductCategories2'
import FeaturedProducts from '../components/FeaturedProducts'
import BestSellingProducts from '../components/BestSellingProducts'
import DiscountedProducts from '../components/DiscountedProducts'
import CustomerReviews from '../components/CustomerReviews'
import InstagramSection from '../components/InstagramSection'

const HomePage: React.FC = () => {
  // Array de imágenes para el carrusel
  const carouselImages = [
    '/img/consola-valve-2.webp',
    '/img/banner.png', 
    '/img/runnin.jpg',
    '/img/portada4.jpg'
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

      {/* Sección de productos más vendidos */}
      <BestSellingProducts />
      
      {/* Sección de categorías de productos */}
      <ProductCategories />

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
      
      {/* Sección de productos con descuento */}
      <DiscountedProducts />
      
      {/* Segunda sección de categorías */}
      <ProductCategories2 />
      
      {/* Sección de reseñas de clientes */}
      <CustomerReviews />
      
      {/* Sección de Instagram */}
      <InstagramSection />
      
      <div className="metodo-pago centrar-texto">
      </div>
    </>
  )
}

export default HomePage 