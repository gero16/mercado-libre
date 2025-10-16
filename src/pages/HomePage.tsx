import React, { Suspense, lazy } from 'react'
import ImageCarousel from '../components/ImageCarousel'
import SpecialPromotion from '../components/SpecialPromotion'
import ProductCategories from '../components/ProductCategories'
import ProductCategories2 from '../components/ProductCategories2'
import CustomerReviews from '../components/CustomerReviews'
import InstagramSection from '../components/InstagramSection'
import LazySection from '../components/LazySection'
import BestSellingProducts from '../components/BestSellingProducts'
import WelcomeSection from '../components/WelcomeSection'

// 🚀 Lazy loading solo para componentes que están más abajo en la página
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'))
const DiscountedProducts = lazy(() => import('../components/DiscountedProducts'))

// 🎯 Skeleton Loader mejorado
const ProductsSkeleton = ({ title }: { title: string }) => (
  <section style={{ padding: '40px 0' }}>
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">Cargando productos...</p>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            height: '350px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ))}
      </div>
    </div>
  </section>
)

const HomePage: React.FC = () => {
  // Array de imágenes para el carrusel
  const carouselImages = [
    'https://res.cloudinary.com/geronicola/image/upload/v1760638797/poppy-shop/q2l0fkzp85v6hiiomcgc.png',
    'https://res.cloudinary.com/geronicola/image/upload/v1760638796/poppy-shop/fdshlrd4xbh9w2up72kw.png',
    'https://res.cloudinary.com/geronicola/image/upload/v1760638797/poppy-shop/yx7dr9n6seqqhqedvkfz.png'
  ]

  return (
    <>
      {/* Carrusel de imágenes principal */}
      <ImageCarousel 
        images={carouselImages}
        interval={4000}
        showDots={true}
        showArrows={true}
      />

      {/* Sección de bienvenida */}
      <WelcomeSection 
        title="¡Bienvenido a Poppy Shop Uruguay!"
        subtitle="Emprendimiento uruguayo con años de experiencia"
        description="Somos una tienda en línea comprometida en ofrecer una amplia gama de productos de cualquier parte del mundo. Nuestro propósito es hacer de tus deseos, realidad, por eso nos encargamos de todo para que puedas tener eso que tanto querés."
      />

      {/* Sección de productos más vendidos - Carga inmediata (above the fold) */}
      <BestSellingProducts limit={8} />
      
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
      
      {/* Sección de productos destacados - Carga solo cuando esté cerca del viewport */}
      <LazySection 
        fallback={<ProductsSkeleton title="⭐ Productos Destacados" />}
        minHeight="500px"
      >
        <Suspense fallback={<ProductsSkeleton title="⭐ Productos Destacados" />}>
          <FeaturedProducts limit={8} />
        </Suspense>
      </LazySection>
      
      {/* Sección de productos con descuento - Carga solo cuando esté cerca del viewport */}
      <LazySection 
        fallback={<ProductsSkeleton title="🔥 Productos en Descuento" />}
        minHeight="500px"
      >
        <Suspense fallback={<ProductsSkeleton title="🔥 Productos en Descuento" />}>
          <DiscountedProducts limit={8} />
        </Suspense>
      </LazySection>
      
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