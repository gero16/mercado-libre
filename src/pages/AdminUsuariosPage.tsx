import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductSkeleton from '../components/ProductSkeleton'
import '../css/admin-clean.css'
import { AuthService } from '../services/auth'

// Interfaz para usuario
interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'manager' | 'editor' | 'user';
  activo: boolean;
  date_created: string;
  date_updated: string;
}

interface UsuariosResponse {
  success: boolean;
  data: {
    usuarios: Usuario[];
    total: number;
    paginas: number;
  };
}

interface EstadisticasResponse {
  success: boolean;
  data: {
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosInactivos: number;
    usuariosPorRol: {
      admin: number;
      manager: number;
      editor: number;
      user: number;
    };
  };
}

const AdminUsuariosPage: React.FC = () => {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActivo, setFilterActivo] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterRol, setFilterRol] = useState<'all' | 'admin' | 'manager' | 'editor' | 'user'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsuarios, setTotalUsuarios] = useState(0)

  const API_BASE_URL = 'https://poppy-shop-production.up.railway.app'

  // Fetch usuarios desde el backend
  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const token = AuthService.getToken()
      
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const params = new URLSearchParams({
        pagina: currentPage.toString(),
        limite: '20',
        ...(filterActivo !== 'all' && { activo: filterActivo === 'active' ? 'true' : 'false' }),
        ...(filterRol !== 'all' && { rol: filterRol }),
        ...(searchTerm && { busqueda: searchTerm })
      })

      const response = await fetch(`${API_BASE_URL}/api/usuarios?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data: UsuariosResponse = await response.json()
      
      if (data.success) {
        setUsuarios(data.data.usuarios)
        setTotalPages(data.data.paginas)
        setTotalUsuarios(data.data.total)
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch estadísticas
  const fetchEstadisticas = async () => {
    try {
      const token = AuthService.getToken()
      
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/usuarios/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data: EstadisticasResponse = await response.json()
      
      if (data.success) {
        setEstadisticas(data.data)
      }
    } catch (error) {
      console.error('Error fetching estadísticas:', error)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchEstadisticas()
  }, [currentPage, filterActivo, filterRol, searchTerm])

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

  // Función para obtener color del rol
  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return '#dc2626' // Rojo
      case 'manager':
        return '#ea580c' // Naranja
      case 'editor':
        return '#2563eb' // Azul
      case 'user':
        return '#16a34a' // Verde
      default:
        return '#6b7280' // Gris
    }
  }

  // Función para traducir rol
  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gerente'
      case 'editor':
        return 'Editor'
      case 'user':
        return 'Usuario'
      default:
        return rol
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>Administración de Usuarios</h1>
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
            <h3>Total Usuarios</h3>
            <span className="stat-number">{estadisticas.totalUsuarios}</span>
          </div>
          <div className="stat-card">
            <h3>Usuarios Activos</h3>
            <span className="stat-number active">{estadisticas.usuariosActivos}</span>
          </div>
          <div className="stat-card">
            <h3>Usuarios Inactivos</h3>
            <span className="stat-number inactive">{estadisticas.usuariosInactivos}</span>
          </div>
          <div className="stat-card">
            <h3>Administradores</h3>
            <span className="stat-number" style={{ color: '#dc2626' }}>
              {estadisticas.usuariosPorRol.admin}
            </span>
          </div>
          <div className="stat-card">
            <h3>Gerentes</h3>
            <span className="stat-number" style={{ color: '#ea580c' }}>
              {estadisticas.usuariosPorRol.manager}
            </span>
          </div>
          <div className="stat-card">
            <h3>Editores</h3>
            <span className="stat-number" style={{ color: '#2563eb' }}>
              {estadisticas.usuariosPorRol.editor}
            </span>
          </div>
          <div className="stat-card">
            <h3>Usuarios</h3>
            <span className="stat-number" style={{ color: '#16a34a' }}>
              {estadisticas.usuariosPorRol.user}
            </span>
          </div>
        </div>
      )}

      {/* Controles de filtrado y búsqueda */}
      <div className="admin-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value as 'all' | 'active' | 'inactive')}
            className="admin-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="filter-section">
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value as 'all' | 'admin' | 'manager' | 'editor' | 'user')}
            className="admin-select"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="manager">Gerentes</option>
            <option value="editor">Editores</option>
            <option value="user">Usuarios</option>
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="admin-content">
        <div className="results-info">
          <p>Mostrando {usuarios.length} de {totalUsuarios} usuarios</p>
        </div>
        
        <div className="admin-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : usuarios.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              color: '#8b949e' 
            }}>
              <p>No se encontraron usuarios con los filtros aplicados</p>
            </div>
          ) : (
            usuarios.map((usuario) => (
              <div key={usuario._id} className="admin-card">
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: '#f0f6fc', margin: 0, fontSize: '1.1rem' }}>
                      {usuario.nombre}
                    </h3>
                    <span className={`status-badge ${usuario.activo ? 'approved' : 'cancelled'}`}>
                      {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  
                  <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>
                    📧 {usuario.email}
                  </div>
                  
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: getRolColor(usuario.rol) + '20',
                    color: getRolColor(usuario.rol),
                    border: `1px solid ${getRolColor(usuario.rol)}`,
                    marginBottom: '8px'
                  }}>
                    {getRolLabel(usuario.rol)}
                  </div>
                </div>

                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #30363d' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '4px' }}>
                    📅 Registrado: {formatDate(usuario.date_created)}
                  </div>
                  {usuario.date_updated !== usuario.date_created && (
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>
                      🔄 Actualizado: {formatDate(usuario.date_updated)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginTop: '40px',
            padding: '30px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-sort-btn"
            >
              ← Anterior
            </button>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="admin-sort-btn"
                    style={{
                      background: pageNum === currentPage ? '#238636' : undefined,
                      color: pageNum === currentPage ? 'white' : undefined
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-sort-btn"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminUsuariosPage
