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
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {order.status === 'approved' ? '✓ ' : 
                       order.status === 'pending' ? '⏳ ' :
                       order.status === 'rejected' ? '✗ ' : ''}
                      {order.status.toUpperCase()}
                    </span>
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
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '13px',
                      marginBottom: '6px',
                      padding: '6px 10px',
                      background: 'rgba(110, 118, 129, 0.1)',
                      borderRadius: '4px',
                      color: '#c9d1d9'
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
