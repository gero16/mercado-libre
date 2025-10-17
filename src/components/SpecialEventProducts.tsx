import React, { useEffect, useState } from 'react'

interface EventProduct {
  _id?: string
  ml_id: string
  title: string
  price: number
  images?: Array<{ url: string }>
  main_image?: string
  available_quantity?: number
  status?: string
}

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'https://poppy-shop-production.up.railway.app')

const SpecialEventProducts: React.FC<{ slug: string; title: string }>
  = ({ slug, title }) => {
  const [items, setItems] = useState<EventProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/productos`)
        const data = await res.json()
        if (data.success) setItems(data.productos || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading || items.length === 0) return null

  return (
    <section style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">Selección especial para este evento</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {items.map((p) => (
            <div key={p.ml_id} className="producto centrar-texto" style={{ cursor: 'pointer' }}>
              <img 
                src={p.images && p.images[0]?.url ? p.images[0].url : (p as any).image || p.main_image || ''}
                alt={p.title}
                loading="lazy"
                decoding="async"
              />
              <p>{p.title}</p>
              <p>US$ {p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpecialEventProducts
