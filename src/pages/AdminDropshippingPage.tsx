import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import ProductSkeleton from '../components/ProductSkeleton'

// Interfaz para items de administración de dropshipping
interface AdminDropshippingItem {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  esVariante: boolean;
  variante?: Variante;
  productoPadre?: ProductoML;
  categoria?: string;
  productId: string;
  variantId?: string;
  status: string;
  isPaused: boolean;
  // Propiedades específicas de dropshipping
  dias_preparacion: number;
  dias_envio_estimado: number;
  proveedor: string;
  pais_origen: string;
  requiere_confirmacion: boolean;
  costo_importacion: number;
  tiempo_configurado_en_ml: boolean;
  // Propiedades de variantes
  tieneVariantes?: boolean;
  stockTotalVariantes?: number;
}

const AdminDropshippingPage: React.FC = () => {
  const navigate = useNavigate()
  const [adminItems, setAdminItems] = useState<AdminDropshippingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'products' | 'variants'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [filterProveedor, setFilterProveedor] = useState<string>('all')
  const [filterPais, setFilterPais] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'dias_preparacion' | 'proveedor'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch productos de dropshipping desde el backend
  const fetchDropshippingProducts = async (): Promise<ProductoML[]> => {
    try {
      console.log(' Intentando obtener productos de dropshipping...')
      const response = await fetch('https://tienda-virtual-ts-back-production.up.railway.app/ml/productos/tipo/dropshipping')
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Respuesta del servidor:', data)
      
      // Extraer los productos del objeto de respuesta
      const productos = data.productos || []
      console.log('📊 Productos extraídos:', productos)
      console.log('📊 Cantidad de productos:', productos.length)
      
      return productos
    } catch (error) {
      console.error('❌ Error fetching dropshipping products for admin:', error)
      setError(`Error al cargar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      console.log(' Iniciando carga de productos de dropshipping...')
      
      const productList = await fetchDropshippingProducts()
      console.log(' Lista de productos procesada:', productList)
      
      // Procesar productos para crear items de administración
      const items: AdminDropshippingItem[] = []
      
      productList.forEach((producto, index) => {
        console.log(`🔄 Procesando producto ${index + 1}:`, producto.title)
        
        const isPaused = producto.status === 'paused'
        
        // Calcular stock total de variantes si existen
        let totalVariantsStock = 0
        if (producto.variantes && producto.variantes.length > 0) {
          totalVariantsStock = producto.variantes.reduce((sum, variante) => {
            return sum + (isPaused ? 0 : variante.stock)
          }, 0)
        }
        
        const effectiveStock = isPaused ? 0 : producto.available_quantity
        
        // Agregar el producto principal
        items.push({
          id: producto._id,
          title: producto.title,
          price: producto.price,
          image: producto.images[0]?.url || producto.main_image,
          stock: effectiveStock,
          esVariante: false,
          productoPadre: producto,
          categoria: producto.category_id,
          productId: producto.ml_id,
          status: producto.status,
          isPaused: isPaused,
          tieneVariantes: producto.variantes && producto.variantes.length > 0,
          stockTotalVariantes: totalVariantsStock,
          // Propiedades de dropshipping (extraídas del objeto anidado)
          dias_preparacion: producto.dropshipping?.dias_preparacion || 0,
          dias_envio_estimado: producto.dropshipping?.dias_envio_estimado || 0,
          proveedor: producto.dropshipping?.proveedor || 'No especificado',
          pais_origen: producto.dropshipping?.pais_origen || 'No especificado',
          requiere_confirmacion: producto.dropshipping?.requiere_confirmacion || false,
          costo_importacion: producto.dropshipping?.costo_importacion || 0,
          tiempo_configurado_en_ml: producto.dropshipping?.tiempo_configurado_en_ml || false
        })
        
        // Agregar cada variante como un item separado
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach(variante => {
            const imagenVariante = variante.images && variante.images.length > 0 
              ? variante.images[0].url 
              : producto.images[0]?.url || producto.main_image;
            
            const variantStock = isPaused ? 0 : variante.stock
            
            items.push({
              id: `${producto._id}_${variante._id}`,
              title: `${producto.title} - ${variante.color || ''} ${variante.size || ''}`.trim(),
              price: variante.price || producto.price,
              image: imagenVariante,
              stock: variantStock,
              esVariante: true,
              variante: variante,
              productoPadre: producto,
              categoria: producto.category_id,
              productId: producto.ml_id,
              variantId: variante._id,
              status: producto.status,
              isPaused: isPaused,
              // Propiedades de dropshipping (heredadas del producto padre)
              dias_preparacion: producto.dropshipping?.dias_preparacion || 0,
              dias_envio_estimado: producto.dropshipping?.dias_envio_estimado || 0,
              proveedor: producto.dropshipping?.proveedor || 'No especificado',
              pais_origen: producto.dropshipping?.pais_origen || 'No especificado',
              requiere_confirmacion: producto.dropshipping?.requiere_confirmacion || false,
              costo_importacion: producto.dropshipping?.costo_importacion || 0,
              tiempo_configurado_en_ml: producto.dropshipping?.tiempo_configurado_en_ml || false
            })
          })
        }
      })
      
      console.log('✅ Items procesados:', items.length)
      setAdminItems(items)
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Obtener proveedores únicos para el filtro
  const proveedoresUnicos = Array.from(new Set(adminItems.map(item => item.proveedor)))
  const paisesUnicos = Array.from(new Set(adminItems.map(item => item.pais_origen)))

  // Filtrar y ordenar items
  const filteredAndSortedItems = adminItems
    .filter(item => {
      // Filtro por búsqueda
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Filtro por tipo
      if (filterType === 'products' && item.esVariante) return false
      if (filterType === 'variants' && !item.esVariante) return false
      
      // Filtro por status
      if (filterStatus === 'active' && item.isPaused) return false
      if (filterStatus === 'paused' && !item.isPaused) return false
      
      // Filtro por proveedor
      if (filterProveedor !== 'all' && item.proveedor !== filterProveedor) return false
      
      // Filtro por país
      if (filterPais !== 'all' && item.pais_origen !== filterPais) return false
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'dias_preparacion':
          comparison = a.dias_preparacion - b.dias_preparacion
          break
        case 'proveedor':
          comparison = a.proveedor.localeCompare(b.proveedor)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleEditProduct = (item: AdminDropshippingItem) => {
    console.log('Editar producto dropshipping:', item)
    alert(`Función de edición para: ${item.title}`)
  }

  const handleDeleteProduct = (item: AdminDropshippingItem) => {
    console.log('Eliminar producto dropshipping:', item)
    if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
      alert(`Función de eliminación para: ${item.title}`)
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Panel de Dropshipping</h1>
            <p>Cargando productos...</p>
          </div>
          <div className="admin-products-list">
            <ProductSkeleton count={6} />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Panel de Dropshipping</h1>
            <p style={{ color: '#dc2626' }}>Error: {error}</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '10px 20px',
                backgroundColor: '#1f6feb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>Panel de Productos a Pedido</h1>
          <p>Gestiona productos con preparación mayor a 14 días</p>
          <p style={{ fontSize: '0.9rem', color: '#8b949e' }}>
            Total de productos cargados: {adminItems.length}
          </p>
        </div>

        {/* Navegación a página principal */}
        <div className="admin-quick-nav">
          <button 
            className="quick-nav-btn back-btn"
            onClick={() => navigate('/admin')}
          >
            <span className="btn-icon">←</span>
            <span className="btn-text">Volver a Administración General</span>
          </button>
        </div>

        {/* Controles de filtrado y búsqueda */}
        <div className="admin-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-section">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'products' | 'variants')}
              className="admin-select"
            >
              <option value="all">Todos los items</option>
              <option value="products">Solo productos</option>
              <option value="variants">Solo variantes</option>
            </select>
          </div>
          
          <div className="status-section">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'paused')}
              className="admin-select"
            >
              <option value="all">Todos los status</option>
              <option value="active">Activos</option>
              <option value="paused">Pausados</option>
            </select>
          </div>

          
          <div className="sort-section">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'dias_preparacion' | 'proveedor')}
              className="admin-select"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
              <option value="dias_preparacion">Ordenar por días preparación</option>
              <option value="proveedor">Ordenar por proveedor</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="admin-sort-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Items</h3>
            <span className="stat-number">{adminItems.length}</span>
          </div>
          <div className="stat-card">
            <h3>Productos</h3>
            <span className="stat-number">{adminItems.filter(item => !item.esVariante).length}</span>
          </div>
          <div className="stat-card">
            <h3>Variantes</h3>
            <span className="stat-number">{adminItems.filter(item => item.esVariante).length}</span>
          </div>
          <div className="stat-card">
            <h3>Proveedores</h3>
            <span className="stat-number">{proveedoresUnicos.length}</span>
          </div>
          
          <div className="stat-card">
            <h3>Requieren Confirmación</h3>
            <span className="stat-number">{adminItems.filter(item => item.requiere_confirmacion).length}</span>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="admin-products-list">
          {filteredAndSortedItems.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos con los filtros seleccionados.</p>
              {adminItems.length === 0 && (
                <p style={{ color: '#8b949e', marginTop: '10px' }}>
                  No hay productos de dropshipping disponibles en el sistema.
                </p>
              )}
            </div>
          ) : (
            filteredAndSortedItems.map(item => (
              <div key={item.id} className="admin-product-item">
                <div className="product-image">
                  <img src={item.image} alt={item.title} />
                </div>
                
                <div className="product-info">
                  <div className="product-main-info">
                    <h3 className="product-title">{item.title}</h3>
                    {
                      /* 
                      
                        <div className="product-badges">
                          {item.esVariante ? (
                            <span className="badge badge-variant">Variante</span>
                          ) : (
                            <span className="badge badge-product">Producto</span>
                          )}
                          {item.isPaused ? (
                            <span className="badge badge-paused">Pausado</span>
                          ) : item.stock <= 0 ? (
                            <span className="badge badge-no-stock">Sin Stock</span>
                          ) : null}
                          <span className="badge badge-dropshipping">Dropshipping</span>
                          {item.requiere_confirmacion && (
                            <span className="badge badge-confirmation">Requiere Confirmación</span>
                          )}
                          {item.tiempo_configurado_en_ml && (
                            <span className="badge badge-ml-configured">Configurado en ML</span>
                          )}
                        </div>
                      */
                    }
                  </div>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value">${item.price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Stock:</span>
                      <span className={`detail-value ${item.stock <= 0 ? 'no-stock' : ''}`}>
                        {item.isPaused ? '0 (Pausado)' : item.stock}
                        {!item.esVariante && item.tieneVariantes && (
                          <span className="stock-info">
                            {' '}(Total de variantes: {item.stockTotalVariantes})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Días Preparación:</span>
                      <span className="detail-value dropshipping-info">{item.dias_preparacion} días</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Días Envío:</span>
                      <span className="detail-value dropshipping-info">{item.dias_envio_estimado} días</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Proveedor:</span>
                      <span className="detail-value">{item.proveedor}</span>
                    </div>
              
                    <div className="detail-row">
                      <span className="detail-label">Costo Importación:</span>
                      <span className="detail-value">${item.costo_importacion}</span>
                    </div>
                    {!item.esVariante && item.tieneVariantes && (
                      <div className="detail-row">
                        <span className="detail-label">Tipo:</span>
                        <span className="detail-value product-base">
                          Producto Base (con {item.productoPadre?.variantes?.length || 0} variantes)
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value ${item.isPaused ? 'paused' : 'active'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ID Producto:</span>
                      <span className="detail-value detail-id">{item.productId}</span>
                    </div>
                    {item.variantId && (
                      <div className="detail-row">
                        <span className="detail-label">ID Variante:</span>
                        <span className="detail-value detail-id">{item.variantId}</span>
                      </div>
                    )}
                    {item.variante && (
                      <>
                        {item.variante.color && (
                          <div className="detail-row">
                            <span className="detail-label">Color:</span>
                            <span className="detail-value">{item.variante.color}</span>
                          </div>
                        )}
                        {item.variante.size && (
                          <div className="detail-row">
                            <span className="detail-label">Talla:</span>
                            <span className="detail-value">{item.variante.size}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
               
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminDropshippingPage 