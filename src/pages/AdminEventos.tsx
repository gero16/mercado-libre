import React, { useEffect, useMemo, useState } from 'react'
import { EventService } from '../services/event'
import { AuthService } from '../services/auth'

interface Evento {
  slug: string
  titulo: string
  descripcion?: string
  theme?: string
  activo: boolean
  fecha_inicio?: string
  fecha_fin?: string
  productos_ml_ids?: string[]
  subtitle?: string
  discount_text?: string
  discount_percentage?: number
}

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const isBrowser = typeof window !== 'undefined'
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND)

interface EventoProducto {
  ml_id: string
  title: string
  price: number
  image?: string
  images?: Array<{ url: string }>
  main_image?: string
  status?: string
  selected?: boolean
}

const AdminEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Evento>>({ activo: true })
  const [slugSeleccionado, setSlugSeleccionado] = useState<string>('')
  const [productosInput, setProductosInput] = useState('')
  const [discountPct, setDiscountPct] = useState<number>(10)
  const [resultadoAccion, setResultadoAccion] = useState<string | null>(null)
  const [productosEvento, setProductosEvento] = useState<EventoProducto[]>([])
  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [tab, setTab] = useState<'gestionar' | 'crear' | 'productos'>('gestionar')
  const token = AuthService.getToken() || ''

  const load = async () => {
    setLoading(true)
    try {
      const res = await EventService.listAll()
      setEventos(res.eventos || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.slug || !form.titulo) return alert('Slug y título son requeridos')
    await EventService.create({
      slug: form.slug.toLowerCase(),
      titulo: form.titulo,
      descripcion: form.descripcion,
      theme: form.theme,
      activo: form.activo,
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      subtitle: form.subtitle,
      discount_text: form.discount_text,
      discount_percentage: discountPct
    } as any, token)
    setForm({ activo: true })
    await load()
  }

  const agregarProductos = async () => {
    if (!slugSeleccionado) return alert('Selecciona un evento')
    const ids = productosInput.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
    if (ids.length === 0) return alert('Ingresa al menos un ml_id')
    await EventService.addToEvent(slugSeleccionado, ids, token)
    setProductosInput('')
    await load()
    await cargarProductosEvento(slugSeleccionado)
  }

  const removerProductos = async () => {
    if (!slugSeleccionado) return alert('Selecciona un evento')
    const ids = productosInput.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
    if (ids.length === 0) return alert('Ingresa al menos un ml_id')
    await EventService.removeFromEvent(slugSeleccionado, ids, token)
    setProductosInput('')
    await load()
    await cargarProductosEvento(slugSeleccionado)
  }

  const actualizar = async (slug: string, update: Partial<Evento>) => {
    await EventService.update(slug, update, token)
    await load()
  }

  const eliminar = async (slug: string) => {
    if (!confirm('¿Eliminar evento?')) return
    await EventService.remove(slug, token)
    await load()
  }

  const eventoSeleccionado = useMemo(() => eventos.find(e => e.slug === slugSeleccionado), [eventos, slugSeleccionado])

  // Cargar productos del evento cuando cambia el slug seleccionado
  useEffect(() => {
    if (!slugSeleccionado) {
      setProductosEvento([])
      return
    }
    cargarProductosEvento(slugSeleccionado)
  }, [slugSeleccionado])

  const cargarProductosEvento = async (slug: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/eventos/${slug}/productos`)
      const data = await res.json()
      if (data?.success) {
        const items: EventoProducto[] = (data.productos || []).map((p: any) => ({
          ml_id: p.ml_id,
          title: p.title,
          price: p.price,
          image: p.images?.[0]?.url || p.main_image,
          images: p.images,
          main_image: p.main_image,
          status: p.status,
          selected: false
        }))
        setProductosEvento(items)
        setSelectAll(false)
      } else {
        setProductosEvento([])
      }
    } catch {
      setProductosEvento([])
    }
  }

  const toggleSelectAll = () => {
    const next = !selectAll
    setSelectAll(next)
    setProductosEvento(prev => prev.map(p => ({ ...p, selected: next })))
  }

  const toggleSelectOne = (ml_id: string) => {
    setProductosEvento(prev => prev.map(p => p.ml_id === ml_id ? { ...p, selected: !p.selected } : p))
  }

  const formatUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <main className="container" style={{ padding: '30px 0' }}>
      <h1>Administrar Eventos Especiales</h1>
      {/* Tabs navegación */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 10 }}>
        <button 
          className="btn-orden" 
          onClick={() => setTab('gestionar')} 
          style={{ 
            background: tab==='gestionar' ? '#eef2ff' : '#ffffff',
            color: tab==='gestionar' ? '#3730a3' : '#111827',
            border: tab==='gestionar' ? '2px solid #c7d2fe' : '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >Gestionar</button>
        <button 
          className="btn-orden" 
          onClick={() => setTab('crear')} 
          style={{ 
            background: tab==='crear' ? '#eef2ff' : '#ffffff',
            color: tab==='crear' ? '#3730a3' : '#111827',
            border: tab==='crear' ? '2px solid #c7d2fe' : '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >Crear</button>
        <button 
          className="btn-orden" 
          onClick={() => setTab('productos')} 
          style={{ 
            background: tab==='productos' ? '#eef2ff' : '#ffffff',
            color: tab==='productos' ? '#3730a3' : '#111827',
            border: tab==='productos' ? '2px solid #c7d2fe' : '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >Productos</button>
      </div>

      {/* Crear evento */}
      {tab === 'crear' && (
      <section style={{ marginTop: 10, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
        <h2>Crear nuevo evento</h2>
        <form onSubmit={crear} className="admin-form">
          <div className="grid-2">
            <div>
              <label>Slug</label>
              <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} className="admin-search-input" />
            </div>
            <div>
              <label>Título</label>
              <input value={form.titulo || ''} onChange={e => setForm({ ...form, titulo: e.target.value })} className="admin-search-input" />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Theme (opcional)</label>
              <input value={form.theme || ''} onChange={e => setForm({ ...form, theme: e.target.value })} className="admin-search-input" />
            </div>
            <div>
              <label>Activo</label>
              <input type="checkbox" checked={!!form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Subtítulo (para banner)</label>
              <input value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="admin-search-input" />
            </div>
            <div>
              <label>Texto de descuento</label>
              <input value={form.discount_text || ''} onChange={e => setForm({ ...form, discount_text: e.target.value })} className="admin-search-input" placeholder="Hasta 50% OFF" />
            </div>
          </div>
          <div>
            <label>Descripción</label>
            <textarea value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="admin-search-input" />
          </div>
          <div className="grid-2">
            <div>
              <label>Fecha fin (banner/contador)</label>
              <input 
                type="datetime-local" 
                value={form.fecha_fin || ''} 
                onChange={e => setForm({ ...form, fecha_fin: e.target.value })} 
                className="admin-search-input" 
              />
            </div>
          </div>
          <button type="submit" className="btn-orden">Crear evento</button>
        </form>
      </section>
      )}

      {/* Listado y edición rápida */}
      {tab === 'gestionar' && (
      <section style={{ marginTop: 10 }}>
        <h2>Eventos existentes</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : eventos.length === 0 ? (
          <p>No hay eventos</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {eventos.map(ev => (
              <div 
                key={ev.slug}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 14,
                  background: ev.activo ? 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)' : '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{ev.titulo}</h3>
                      <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 9999, padding: '2px 8px' }}>slug: {ev.slug}</span>
                    </div>
                    {ev.subtitle && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {ev.subtitle}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ev.theme && (
                      <span style={{ fontSize: 12, background: '#eef2ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: 9999, padding: '2px 8px' }}>{ev.theme}</span>
                    )}
                    <span style={{ fontSize: 12, background: ev.activo ? '#ecfeff' : '#fee2e2', color: ev.activo ? '#155e75' : '#b91c1c', border: `1px solid ${ev.activo ? '#a5f3fc' : '#fecaca'}`, borderRadius: 9999, padding: '2px 8px' }}>{ev.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: '#374151' }}>
                  <span style={{ background: '#f3f4f6', borderRadius: 8, padding: '4px 8px' }}>Productos: {ev.productos_ml_ids?.length || 0}</span>
                  {typeof ev.discount_percentage === 'number' && ev.discount_percentage > 0 && (
                    <span style={{ background: '#fff7ed', color: '#9a3412', borderRadius: 8, padding: '4px 8px' }}>Descuento: {ev.discount_percentage}%</span>
                  )}
                  {ev.fecha_fin && (
                    <span style={{ background: '#eef2ff', color: '#3730a3', borderRadius: 8, padding: '4px 8px' }}>Fin: {new Date(ev.fecha_fin).toLocaleDateString('es-UY', { day: '2-digit', month: 'short' })}</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  <button className="btn-orden" onClick={() => setSlugSeleccionado(ev.slug)}>
                    Seleccionar
                  </button>
                  <button 
                    className="btn-orden" 
                    onClick={() => actualizar(ev.slug, { activo: !ev.activo })}
                    style={{ background: ev.activo ? '#fff7ed' : '#ecfdf5', color: ev.activo ? '#9a3412' : '#065f46' }}
                  >
                    {ev.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    className="btn-orden" 
                    onClick={() => eliminar(ev.slug)} 
                    style={{ background: '#fee2e2', color: '#b91c1c' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {/* Asociación de productos */}
      {tab === 'productos' && (
      <section style={{ marginTop: 10, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
        <h2>Asociar productos al evento</h2>
        <div style={{ marginBottom: 10 }}>
          <label>Porcentaje de descuento del evento</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="range" min={1} max={90} value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
            <strong>{discountPct}%</strong>
          </div>
        </div>
        <div className="grid-2">
          <div>
            <label>Evento</label>
            <select value={slugSeleccionado} onChange={e => setSlugSeleccionado(e.target.value)} className="admin-select">
              <option value="">Selecciona...</option>
              {eventos.map(ev => (
                <option key={ev.slug} value={ev.slug}>{ev.titulo} ({ev.slug})</option>
              ))}
            </select>
          </div>
          <div>
            <label>ml_ids (separados por coma o espacios)</label>
            <input value={productosInput} onChange={e => setProductosInput(e.target.value)} className="admin-search-input" placeholder="MLU123 MLU456 ..." />
          </div>
        </div>
        {/* Listado de productos del evento con selección */}
        {slugSeleccionado && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <strong>Productos del evento: {productosEvento.length}</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /> Seleccionar todos
              </label>
              <span style={{ color: '#6b7280' }}>Seleccionados: {productosEvento.filter(p => p.selected).length}</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12
            }}>
              {productosEvento.map(p => (
                <div key={p.ml_id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, display: 'flex', gap: 10 }}>
                  <input type="checkbox" checked={!!p.selected} onChange={() => toggleSelectOne(p.ml_id)} />
                  <div style={{ width: 64, height: 64, overflow: 'hidden', borderRadius: 8, flexShrink: 0 }}>
                    {p.image ? (
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{p.title}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{formatUSD(p.price)}</span>
                      {p.status && <span style={{ fontSize: 12, color: p.status === 'active' ? '#16a34a' : '#ef4444' }}>{p.status}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{p.ml_id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn-orden" onClick={async () => {
            setResultadoAccion(null)
            await agregarProductos()
            setResultadoAccion('✅ Productos agregados al evento')
          }}>Agregar</button>
          <button className="btn-orden" onClick={async () => {
            setResultadoAccion(null)
            await removerProductos()
            setResultadoAccion('✅ Productos removidos del evento')
          }} style={{ background: '#fee2e2', color: '#b91c1c' }}>Remover</button>
          <button 
            className="btn-orden" 
            onClick={async () => {
              if (!slugSeleccionado) return alert('Selecciona un evento')
              const ids = productosInput.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
              const porcentaje = discountPct
              if (ids.length === 0) return alert('Ingresa al menos un ml_id para aplicar descuento ahora, o agrega primero y aplica luego a todos')
              const res = await fetch(`${(import.meta as any).env?.VITE_BACKEND_URL || 'https://poppy-shop-production.up.railway.app'}/api/descuentos/aplicar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
                body: JSON.stringify({ product_ids: ids, porcentaje, fecha_fin: eventos.find(e => e.slug===slugSeleccionado)?.fecha_fin })
              })
              if (!res.ok) {
                const txt = await res.text()
                setResultadoAccion(`❌ Error aplicando descuento: ${txt}`)
                return
              }
              const data = await res.json()
              const ok = (data.resultados || []).filter((r: any) => r.success).length
              const fail = (data.resultados || []).filter((r: any) => !r.success).length
              setResultadoAccion(`✅ Descuento aplicado a ingresados: ${ok} ok, ${fail} fallidos`)
            }}
            style={{ background: '#ecfdf5', color: '#065f46' }}
          >Aplicar descuento a ingresados</button>
          <button 
            className="btn-orden" 
            onClick={async () => {
              if (!slugSeleccionado) return alert('Selecciona un evento')
              const ev = eventos.find(e => e.slug === slugSeleccionado)
              const idsSeleccionados = productosEvento.filter(p => p.selected).map(p => p.ml_id)
              const ids = (idsSeleccionados.length > 0 ? idsSeleccionados : (ev?.productos_ml_ids || []))
              if (ids.length === 0) return alert('Este evento no tiene productos asociados')
              const porcentaje = discountPct
              const res = await fetch(`${(import.meta as any).env?.VITE_BACKEND_URL || 'https://poppy-shop-production.up.railway.app'}/api/descuentos/aplicar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
                body: JSON.stringify({ product_ids: ids, porcentaje, fecha_fin: ev?.fecha_fin })
              })
              if (!res.ok) {
                const txt = await res.text()
                setResultadoAccion(`❌ Error aplicando descuento al evento: ${txt}`)
                return
              }
              const data = await res.json()
              const ok = (data.resultados || []).filter((r: any) => r.success).length
              const fail = (data.resultados || []).filter((r: any) => !r.success).length
              setResultadoAccion(`✅ Descuento aplicado al evento: ${ok} ok, ${fail} fallidos`)
            }}
            style={{ background: '#ecfdf5', color: '#065f46' }}
          >Aplicar descuento a evento</button>
          <button 
            className="btn-orden" 
            onClick={async () => {
              if (!slugSeleccionado) return alert('Selecciona un evento')
              const ev = eventos.find(e => e.slug === slugSeleccionado)
              const idsSeleccionados = productosEvento.filter(p => p.selected).map(p => p.ml_id)
              const ids = (idsSeleccionados.length > 0 ? idsSeleccionados : (ev?.productos_ml_ids || []))
              if (ids.length === 0) return alert('Este evento no tiene productos asociados')
              const res = await fetch(`${(import.meta as any).env?.VITE_BACKEND_URL || 'https://poppy-shop-production.up.railway.app'}/api/descuentos/quitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
                body: JSON.stringify({ product_ids: ids })
              })
              if (!res.ok) {
                const txt = await res.text()
                setResultadoAccion(`❌ Error quitando descuento del evento: ${txt}`)
                return
              }
              const data = await res.json()
              const ok = (data.resultados || []).filter((r: any) => r.success).length
              const fail = (data.resultados || []).filter((r: any) => !r.success).length
              setResultadoAccion(`✅ Quitar descuento: ${ok} ok, ${fail} fallidos`)
            }}
            style={{ background: '#fee2e2', color: '#b91c1c' }}
          >Quitar descuento del evento</button>
          <button 
            className="btn-orden" 
            onClick={async () => {
              if (!slugSeleccionado) return alert('Selecciona un evento')
              const ev = eventos.find(e => e.slug === slugSeleccionado)
              const idsSeleccionados = productosEvento.filter(p => p.selected).map(p => p.ml_id)
              const ids = (idsSeleccionados.length > 0 ? idsSeleccionados : (ev?.productos_ml_ids || []))
              if (ids.length === 0) return alert('Este evento no tiene productos asociados')
              const res = await fetch(`${(import.meta as any).env?.VITE_BACKEND_URL || 'https://poppy-shop-production.up.railway.app'}/api/descuentos/reparar-ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...AuthService.getAuthHeader() },
                body: JSON.stringify({ product_ids: ids })
              })
              if (!res.ok) {
                const txt = await res.text()
                setResultadoAccion(`❌ Error reparando descuentos: ${txt}`)
                return
              }
              const data = await res.json()
              setResultadoAccion(`🔧 Reparación: ${data.reparados} reparados, ${data.yaCorrectos} ya correctos`)
            }}
          >Reparar descuentos del evento</button>
        </div>

        {resultadoAccion && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#f3f4f6' }}>
            {resultadoAccion}
          </div>
        )}

        {eventoSeleccionado && (
          <div style={{ marginTop: 20 }}>
            <h3>Productos actuales de {eventoSeleccionado.titulo}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(eventoSeleccionado.productos_ml_ids || []).map(id => (
                <span key={id} className="badge" style={{ background: '#eef2ff', color: '#3730a3' }}>{id}</span>
              ))}
            </div>
          </div>
        )}
      </section>
      )}
    </main>
  )
}

export default AdminEventos


