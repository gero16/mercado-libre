import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { AuthService } from '../services/auth'
import type { ProductoML } from '../types'

interface AdminDestacadosItem {
  _id?: string
  ml_id?: string
  title: string
  price: number
  available_quantity?: number
  status?: string
  images?: Array<{ url: string }>
  main_image?: string
  destacado?: boolean
}

const AdminDestacados: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<AdminDestacadosItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [results, setResults] = useState<AdminDestacadosItem[]>([])
  const [working, setWorking] = useState(false)

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/ml/productos?destacado=true&status=all&limit=250`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        const data = await res.json()
        const items: AdminDestacadosItem[] = Array.isArray(data) ? data : (data.productos || data.items || [])
        setFeatured(items)
      } catch (e) {
        console.error('[AdminDestacados] Error cargando destacados:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const doSearch = async (q: string) => {
    const term = q.trim()
    if (!term) {
      setResults([])
      return
    }
    try {
      setSearchLoading(true)
      const params = new URLSearchParams({ limit: '50', offset: '0', q: term, status: 'all' })
      const res = await fetch(`${API_BASE_URL}/ml/productos?${params.toString()}`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
      const data = await res.json()
      const items: AdminDestacadosItem[] = Array.isArray(data) ? data : (data.productos || data.items || [])
      setResults(items)
    } catch (e) {
      console.error('[AdminDestacados] Error en búsqueda:', e)
    } finally {
      setSearchLoading(false)
    }
  }

  const toggleDestacado = async (item: AdminDestacadosItem, nuevoEstado: boolean) => {
    try {
      setWorking(true)
      const token = AuthService.getToken() || ''
      const idForPublicEndpoint = (item as any)._id || (item as any).id || item.ml_id
      const url = token
        ? `${API_BASE_URL}/ml/productos/${item.ml_id}/destacado`
        : `${API_BASE_URL}/ml/productos/${idForPublicEndpoint}/destacado`
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ destacado: nuevoEstado })
      })
      if (!res.ok) {
        const err = await (async () => { try { return await res.json() } catch { return null } })()
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      // Refrescar listas en memoria
      setFeatured(prev => {
        const exists = prev.some(p => p.ml_id === item.ml_id)
        if (nuevoEstado) {
          return exists ? prev.map(p => p.ml_id === item.ml_id ? { ...p, destacado: true } : p) : [{ ...item, destacado: true }, ...prev]
        }
        return prev.filter(p => p.ml_id !== item.ml_id)
      })
      setResults(prev => prev.map(p => p.ml_id === item.ml_id ? { ...p, destacado: nuevoEstado } : p))
      alert(`Producto ${nuevoEstado ? 'marcado' : 'desmarcado'} como destacado`)
    } catch (e: any) {
      console.error('[AdminDestacados] toggle error', e)
      alert(e?.message || 'Error al actualizar destacado')
    } finally {
      setWorking(false)
    }
  }

  const marcarTodosResultados = async (estado: boolean) => {
    if (results.length === 0) return
    try {
      setWorking(true)
      const token = AuthService.getToken() || ''
      if (token) {
        const ml_ids = results.map(r => r.ml_id!).filter(Boolean)
        const res = await fetch(`${API_BASE_URL}/ml/productos/destacado/batch`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ml_ids, destacado: estado })
        })
        if (!res.ok) throw new Error('Error actualizando destacados (batch)')
        setFeatured(prev => estado ? [...results, ...prev].filter((v, i, a) => a.findIndex(x => x.ml_id === v.ml_id) === i) : prev.filter(f => !results.some(r => r.ml_id === f.ml_id)))
        setResults(prev => prev.map(p => ({ ...p, destacado: estado })))
      } else {
        // Fallback: llamadas individuales públicas
        for (const r of results) {
          const idForPublicEndpoint = (r as any)._id || (r as any).id || r.ml_id
          await fetch(`${API_BASE_URL}/ml/productos/${idForPublicEndpoint}/destacado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destacado: estado })
          })
        }
        setFeatured(prev => estado ? [...results, ...prev].filter((v, i, a) => a.findIndex(x => x.ml_id === v.ml_id) === i) : prev.filter(f => !results.some(r => r.ml_id === f.ml_id)))
        setResults(prev => prev.map(p => ({ ...p, destacado: estado })))
      }
      alert(`Destacados ${estado ? 'marcados' : 'quitados'} en resultados`)
    } catch (e: any) {
      alert(e?.message || 'Error en actualización masiva')
    } finally {
      setWorking(false)
    }
  }

  const currentFeatured = useMemo(() => featured.filter(f => f && f.title), [featured])

  return (
    <main className="container">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Gestionar Productos Destacados</h1>
          <p>Marcá o quitá productos destacados. Podés buscar por título o MLU.</p>
        </div>

        <div className="admin-controls" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-orden volver" onClick={() => navigate('/admin')}>← Volver</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Buscar por título o MLU…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchTerm) }}
              className="admin-search-input"
              style={{ minWidth: 300 }}
            />
            <button className="btn-orden confirmar" onClick={() => doSearch(searchTerm)} disabled={searchLoading}>
              {searchLoading ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-orden" onClick={() => marcarTodosResultados(true)} disabled={working}>Marcar todos</button>
              <button className="btn-orden volver" onClick={() => marcarTodosResultados(false)} disabled={working}>Quitar todos</button>
            </div>
          )}
        </div>

        {/* Lista de resultados de búsqueda */}
        {results.length > 0 && (
          <div className="admin-products-list" style={{ marginTop: 16 }}>
            <h2 style={{ margin: '8px 0 12px 0' }}>Resultados de búsqueda</h2>
            {results.map(item => (
              <div key={(item as any)._id || item.ml_id || item.title} className="admin-product-item">
                <div className="product-image">
                  <img src={(item.images && item.images[0]?.url) || (item as any).main_image || ''} alt={item.title} loading="lazy" decoding="async" />
                </div>
                <div className="product-info">
                  <div className="product-main-info">
                    <h3 className="product-title">{item.title}</h3>
                    <div className="product-badges">
                      {item.destacado ? <span className="badge" style={{ background: '#fbbf24', color: '#111' }}>Destacado</span> : null}
                      {item.status === 'paused' ? <span className="badge badge-paused">Pausado</span> : null}
                    </div>
                  </div>
                  <div className="product-details">
                    <div className="detail-row"><span className="detail-label">Precio:</span><span className="detail-value">US$ {item.price}</span></div>
                    <div className="detail-row"><span className="detail-label">Stock:</span><span className="detail-value">{item.available_quantity ?? '-'}</span></div>
                    <div className="detail-row"><span className="detail-label">MLU:</span><span className="detail-value detail-id">{item.ml_id}</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn-orden" onClick={() => toggleDestacado(item, !item.destacado)} disabled={working}>
                    {item.destacado ? 'Quitar destacado' : 'Marcar destacado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de destacados actuales */}
        <div className="admin-products-list" style={{ marginTop: 24 }}>
          <h2 style={{ margin: '8px 0 12px 0' }}>Actualmente destacados ({currentFeatured.length})</h2>
          {loading ? (
            <p>Cargando…</p>
          ) : currentFeatured.length === 0 ? (
            <div className="no-products"><p>No hay productos destacados.</p></div>
          ) : (
            currentFeatured.map(item => (
              <div key={(item as any)._id || item.ml_id || item.title} className="admin-product-item">
                <div className="product-image">
                  <img src={(item.images && item.images[0]?.url) || (item as any).main_image || ''} alt={item.title} loading="lazy" decoding="async" />
                </div>
                <div className="product-info">
                  <div className="product-main-info">
                    <h3 className="product-title">{item.title}</h3>
                    <div className="product-badges">
                      <span className="badge" style={{ background: '#fbbf24', color: '#111' }}>Destacado</span>
                      {item.status === 'paused' ? <span className="badge badge-paused">Pausado</span> : null}
                    </div>
                  </div>
                  <div className="product-details">
                    <div className="detail-row"><span className="detail-label">Precio:</span><span className="detail-value">US$ {item.price}</span></div>
                    <div className="detail-row"><span className="detail-label">Stock:</span><span className="detail-value">{item.available_quantity ?? '-'}</span></div>
                    <div className="detail-row"><span className="detail-label">MLU:</span><span className="detail-value detail-id">{item.ml_id}</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn-orden volver" onClick={() => toggleDestacado(item, false)} disabled={working}>Quitar destacado</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminDestacados


