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
}

const AdminEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Evento>>({ activo: true })
  const [slugSeleccionado, setSlugSeleccionado] = useState<string>('')
  const [productosInput, setProductosInput] = useState('')
  const [discountPct, setDiscountPct] = useState<number>(10)
  const [resultadoAccion, setResultadoAccion] = useState<string | null>(null)
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
  }

  const removerProductos = async () => {
    if (!slugSeleccionado) return alert('Selecciona un evento')
    const ids = productosInput.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
    if (ids.length === 0) return alert('Ingresa al menos un ml_id')
    await EventService.removeFromEvent(slugSeleccionado, ids, token)
    setProductosInput('')
    await load()
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

  return (
    <main className="container" style={{ padding: '30px 0' }}>
      <h1>Administrar Eventos Especiales</h1>

      {/* Crear evento */}
      <section style={{ marginTop: 20, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
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

      {/* Listado y edición rápida */}
      <section style={{ marginTop: 30 }}>
        <h2>Eventos existentes</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : eventos.length === 0 ? (
          <p>No hay eventos</p>
        ) : (
          <div className="admin-products-list">
            {eventos.map(ev => (
              <div key={ev.slug} className="admin-product-item">
                <div className="product-info">
                  <h3 className="product-title">{ev.titulo} <span style={{ color: '#6b7280' }}>({ev.slug})</span></h3>
                  <div className="product-badges">
                    <span className={`badge ${ev.activo ? 'active' : 'paused'}`}>{ev.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Productos asociados:</span>
                    <span className="detail-value">{ev.productos_ml_ids?.length || 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-orden" onClick={() => setSlugSeleccionado(ev.slug)}>Seleccionar</button>
                  <button className="btn-orden" onClick={() => actualizar(ev.slug, { activo: !ev.activo })}>{ev.activo ? 'Desactivar' : 'Activar'}</button>
                  <button className="btn-orden" onClick={() => eliminar(ev.slug)} style={{ background: '#fee2e2', color: '#b91c1c' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Asociación de productos */}
      <section style={{ marginTop: 30, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
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
              const ids = ev?.productos_ml_ids || []
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
              const ids = ev?.productos_ml_ids || []
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
              const ids = ev?.productos_ml_ids || []
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
    </main>
  )
}

export default AdminEventos


