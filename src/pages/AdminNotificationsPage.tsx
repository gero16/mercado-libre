import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'
import { parseNotificationSegments, NotificationSegment } from '../utils/notifications'

const SUPER_ADMIN_EMAIL = 'geronicola1696@gmail.com'

const AdminNotificationsPage: React.FC = () => {
  const { isAuthenticated, user, token } = useAuth() as any
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isSuperAdmin = Boolean(user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())

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

  const deleteNotification = async (id: string) => {
    if (!isSuperAdmin) return
    try {
      setDeletingId(id)
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/${id}?_ts=${Date.now()}`, { method: 'DELETE', headers, cache: 'no-store' })
      if (!res.ok) throw new Error('Error eliminando notificación')
      setItems(prev => prev.filter(n => n._id !== id))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (error) {
      // silencioso
    } finally {
      setDeletingId(null)
    }
  }

  const markAllRead = async () => {
    const unreadIds = items.filter(n => n.status === 'unread').map(n => n._id)
    if (unreadIds.length === 0) return
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    
    await Promise.all(unreadIds.map(id => 
      fetch(`${API_BASE_URL}/api/admin/notifications/${id}/read`, { method: 'PATCH', headers })
    ))
    setItems(prev => prev.map(n => ({ ...n, status: 'read' })))
  }

  useEffect(() => { fetchData(1) }, [])

  if (!isAuthenticated || user?.rol !== 'admin') {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        color: '#ef4444',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        No autorizado
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      order: '📦',
      payment: '💳',
      refund: '↩️',
      error: '⚠️',
      success: '✅',
      info: 'ℹ️'
    }
    return icons[type] || '🔔'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      order: '#3b82f6',
      payment: '#10b981',
      refund: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#6366f1'
    }
    return colors[type] || '#6b7280'
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredItems = items.filter(item => {
    if (filter === 'unread' && item.status !== 'unread') return false
    if (filter === 'read' && item.status !== 'read') return false
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    return true
  })

  const unreadCount = items.filter(n => n.status === 'unread').length
  const types = Array.from(new Set(items.map(n => n.type).filter(Boolean)))

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="container" style={{ marginTop: 50, padding: '20px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🔔 Notificaciones
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Total: {total} notificación{total !== 1 ? 'es' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)'
              }}
            >
              Marcar todas como leídas
            </button>
          )}
          <button
            onClick={() => fetchData(page)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#059669'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#10b981'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            {loading ? '⏳' : '🔄'} Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Estado:</span>
          {(['all', 'unread', 'read'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === f ? '#3b82f6' : '#f3f4f6',
                color: filter === f ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'Todas' : f === 'unread' ? 'No leídas' : 'Leídas'}
            </button>
          ))}
        </div>
        {types.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">Todos</option>
              {types.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        {loading && items.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
            <div>Cargando notificaciones...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Sin notificaciones</div>
            <div style={{ fontSize: '14px' }}>
              {filter !== 'all' || typeFilter !== 'all' 
                ? 'No hay notificaciones que coincidan con los filtros seleccionados'
                : 'No hay notificaciones en este momento'}
            </div>
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(250px, 400px) 160px 160px 180px 160px',
              gap: '16px',
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '12.5px',
              color: '#1f2937',
              textTransform: 'none',
              letterSpacing: '0.2px'
            }}>
              <div style={{ width: '40px' }}></div>
              <div>Mensaje</div>
              <div>Orden / Pago</div>
              <div>Cliente</div>
              <div>Fecha</div>
              <div style={{ textAlign: 'right' }}>Acciones</div>
            </div>

            {/* Items */}
            {filteredItems.map((n, idx) => {
              const messageSegments = parseNotificationSegments(n?.message)
              const segmentsToDisplay: NotificationSegment[] = messageSegments.length
                ? messageSegments
                : [{ value: n?.message || 'Notificación', isPrimary: true, label: undefined }]

              return (
                <div
                  key={n._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(250px, 400px) 160px 160px 180px 160px',
                    gap: '16px',
                    padding: '16px 20px',
                    borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none',
                    backgroundColor: n.status === 'unread' ? '#f8fafc' : 'white',
                    borderLeft: n.status === 'unread' ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s',
                    position: 'relative',
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (n.status === 'read') {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (n.status === 'read') {
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                >
                {/* Icono */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: `${getTypeColor(n.type)}15`,
                  fontSize: '20px'
                }}>
                  {getTypeIcon(n.type)}
                </div>

                {/* Mensaje */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {segmentsToDisplay.map((segment, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          fontSize: segment.isPrimary ? '15px' : '13px',
                          fontWeight: segment.isPrimary ? 600 : 500,
                          color: segment.isPrimary ? '#111827' : '#475569',
                          lineHeight: 1.5,
                          wordBreak: 'break-word'
                        }}
                      >
                        {segment.label ? (
                          <span style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '11px',
                            letterSpacing: '0.4px',
                            textTransform: 'uppercase',
                            minWidth: 'max-content'
                          }}>
                            {segment.label}
                          </span>
                        ) : null}
                        <span style={{ flex: 1, color: segment.label ? '#1f2937' : segment.isPrimary ? '#111827' : '#475569' }}>
                          {segment.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {n.type && (
                      <span style={{
                        backgroundColor: `${getTypeColor(n.type)}15`,
                        color: getTypeColor(n.type),
                        borderRadius: '999px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        {n.type}
                      </span>
                    )}
                    {n.status === 'unread' && (
                      <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '999px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.3px'
                      }}>
                        Nueva
                      </span>
                    )}
                    {n.total && (
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        borderRadius: '999px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ${n.total} {n.currency || ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Orden / Pago */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  {n.order_id && (
                    <div>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Orden:</span>{' '}
                      <span style={{ fontFamily: 'SFMono-Regular,Menlo,monospace', fontWeight: 600, color: '#2563eb' }}>{n.order_id}</span>
                    </div>
                  )}
                  {n.payment_id && (
                    <div>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Pago:</span>{' '}
                      <span style={{ fontFamily: 'SFMono-Regular,Menlo,monospace', fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>{n.payment_id}</span>
                    </div>
                  )}
                  {!n.order_id && !n.payment_id && <span style={{ color: '#9ca3af' }}>-</span>}
                </div>

                {/* Cliente */}
                <div style={{ 
                  fontSize: '13px',
                  color: '#6b7280',
                  wordBreak: 'break-word'
                }}>
                  {n.customer_email ? (
                    <a
                      href={`mailto:${n.customer_email}`}
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.textDecoration = 'underline'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.textDecoration = 'none'
                      }}
                    >
                      {n.customer_email}
                    </a>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                  )}
                </div>

                {/* Fecha */}
                <div style={{ 
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                    {formatDate(n.createdAt)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                    {new Date(n.createdAt).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {n.status === 'unread' && (
                    <button
                      onClick={() => markRead(n._id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#4f46e5'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#6366f1'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      ✓ Marcar como leída
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => deleteNotification(n._id)}
                      disabled={deletingId === n._id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: deletingId === n._id ? '#f87171' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: deletingId === n._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (deletingId !== n._id) {
                          e.currentTarget.style.backgroundColor = '#dc2626'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (deletingId !== n._id) {
                          e.currentTarget.style.backgroundColor = '#ef4444'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {deletingId === n._id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </div>
            )})}
          </>
        )}
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = page - 1
              setPage(newPage)
              fetchData(newPage)
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: page <= 1 ? '#e5e7eb' : '#3b82f6',
              color: page <= 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (page > 1) {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseOut={(e) => {
              if (page > 1) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            ← Anterior
          </button>
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151'
          }}>
            Página {page} de {pages}
          </div>
          <button
            disabled={page >= pages || loading}
            onClick={() => {
              const newPage = page + 1
              setPage(newPage)
              fetchData(newPage)
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: page >= pages ? '#e5e7eb' : '#3b82f6',
              color: page >= pages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: page >= pages ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (page < pages) {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseOut={(e) => {
              if (page < pages) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminNotificationsPage
