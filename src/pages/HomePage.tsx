import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import ImageCarousel from '../components/ImageCarousel'
import ProductCategories from '../components/ProductCategories'
import ProductCategories2 from '../components/ProductCategories2'
import CustomerReviews from '../components/CustomerReviews'
import InstagramSection from '../components/InstagramSection'
import BestSellingProducts from '../components/BestSellingProducts'
import WelcomeSection from '../components/WelcomeSection'
import SpecialPromotion from '../components/SpecialPromotion'
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
  const rawCarouselImages = [
    'https://res.cloudinary.com/geronicola/image/upload/v1761663362/poppy-shop/ovqszuc7akrmbmpfe4qk.webp',
    'https://res.cloudinary.com/geronicola/image/upload/v1761663361/poppy-shop/vwokbibws6jqlcjja2q3.webp',
    'https://res.cloudinary.com/geronicola/image/upload/v1761663362/poppy-shop/yrpuzgsq4jaohsvpqhpk.webp'
  ]

  const optimizeCloudinary = (url: string, width: number) => {
    try {
      if (!url.includes('/upload/')) return url
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${Math.max(320, Math.min(1920, Math.round(width)))} /`).replace(/\s+/g, '')
    } catch { return url }
  }

  const carouselImages = useMemo(() => {
    const vw = Math.max(360, typeof window !== 'undefined' ? window.innerWidth : 1280)
    const targetW = vw <= 480 ? 720 : vw <= 768 ? 960 : 1280
    return rawCarouselImages.map(u => optimizeCloudinary(u, targetW))
  }, [])

  // Evento activo (dinámico desde backend)
  const [activeEvent, setActiveEvent] = useState<{ slug: string; titulo: string; theme?: string; fecha_inicio?: string; fecha_fin?: string; subtitle?: string; discount_text?: string; mostrar_boton?: boolean } | null>(null)

  useEffect(() => {
    // Preload de la imagen principal del carrusel (LCP) con alta prioridad
    try {
      const href = rawCarouselImages[0]
      if (href) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        ;(link as any).fetchPriority = 'high'
        link.href = href
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        return () => { try { document.head.removeChild(link) } catch {} }
      }
    } catch {}
  }, [])

  useEffect(() => {
    let mounted = true
    // Usar listAll() y filtrar por activo: true para mostrar el banner aunque la fecha_inicio sea futura
    EventService.listAll()
      .then(res => {
        // Filtrar eventos activos (ignorando las fechas para el banner)
        const eventosActivos = (res.eventos || []).filter((e: any) => e.activo)
        const ev = eventosActivos[0] || null
        if (mounted) {
          setActiveEvent(ev)
          if (ev) {
            console.log('✅ Evento activo encontrado:', ev)
          }
        }
      })
      .catch((err) => {
        console.error('❌ Error cargando eventos:', err)
        if (mounted) setActiveEvent(null)
      })
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

      {/* Evento activo dinámico - Banner grande de promoción */}
      {activeEvent && (() => {
        // Determinar la fecha para la cuenta regresiva:
        // - Si hay fecha_inicio y es futura, usar fecha_inicio (cuenta regresiva hasta que empiece)
        // - Si no hay fecha_inicio o ya pasó, usar fecha_fin (cuenta regresiva hasta que termine)
        const now = new Date()
        
        // Crear fechas interpretándolas correctamente
        const parseDate = (dateStr: string | undefined) => {
          if (!dateStr) return null
          const date = new Date(dateStr)
          // Si la fecha es inválida, retornar null
          if (isNaN(date.getTime())) return null
          return date
        }
        
        const fechaInicio = parseDate(activeEvent.fecha_inicio)
        const fechaFin = parseDate(activeEvent.fecha_fin)
        
        // Usar fecha_inicio si es futura, sino usar fecha_fin
        const deadlineDate = (fechaInicio && fechaInicio > now) ? fechaInicio : fechaFin
        
        // Formatear fecha extrayendo directamente del string original para evitar problemas de zona horaria
        const formatDateFromString = (dateStr: string | undefined, dateObj: Date | null) => {
          if (!dateStr || !dateObj) return ''
          
          // Intentar extraer la fecha directamente del string ISO si está disponible
          // Formato esperado: "2024-11-28T00:00:00.000Z" o "2024-11-28T03:00:00.000Z"
          const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
          if (isoMatch) {
            const [, , month, day] = isoMatch
            const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                              'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
            const monthIndex = parseInt(month, 10) - 1
            return `${parseInt(day, 10)} de ${monthNames[monthIndex]}`
          }
          
          // Fallback: usar toLocaleDateString
          return dateObj.toLocaleDateString('es-UY', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
          })
        }
        
        // Determinar qué string de fecha usar
        const fechaStr = (fechaInicio && fechaInicio > now) 
          ? activeEvent.fecha_inicio 
          : activeEvent.fecha_fin
        
        const endDateText = formatDateFromString(fechaStr, deadlineDate)
        
        // Debug: mostrar información de fechas
        if (fechaInicio) {
          console.log('📅 Fecha inicio original (string):', activeEvent.fecha_inicio)
          console.log('📅 Fecha inicio parseada (ISO):', fechaInicio.toISOString())
          console.log('📅 Fecha inicio local:', fechaInicio.toLocaleString('es-UY'))
          console.log('📅 Fecha inicio formateada:', endDateText)
        }
        
        // Texto del contador según la fecha usada
        const countdownText = (fechaInicio && fechaInicio > now) 
          ? `¡Comienza el ${endDateText}!` 
          : `¡Termina el ${endDateText}!`
        
        return (
          <SpecialPromotion 
            title={`${(activeEvent.theme || '').toLowerCase() === 'halloween' ? '🎃 ' : (activeEvent.theme || '').toLowerCase() === 'blackfriday' ? '🛍️ ' : ''}${activeEvent.titulo}`}
            subtitle={activeEvent.subtitle || (
              (activeEvent.theme || '').toLowerCase() === 'halloween' 
                ? '¡No te pierdas las mejores ofertas de Halloween!' 
                : (activeEvent.theme || '').toLowerCase() === 'blackfriday'
                ? '¡Descuentos increíbles en toda la tienda! No te lo pierdas'
                : 'Ofertas por tiempo limitado'
            )}
            discount={activeEvent.discount_text || 'Hasta 50% OFF'}
            endDate={endDateText}
            countdownText={countdownText}
            theme={((activeEvent.theme || 'summer') as any)}
            linkTo={`/eventos/${activeEvent.slug}`}
            deadline={deadlineDate ? deadlineDate.toISOString() : undefined}
            showButton={activeEvent.mostrar_boton !== undefined ? activeEvent.mostrar_boton : true}
          />
        )
      })()}

      

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