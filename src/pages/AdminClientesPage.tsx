import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductSkeleton from '../components/ProductSkeleton'
import '../css/admin.css'
import '../css/admin-unified.css'

// Interfaz para cliente
interface Cliente {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: {
    calle: string;
    numero: string;
    apartamento?: string;
    codigo_postal: string;
    ciudad: string;
    departamento: string;
    pais: string;
  };
  fecha_registro: string;
  ultima_actividad: string;
  activo: boolean;
  total_compras: number;
  total_gastado: number;
  numero_ordenes: number;
  preferencias: {
    notificaciones_email: boolean;
    notificaciones_sms: boolean;
    newsletter: boolean;
    idioma: string;
  };
}

interface ClientesResponse {
  success: boolean;
  data: {
    clientes: Cliente[];
    total: number;
    paginas: number;
  };
}

interface EstadisticasResponse {
  success: boolean;
  data: {
    totalClientes: number;
    clientesActivos: number;
    clientesInactivos: number;
    totalGastado: number;
    promedioGasto: number;
  };
}

const AdminClientesPage: React.FC = () => {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActivo, setFilterActivo] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterCiudad, setFilterCiudad] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'fecha_registro' | 'total_gastado'>('fecha_registro')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClientes, setTotalClientes] = useState(0)

  const API_BASE_URL = 'https://tienda-virtual-ts-back-production.up.railway.app'

  // Fetch clientes desde el backend
  const fetchClientes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pagina: currentPage.toString(),
        limite: '20',
        ...(filterActivo !== 'all' && { activo: filterActivo === 'active' ? 'true' : 'false' }),
        ...(filterCiudad && { ciudad: filterCiudad }),
        ...(searchTerm && { busqueda: searchTerm })
      })

      const response = await fetch(`${API_BASE_URL}/api/clientes?${params}`)
      const data: ClientesResponse = await response.json()
      
      if (data.success) {
        setClientes(data.data.clientes)
        setTotalPages(data.data.paginas)
        setTotalClientes(data.data.total)
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch estadísticas
  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/estadisticas`)
      const data: EstadisticasResponse = await response.json()
      
      if (data.success) {
        setEstadisticas(data.data)
      }
    } catch (error) {
      console.error('Error fetching estadísticas:', error)
    }
  }

  useEffect(() => {
    fetchClientes()
    fetchEstadisticas()
  }, [currentPage, filterActivo, filterCiudad, searchTerm])

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

  // Función para obtener nombre completo
  const getNombreCompleto = (cliente: Cliente) => {
    return `${cliente.nombre} ${cliente.apellido}`
  }

  // Función para obtener dirección completa
  const getDireccionCompleta = (cliente: Cliente) => {
    const { direccion } = cliente
    return `${direccion.calle} ${direccion.numero}${direccion.apartamento ? `, ${direccion.apartamento}` : ''}, ${direccion.ciudad}, ${direccion.departamento}`
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>Administración de Clientes</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/admin')}
        >
          ← Volver al Admin
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Clientes</h3>
            <span className="stat-number">{estadisticas.totalClientes}</span>
          </div>
          <div className="stat-card">
            <h3>Clientes Activos</h3>
            <span className="stat-number active">{estadisticas.clientesActivos}</span>
          </div>
          <div className="stat-card">
            <h3>Clientes Inactivos</h3>
            <span className="stat-number inactive">{estadisticas.clientesInactivos}</span>
          </div>
          <div className="stat-card">
            <h3>Total Gastado</h3>
            <span className="stat-number">{formatCurrency(estadisticas.totalGastado)}</span>
          </div>
          <div className="stat-card">
            <h3>Promedio por Cliente</h3>
            <span className="stat-number">{formatCurrency(estadisticas.promedioGasto)}</span>
          </div>
        </div>
      )}

      {/* Controles de filtrado y búsqueda */}
      <div className="admin-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value as any)}
            className="admin-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          
          <input
            type="text"
            placeholder="Filtrar por ciudad..."
            value={filterCiudad}
            onChange={(e) => setFilterCiudad(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="admin-select"
          >
            <option value="fecha_registro">Ordenar por fecha</option>
            <option value="name">Ordenar por nombre</option>
            <option value="email">Ordenar por email</option>
            <option value="total_gastado">Ordenar por gasto</option>
          </select>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="admin-content">
        <div className="results-info">
          <p>Mostrando {clientes.length} de {totalClientes} clientes</p>
        </div>
        
        <div className="admin-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : clientes.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              color: '#8b949e' 
            }}>
              <p>No se encontraron clientes con los filtros aplicados</p>
            </div>
          ) : (
            clientes.map((cliente) => (
              <div key={cliente._id} className="admin-card">
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: '#f0f6fc', margin: 0, fontSize: '1.1rem' }}>
                      {getNombreCompleto(cliente)}
                    </h3>
                    <span className={`status-badge ${cliente.activo ? 'approved' : 'cancelled'}`}>
                      {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  
                  <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>
                    📧 {cliente.email}
                  </div>
                  
                  <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>
                    📞 {cliente.telefono}
                  </div>
                  
                  <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>
                    📍 {getDireccionCompleta(cliente)}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '8px' }}>
                    ESTADÍSTICAS:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                    <div style={{ color: '#c9d1d9' }}>
                      <span style={{ color: '#8b949e' }}>Compras:</span> {cliente.numero_ordenes}
                    </div>
                    <div style={{ color: '#c9d1d9' }}>
                      <span style={{ color: '#8b949e' }}>Total:</span> {formatCurrency(cliente.total_gastado)}
                    </div>
                    <div style={{ color: '#c9d1d9' }}>
                      <span style={{ color: '#8b949e' }}>Promedio:</span> {formatCurrency(cliente.numero_ordenes > 0 ? cliente.total_gastado / cliente.numero_ordenes : 0)}
                    </div>
                    <div style={{ color: '#c9d1d9' }}>
                      <span style={{ color: '#8b949e' }}>Idioma:</span> {cliente.preferencias.idioma.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '8px' }}>
                    PREFERENCIAS:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {cliente.preferencias.notificaciones_email && (
                      <span style={{ 
                        background: 'rgba(88, 166, 255, 0.2)', 
                        color: '#58a6ff', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        border: '1px solid #58a6ff'
                      }}>
                        Email
                      </span>
                    )}
                    {cliente.preferencias.notificaciones_sms && (
                      <span style={{ 
                        background: 'rgba(88, 166, 255, 0.2)', 
                        color: '#58a6ff', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        border: '1px solid #58a6ff'
                      }}>
                        SMS
                      </span>
                    )}
                    {cliente.preferencias.newsletter && (
                      <span style={{ 
                        background: 'rgba(88, 166, 255, 0.2)', 
                        color: '#58a6ff', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        border: '1px solid #58a6ff'
                      }}>
                        Newsletter
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ 
                  borderTop: '1px solid #30363d', 
                  paddingTop: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>
                      Registrado: {formatDate(cliente.fecha_registro)}
                    </div>
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>
                      Última actividad: {formatDate(cliente.ultima_actividad)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #58a6ff, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {getNombreCompleto(cliente).charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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

export default AdminClientesPage
