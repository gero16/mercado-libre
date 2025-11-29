import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductoML } from '../types'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

const EventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [productos, setProductos] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)
  const [search] = useState('')
  const [statusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const { addToCart } = useCart()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/productos`)
        const data = await res.json()
        if (data?.success) {
          setProductos(data.productos || [])
        } else if (Array.isArray(data)) {
          setProductos(data)
        } else {
          setProductos([])
        }
      } catch {
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const filtered = useMemo(() => {
    return productos.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter === 'active' && p.status === 'paused') return false
      if (statusFilter === 'paused' && p.status !== 'paused') return false
      return true
    })
  }, [productos, search, statusFilter])

  // 🎯 Estilos temáticos por evento (similar a SpecialPromotion)
  const themeStyles = useMemo(() => {
    switch ((slug || '').toLowerCase()) {
      case 'halloween':
        return {
          background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
          icon: '🎃',
          accentColor: '#ff6b35',
          title: 'Halloween Sale',
          subtitle: 'Ofertas espeluznantes por tiempo limitado'
        }
      case 'blackfriday':
        return {
          background: 'linear-gradient(135deg, #000000, #333333, #000000)',
          icon: '🛍️',
          accentColor: '#ff0000',
          title: 'Black Friday',
          subtitle: 'Descuentos épicos en toda la tienda'
        }
      default:
        return {
          background: 'linear-gradient(135deg, var(--color-primary), #e08a00, var(--color-primary))',
          icon: '🎉',
          accentColor: 'var(--color-primary)',
          title: `Evento: ${slug}`,
          subtitle: 'Selección especial de productos'
        }
    }
  }, [slug])

  if (loading) {
    return (
      <main>
        <section style={{ padding: '36px 0' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Evento: {slug}</h2>
              <p className="section-subtitle">Cargando productos del evento...</p>
            </div>
            <ProductSkeleton count={6} />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      {/* Hero temático */}
      <section style={{ background: themeStyles.background, padding: '36px 0', marginTop: '30px' }}>
        <div className="container" style={{ color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2rem' }}>{themeStyles.icon}</div>
            <div>
              <h1 style={{ margin: 0 }}>{themeStyles.title}</h1>
              <p style={{ margin: '6px 0 0 0', opacity: 0.95 }}>{themeStyles.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección con la misma estructura/clases que la tienda para heredar estilos */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Productos del evento</h2>
            <p className="section-subtitle">Mostrando solo productos asociados a este evento</p>
          </div>

          <div className="products-grid">
            {filtered.length === 0 ? (
              <div className="no-products">
                <p>No se encontraron productos para este evento.</p>
              </div>
            ) : (
              filtered.map((p) => (
                <ProductCard
                  key={p.ml_id}
                  product={p}
                  showAddButton
                  onAddToCart={(prod) => {
                    addToCart({
                      id: prod._id,
                      name: prod.title,
                      image: prod.images?.[0]?.url || (prod as any).image || prod.main_image || '',
                      category: prod.category_id || 'general',
                      price: prod.price,
                      stock: prod.available_quantity || 0,
                      cantidad: 1,
                      size: null
                    })
                  }}
                  onClick={() => navigate(`/eventos/${slug}/producto/${p.ml_id}`)}
                />
              ))
            )}
          </div>

          <div className="section-footer" style={{ marginTop: 24 }}>
            <button className="view-all-button" onClick={() => (window.location.href = '/tienda-ml')}>
              Ver Todos los Productos
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default EventPage


