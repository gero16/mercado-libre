import React, { Suspense, lazy, useEffect, useState } from 'react'
import ImageCarousel from '../components/ImageCarousel'
import SpecialPromotion from '../components/SpecialPromotion'
import ProductCategories from '../components/ProductCategories'
import ProductCategories2 from '../components/ProductCategories2'
import CustomerReviews from '../components/CustomerReviews'
import InstagramSection from '../components/InstagramSection'
import BestSellingProducts from '../components/BestSellingProducts'
import WelcomeSection from '../components/WelcomeSection'
import { EventService } from '../services/event'
import { useAuth } from '../context/AuthContext'

// 🚀 Lazy loading solo para componentes que están más abajo en la página
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'))
// const DiscountedProducts = lazy(() => import('../components/DiscountedProducts'))

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
  const { isAuthenticated } = useAuth()
  // Array de imágenes para el carrusel
  const carouselImages = [
    'https://res.cloudinary.com/geronicola/image/upload/v1761663362/poppy-shop/ovqszuc7akrmbmpfe4qk.webp',
    'https://res.cloudinary.com/geronicola/image/upload/v1761663361/poppy-shop/vwokbibws6jqlcjja2q3.webp',
    'https://res.cloudinary.com/geronicola/image/upload/v1761663362/poppy-shop/yrpuzgsq4jaohsvpqhpk.webp'
  ]

  // Evento activo (dinámico desde backend)
  const [activeEvent, setActiveEvent] = useState<{ slug: string; titulo: string; theme?: string; fecha_fin?: string; subtitle?: string; discount_text?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    EventService.listActive()
      .then(res => {
        const ev = (res.eventos || [])[0] || null
        if (mounted) setActiveEvent(ev)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

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

      {/* Banner de invitación a registro (oculto si autenticado) */}
      {!isAuthenticated && (
        <section style={{ margin: '24px 0' }}>
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '16px 18px',
              borderRadius: 14,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🎁</span>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#111827' }}>¿Todavía no te registraste?</h3>
                <p style={{ margin: '4px 0 0 0', color: '#374151' }}>Registrate y disfrutá de beneficios, novedades y ofertas.</p>
              </div>
            </div>
            <a
              href="/register"
              style={{
                background: 'var(--color-primary, #fe9f01)',
                color: '#ffffff',
                fontWeight: 800,
                padding: '10px 18px',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 14px rgba(254,159,1,0.25)'
              }}
            >
              Registrarme
            </a>
          </div>
        </section>
      )}

      {/* Evento activo dinámico */}
      {activeEvent && (
        <>
          {/* <SpecialEventProducts slug={activeEvent.slug} title={`Selección ${activeEvent.titulo}`} /> */}
            <SpecialPromotion 
            title={`${(activeEvent.theme || '').toLowerCase() === 'halloween' ? '🎃 ' : ''}${activeEvent.titulo}`}
            subtitle={activeEvent.subtitle || ((activeEvent.theme || '').toLowerCase() === 'halloween' ? '¡No te pierdas las mejores ofertas de Halloween!' : 'Ofertas por tiempo limitado')}
            discount={activeEvent.discount_text || 'Hasta 50% OFF'}
            endDate={activeEvent.fecha_fin ? new Date(activeEvent.fecha_fin).toLocaleDateString('es-UY', { day: 'numeric', month: 'long' }) : ''}
            theme={((activeEvent.theme || 'summer') as any)}
            linkTo={`/eventos/${activeEvent.slug}`}
            deadline={activeEvent.fecha_fin}
          />
        </>
      )}

      {/* Sección de productos más vendidos - Carga inmediata (above the fold) */}
      <BestSellingProducts limit={8} />
      
      {/* Sección de categorías de productos */}
      <ProductCategories />

      {/* Si no hay evento activo, se omitirá la promo dinámica */}
      
      {/* Sección de productos destacados - Carga solo cuando esté cerca del viewport */}
      {/* Cargar destacados sin lazy para que aparezcan más rápido */}
      <Suspense fallback={<ProductsSkeleton title="⭐ Productos Destacados" />}>
        <FeaturedProducts limit={12} />
      </Suspense>
      
      {/* Sección de productos con descuento - Carga solo cuando esté cerca del viewport 
      <LazySection 
        fallback={<ProductsSkeleton title="🔥 Productos en Descuento" />}
        minHeight="500px"
      >
        <Suspense fallback={<ProductsSkeleton title="🔥 Productos en Descuento" />}>
          <DiscountedProducts limit={8} />
        </Suspense>
      </LazySection>

      */
      }
      
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