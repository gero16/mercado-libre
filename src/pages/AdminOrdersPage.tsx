import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// import '../css/admin.css'
import '../css/admin-clean.css'

// Interfaz para las órdenes
interface Orden {
  _id: string;
  orden_id: string;
  external_reference: string;
  numero_orden?: string;
  payment_id: string;
  payment_status: string;
  payment_status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  installments: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  items: Array<{
    product_id: string;
    ml_id?: string; // ID de MercadoLibre
    sku?: string; // SKU del producto
    product_name: string;
    variant_id?: string;
    color?: string;
    size?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
  date_created: string;
  date_approved?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  mp_error?: any;
}

// Mapeo legible de motivos de rechazo de MP
function mapMpStatusDetail(detail?: string, paymentStatus?: string) {
  const code = (detail || '').toLowerCase();
  const status = (paymentStatus || '').toLowerCase();
  
  // Si el pago está aprobado, mostrar información positiva
  if (status === 'approved' && code === 'accredited') {
    return { titulo: 'Pago acreditado', mensaje: 'El pago fue procesado exitosamente.', accion: 'Pago completado correctamente.' };
  }
  
  // Si el pago está pendiente
  if (status === 'pending') {
    switch (code) {
      case 'preference_created':
        return { titulo: '⚠️ Preferencia creada (no es un pago real)', mensaje: 'Esta orden fue creada cuando el cliente fue redirigido a Mercado Pago. Aún no se ha realizado ningún pago. La orden se actualizará automáticamente cuando el cliente complete el pago.', accion: 'Esperar a que el cliente complete el pago en Mercado Pago.' };
      case 'pending_contingency':
        return { titulo: 'Pago en revisión automática', mensaje: 'El pago está siendo revisado automáticamente por Mercado Pago. Esto es común en pagos en cuotas o montos altos.', accion: 'Esperar confirmación (generalmente se resuelve en minutos).' };
      case 'pending_review_manual':
        return { titulo: 'Revisión manual requerida', mensaje: 'El pago requiere revisión manual por parte de Mercado Pago. Esto puede tomar más tiempo.', accion: 'Esperar confirmación (puede tardar horas o días).' };
      case 'pending_waiting_payment':
        return { titulo: 'Esperando confirmación de pago', mensaje: 'El pago fue procesado pero está esperando confirmación del banco o método de pago.', accion: 'Esperar confirmación del banco.' };
      case 'pending_waiting_transfer':
        return { titulo: 'Esperando transferencia', mensaje: 'El pago está esperando que se complete una transferencia bancaria.', accion: 'Esperar a que se complete la transferencia.' };
      case 'pending_capture':
        return { titulo: 'Pendiente de captura', mensaje: 'El pago fue autorizado pero requiere captura manual.', accion: 'Capturar el pago desde el panel de Mercado Pago.' };
      default:
        return { titulo: 'Pago pendiente', mensaje: `El pago está pendiente de confirmación. Detalle: ${code || 'desconocido'}.`, accion: 'Esperar confirmación de Mercado Pago.' };
    }
  }
  
  // Casos de rechazo
  switch (code) {
    case 'cc_rejected_insufficient_amount':
      return { titulo: 'Fondos insuficientes', mensaje: 'La tarjeta no tenía saldo suficiente.', accion: 'Pedir otro medio de pago o intentar más tarde.' };
    case 'cc_rejected_high_risk':
      return { titulo: 'Pago con riesgo alto', mensaje: 'Mercado Pago rechazó por política de riesgo.', accion: 'Sugerir otro medio de pago o contactar a MP.' };
    case 'cc_rejected_call_for_authorize':
      return { titulo: 'Autorizar con el banco', mensaje: 'El banco solicita autorización del pago.', accion: 'Pedir al cliente llamar al emisor y reintentar.' };
    case 'cc_rejected_bad_filled_card_number':
    case 'cc_rejected_bad_filled_date':
    case 'cc_rejected_bad_filled_other':
    case 'cc_rejected_bad_filled_security_code':
      return { titulo: 'Datos de tarjeta inválidos', mensaje: 'Algún dato de la tarjeta es incorrecto.', accion: 'Revisar número, fecha y código de seguridad.' };
    case 'cc_rejected_blacklist':
      return { titulo: 'Tarjeta en lista de bloqueo', mensaje: 'El medio de pago está bloqueado.', accion: 'Usar otro medio de pago.' };
    case 'cc_rejected_card_disabled':
      return { titulo: 'Tarjeta deshabilitada', mensaje: 'La tarjeta está inactiva o bloqueada.', accion: 'Pedir al cliente habilitarla con el banco.' };
    case 'cc_rejected_invalid_installments':
      return { titulo: 'Cuotas inválidas', mensaje: 'El plan de cuotas no es válido.', accion: 'Elegir otro plan o pagar en 1 cuota.' };
    case 'cc_rejected_max_attempts':
      return { titulo: 'Demasiados intentos', mensaje: 'Se superó el máximo de intentos de pago.', accion: 'Esperar un tiempo o usar otro medio.' };
    case 'cc_rejected_other_reason':
      return { titulo: 'Pago rechazado', mensaje: 'El banco rechazó el pago por un motivo general.', accion: 'Probar otra tarjeta o contactar al banco.' };
    default:
      // Solo mostrar "Error de pago" si realmente es un error (rejected o cancelled)
      if (status === 'rejected' || status === 'cancelled') {
        return { titulo: 'Error de pago', mensaje: 'No se pudo procesar el pago.', accion: 'Reintentar u optar por otro medio.' };
      }
      return { titulo: 'Estado del pago', mensaje: `Estado: ${status || 'desconocido'}`, accion: 'Revisar el estado del pago.' };
  }
}

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showMpHelp, setShowMpHelp] = useState(false)

  const API_BASE_URL = 'https://poppy-shop-production.up.railway.app'

  // Fetch órdenes desde el backend
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/orders?page=${currentPage}&limit=20`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setTotalOrders(data.total || 0)
      } else {
        setError(data.error || 'Error al cargar las órdenes')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Error de conexión al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  // Filtrar órdenes localmente
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orden_id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount)
  }

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'approved'
      case 'pending': return 'pending'
      case 'rejected': return 'rejected'
      case 'cancelled': return 'cancelled'
      default: return 'pending'
    }
  }

  // Calcular estadísticas
  const stats = {
    total: totalOrders,
    approved: orders.filter(o => o.status === 'approved').length,
    pending: orders.filter(o => o.status === 'pending').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    totalAmount: orders.reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>Administración de Órdenes</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/admin')}
        >
          ← Volver al Admin
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Órdenes</h3>
          <span className="stat-number">{stats.total}</span>
        </div>
        <div className="stat-card">
          <h3>Órdenes Aprobadas</h3>
          <span className="stat-number active">{stats.approved}</span>
        </div>
        <div className="stat-card">
          <h3>Órdenes Pendientes</h3>
          <span className="stat-number inactive">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <h3>Órdenes Rechazadas</h3>
          <span className="stat-number inactive">{stats.rejected}</span>
        </div>
        <div className="stat-card">
          <h3>Total Facturado</h3>
          <span className="stat-number">{formatCurrency(stats.totalAmount)}</span>
        </div>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="admin-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por cliente, email o ID de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-select"
          >
            <option value="all">Todos los estados</option>
            <option value="approved">Aprobadas</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
        
        <div className="sort-section">
          <span style={{ color: '#8b949e', fontSize: '14px' }}>
            Mostrando {filteredOrders.length} de {totalOrders} órdenes
          </span>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="admin-content">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
            Cargando órdenes...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#f85149' }}>
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
            No se encontraron órdenes con los filtros aplicados
          </div>
        ) : (
          <div className="admin-grid">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="admin-card"
                style={{
                  borderLeft: `4px solid ${
                    order.status === 'approved' ? '#3fb950' :
                    order.status === 'pending' ? '#d29922' :
                    order.status === 'rejected' ? '#f85149' :
                    '#8b949e'
                  }`,
                  marginBottom: '20px'
                }}
              >
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: '#f0f6fc', margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                      📦 Orden #{order.numero_orden || order.orden_id}
                    </h3>
                    <span 
                      className={`status-badge ${getStatusColor(order.status)}`}
                      style={{
                        // Destacar si es solo una preferencia creada
                        backgroundColor: order.payment_status_detail === 'preference_created' ? 'rgba(210, 153, 34, 0.15)' : undefined,
                        border: order.payment_status_detail === 'preference_created' ? '1px solid rgba(210, 153, 34, 0.3)' : undefined
                      }}
                    >
                      {order.payment_status_detail === 'preference_created' ? '🔗 ' :
                       order.status === 'approved' ? '✓ ' : 
                       order.status === 'pending' ? '⏳ ' :
                       order.status === 'rejected' ? '✗ ' : ''}
                      {order.payment_status_detail === 'preference_created' ? 'PREFERENCIA' : order.status.toUpperCase()}
                    </span>
                  </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginTop: 8 }}>
                      {(() => { const info = mapMpStatusDetail(order.payment_status_detail, order.payment_status); return (
                        <span style={{ fontSize: 12, color:'#8b949e' }}>
                          Estado MP: <strong style={{ color:'#c9d1d9' }}>{info.titulo}</strong>
                        </span>
                      )})()}
                      <span style={{ fontSize: 12, color:'#8b949e' }}>Pago ID: <strong style={{ color:'#c9d1d9' }}>{order.payment_id || '—'}</strong></span>
                      <button 
                        className="back-button"
                        style={{ marginLeft:'auto' }}
                        onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                      >
                        {expandedId === order._id ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                    </div>
                  
                  <div style={{ 
                    background: 'rgba(22, 27, 34, 0.5)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ color: '#c9d1d9', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                      👤 {order.customer.name}
                    </div>
                    <div style={{ color: '#8b949e', fontSize: '13px', marginBottom: '4px' }}>
                      ✉️ {order.customer.email}
                    </div>
                    <div style={{ color: '#8b949e', fontSize: '13px' }}>
                      📞 {order.customer.phone}
                    </div>
                  </div>
                </div>

                  {expandedId === order._id && (
                    <div style={{ 
                      background: 'rgba(110, 118, 129, 0.1)',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 12,
                      color: '#c9d1d9'
                    }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12, color:'#8b949e' }}>Notas</div>
                          <div style={{ fontSize:13 }}>{order.notes || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12, color:'#8b949e' }}>Referencia externa</div>
                          <div style={{ fontSize:13 }}>{order.external_reference}</div>
                        </div>
                      </div>
                      {order.payment_status_detail && (() => { const info = mapMpStatusDetail(order.payment_status_detail, order.payment_status); return (
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontWeight:700, fontSize:12, color:'#8b949e', marginBottom:4 }}>
                            {order.payment_status === 'pending' ? 'Información del estado pendiente' : 
                             order.payment_status === 'rejected' || order.payment_status === 'cancelled' ? 'Explicación del rechazo' : 
                             'Detalles del estado'}
                          </div>
                          <div style={{ fontSize:13 }}>
                            <div style={{ marginBottom:4 }}>{info.mensaje}</div>
                            <div style={{ color:'#9ca3af', fontSize:12 }}>Sugerencia: {info.accion}</div>
                          </div>
                          {(order.payment_status === 'rejected' || order.payment_status === 'cancelled') && (
                            <button 
                              className="back-button"
                              style={{ marginTop:8 }}
                              onClick={() => setShowMpHelp(v => !v)}
                            >
                              {showMpHelp ? 'Ocultar ayuda' : '¿Por qué fue rechazado?'}
                            </button>
                          )}
                          {showMpHelp && (
                            <div style={{
                              marginTop:8,
                              background:'rgba(22,27,34,0.4)',
                              border:'1px solid #30363d',
                              borderRadius:6,
                              padding:10,
                              color:'#c9d1d9',
                              fontSize:12,
                              lineHeight:1.5
                            }}>
                              <div style={{ fontWeight:700, marginBottom:6 }}>Motivos frecuentes de rechazo</div>
                              <ul style={{ margin:'0 0 6px 16px', padding:0 }}>
                                <li><strong>Fondos insuficientes</strong>: pedir otro medio o reintentar más tarde.</li>
                                <li><strong>Pago con riesgo alto</strong>: probar otra tarjeta o medio (débito, MP).</li>
                                <li><strong>Autorizar con el banco</strong>: el cliente debe llamar a su emisor.</li>
                                <li><strong>Datos mal cargados</strong>: revisar número, fecha y código de seguridad.</li>
                                <li><strong>Tarjeta deshabilitada/bloqueada</strong>: habilitar con el banco o usar otra.</li>
                                <li><strong>Cuotas inválidas</strong>: elegir otro plan o 1 cuota.</li>
                                <li><strong>Demasiados intentos</strong>: esperar unos minutos y reintentar.</li>
                                <li><strong>Otro motivo del banco</strong>: probar otro medio o contactar al banco.</li>
                              </ul>
                              <div style={{ color:'#9ca3af' }}>Si persiste, intenta con otro navegador/PC o paga con cuenta MP.</div>
                            </div>
                          )}
                        </div>
                      )})()}
                      {order.mp_error && (
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontWeight:700, fontSize:12, color:'#8b949e', marginBottom:6 }}>Detalle de error MP</div>
                          <pre style={{ 
                            background:'#0b1220', 
                            color:'#e5e7eb', 
                            padding:10, 
                            borderRadius:6, 
                            maxHeight:200, 
                            overflow:'auto', 
                            fontSize:12, 
                            lineHeight:1.4,
                            border:'1px solid #1f2937' 
                          }}>{JSON.stringify(order.mp_error, null, 2)}</pre>
                        </div>
                      )}
                      {/** mp_request visible si existe */}
                      {(order as any).mp_request && (
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontWeight:700, fontSize:12, color:'#8b949e', marginBottom:6 }}>Solicitud enviada a MP</div>
                          <pre style={{ 
                            background:'#0b1220', 
                            color:'#e5e7eb', 
                            padding:10, 
                            borderRadius:6, 
                            maxHeight:200, 
                            overflow:'auto', 
                            fontSize:12, 
                            lineHeight:1.4,
                            border:'1px solid #1f2937' 
                          }}>{JSON.stringify((order as any).mp_request, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ 
                    color: '#f0f6fc', 
                    fontSize: '13px', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    🛒 Productos:
                  </div>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ 
                      fontSize: '13px',
                      marginBottom: '8px',
                      padding: '8px 12px',
                      background: 'rgba(110, 118, 129, 0.1)',
                      borderRadius: '4px',
                      color: '#c9d1d9'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '500' }}>
                          <span style={{ 
                            background: 'rgba(56, 139, 253, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginRight: '8px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {item.quantity}x
                          </span>
                          {item.product_name}
                          {item.color && <span style={{ color: '#8b949e', fontSize: '12px' }}> ({item.color})</span>}
                          {item.size && <span style={{ color: '#8b949e', fontSize: '12px' }}> - Talle {item.size}</span>}
                        </span>
                        <span style={{ fontWeight: '700', color: '#58a6ff' }}>{formatCurrency(item.total_price)}</span>
                      </div>
                      {(item.ml_id || item.sku) && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px',
                          fontSize: '11px',
                          color: '#8b949e',
                          marginTop: '4px',
                          paddingTop: '4px',
                          borderTop: '1px solid rgba(110, 118, 129, 0.2)'
                        }}>
                          {item.ml_id && (
                            <span>
                              <strong style={{ color: '#7c3aed' }}>ML ID:</strong> {item.ml_id}
                            </span>
                          )}
                          {item.sku && (
                            <span>
                              <strong style={{ color: '#059669' }}>SKU:</strong> {item.sku}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  borderTop: '2px solid #30363d', 
                  paddingTop: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(22, 27, 34, 0.3)',
                  margin: '0 -20px -20px -20px',
                  padding: '15px 20px'
                }}>
                  <div>
                    <div style={{ color: '#c9d1d9', fontSize: '12px', marginBottom: '4px' }}>
                      📅 {formatDate(order.date_created)}
                    </div>
                    <div style={{ 
                      color: '#8b949e', 
                      fontSize: '11px',
                      background: 'rgba(56, 139, 253, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      💳 {order.payment_method_id.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: '#f0f6fc', 
                      fontSize: '1.4rem', 
                      fontWeight: '800',
                      background: order.status === 'approved' 
                        ? 'linear-gradient(135deg, #3fb950 0%, #2ea043 100%)'
                        : order.status === 'pending'
                        ? 'linear-gradient(135deg, #d29922 0%, #bb8009 100%)'
                        : 'linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {formatCurrency(order.total)}
                    </div>
                    <div style={{ 
                      color: '#8b949e', 
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {order.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Anterior
            </button>
            
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminOrdersPage
