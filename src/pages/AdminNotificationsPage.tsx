import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

const AdminNotificationsPage: React.FC = () => {
  const { isAuthenticated, user, token } = useAuth() as any
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchData = async (p = page) => {
    try {
      setLoading(true)
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications?page=${p}&pageSize=${pageSize}&_ts=${Date.now()}`, { headers, cache: 'no-store' })
      const data = await res.json()
      setItems(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number(data?.total || 0))
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    await fetch(`${API_BASE_URL}/api/admin/notifications/${id}/read`, { method: 'PATCH', headers })
    setItems(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n))
  }

  useEffect(() => { fetchData(1) }, [])

  if (!isAuthenticated || user?.rol !== 'admin') {
    return <div style={{padding:20}}>No autorizado</div>
  }

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="container" style={{ marginTop: 110 }}>
      <h2>Notificaciones</h2>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0' }}>
        <button className="btn-orden" onClick={() => fetchData(page)} disabled={loading}>Actualizar</button>
        <span>Total: {total}</span>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 180px 140px 140px', gap: 8, background: '#f8fafc', padding: '10px 12px', fontWeight: 700 }}>
          <div>Mensaje</div>
          <div>Tipo</div>
          <div>Orden / Pago</div>
          <div>Cliente</div>
          <div>Fecha</div>
        </div>
        {items.map(n => (
          <div key={n._id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 180px 140px 140px', gap: 8, padding: '10px 12px', borderTop: '1px solid #f1f5f9', background: n.status === 'unread' ? '#fff7ed' : '#fff' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{n.message || `${(n.type || 'order').toUpperCase()} ${n.order_id || ''}`}</span>
              {n.total ? <span style={{ color: '#0f766e' }}>${n.total} {n.currency || ''}</span> : null}
              {n.status === 'unread' && (
                <button className="btn-orden" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => markRead(n._id)}>Marcar leída</button>
              )}
            </div>
            <div>{n.type}</div>
            <div>{n.order_id || '-'} {n.payment_id ? ` / ${n.payment_id}` : ''}</div>
            <div>{n.customer_email || '-'}</div>
            <div>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Sin notificaciones</div>
        )}
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <button className="btn-orden" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchData(page - 1) }}>Anterior</button>
          <span>Página {page} de {pages}</span>
          <button className="btn-orden" disabled={page >= pages} onClick={() => { setPage(p => p + 1); fetchData(page + 1) }}>Siguiente</button>
        </div>
      )}
    </div>
  )
}

export default AdminNotificationsPage


