import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import ProductSkeleton from '../components/ProductSkeleton'

// Interfaz para items de administración
interface AdminItem {
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
  // Nuevas propiedades
  tieneVariantes?: boolean;
  stockTotalVariantes?: number;
  tipoEntrega?: 'dropshipping' | 'stock_fisico';
  // Propiedades de tiempo de entrega
  dias_preparacion?: number;
  dias_envio_estimado?: number;
  tiempo_total_entrega?: number;
  es_entrega_larga?: boolean; // > 14 días
  es_stock_fisico?: boolean; // Flex o entrega 1-7 días
  proveedor?: string;
  pais_origen?: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const [adminItems, setAdminItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'products' | 'variants'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'fast' | 'slow'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'delivery'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // 🆕 Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Fetch productos de Mercado Libre desde el backend
  const fetchProducts = async (): Promise<ProductoML[]> => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
      const data = await response.json()
      console.log('Productos para admin:', data)
      return data || []
    } catch (error) {
      console.error('Error fetching ML products for admin:', error)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      const productList = await fetchProducts()
      
      // Procesar productos para crear items de administración
      const items: AdminItem[] = []
      
      productList.forEach(producto => {
        const isPaused = producto.status === 'paused'
        
        // Calcular stock total de variantes si existen
        let totalVariantsStock = 0
        if (producto.variantes && producto.variantes.length > 0) {
          totalVariantsStock = producto.variantes.reduce((sum, variante) => {
            return sum + variante.stock
          }, 0)
        }
        
        const effectiveStock = (producto.variantes && producto.variantes.length > 0)
          ? totalVariantsStock
          : producto.available_quantity
        
        // Calcular tiempo de entrega
        const diasPreparacion = producto.dropshipping?.dias_preparacion || producto.dias_preparacion || 0
        const diasEnvio = producto.dropshipping?.dias_envio_estimado || producto.dias_envio_estimado || 0
        const tiempoTotalEntrega = diasPreparacion + diasEnvio
        const esEntregaLarga = tiempoTotalEntrega > 14
        
        // 🚀 DETERMINAR SI ES STOCK FÍSICO/RÁPIDO
        // Basado en análisis: xd_drop_off con dias_preparacion: 0 es lo más "local"
        const esFlex = producto.shipping?.logistic_type === 'fulfillment'
        const esXdDropOff = producto.shipping?.logistic_type === 'xd_drop_off'
        const sinPreparacion = (producto.dropshipping?.dias_preparacion || producto.dias_preparacion || 0) === 0
        const entregaTotal = tiempoTotalEntrega || (producto.dropshipping?.dias_envio_estimado || 7)
        
        // Es "stock rápido" si:
        // 1. Flex (fulfillment) - ideal
        // 2. Cross Docking SIN días de preparación (solo envío) = ~7 días
        // 3. Cualquier producto con entrega ≤ 10 días total
        const esStockFisico = esFlex || (esXdDropOff && sinPreparacion) || (entregaTotal > 0 && entregaTotal <= 10)
        
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
          // Propiedades de tiempo de entrega
          dias_preparacion: diasPreparacion,
          dias_envio_estimado: diasEnvio,
          tiempo_total_entrega: tiempoTotalEntrega,
          es_entrega_larga: esEntregaLarga,
          es_stock_fisico: esStockFisico,
          proveedor: producto.dropshipping?.proveedor || producto.proveedor || 'No especificado',
          pais_origen: producto.dropshipping?.pais_origen || producto.pais_origen || 'No especificado'
        })
        
        // Agregar cada variante como un item separado
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach(variante => {
            const imagenVariante = variante.images && variante.images.length > 0 
              ? variante.images[0].url 
              : producto.images[0]?.url || producto.main_image;
            
            const variantStock = variante.stock
            
            // Calcular tiempo de entrega para variantes (priorizar configuración de variante)
            const variantDiasPreparacion = variante.dropshipping?.dias_preparacion || diasPreparacion
            const variantDiasEnvio = variante.dropshipping?.dias_envio_estimado || diasEnvio
            const variantTiempoTotal = variantDiasPreparacion + variantDiasEnvio
            const variantEsEntregaLarga = variantTiempoTotal > 14
            
            // 🚀 DETERMINAR SI LA VARIANTE ES STOCK RÁPIDO
            const variantSinPreparacion = (variante.dropshipping?.dias_preparacion || producto.dropshipping?.dias_preparacion || 0) === 0
            const variantEntregaTotal = variantTiempoTotal || (variante.dropshipping?.dias_envio_estimado || producto.dropshipping?.dias_envio_estimado || 7)
            const variantEsStockFisico = esFlex || (esXdDropOff && variantSinPreparacion) || (variantEntregaTotal > 0 && variantEntregaTotal <= 10)
            
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
              // Propiedades de tiempo de entrega para variantes
              dias_preparacion: variantDiasPreparacion,
              dias_envio_estimado: variantDiasEnvio,
              tiempo_total_entrega: variantTiempoTotal,
              es_entrega_larga: variantEsEntregaLarga,
              es_stock_fisico: variantEsStockFisico,
              proveedor: variante.dropshipping?.proveedor || producto.dropshipping?.proveedor || producto.proveedor || 'No especificado',
              pais_origen: variante.dropshipping?.pais_origen || producto.dropshipping?.pais_origen || producto.pais_origen || 'No especificado'
            })
          })
        }
      })
      
      setAdminItems(items)
      setLoading(false)
    }
    loadProducts()
  }, [])

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
      
      // Filtro por tiempo de entrega
      if (filterDelivery === 'fast' && item.es_entrega_larga) return false
      if (filterDelivery === 'slow' && !item.es_entrega_larga) return false
      
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
        case 'delivery':
          comparison = (a.tiempo_total_entrega || 0) - (b.tiempo_total_entrega || 0)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // 🆕 Paginación
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem)

  // 🆕 Funciones de paginación
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset a primera página
  }

  // 🆕 Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType, filterStatus, filterDelivery, sortBy, sortOrder])

  // Comentamos las funciones no utilizadas
  // const handleEditProduct = (item: AdminItem) => {
  //   console.log('Editar producto:', item)
  //   alert(`Función de edición para: ${item.title}`)
  // }

  // const handleDeleteProduct = (item: AdminItem) => {
  //   console.log('Eliminar producto:', item)
  //   if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
  //     alert(`Función de eliminación para: ${item.title}`)
  //   }
  // }

  if (loading) {
    return (
      <main className="container">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Panel de Administración</h1>
            <p>Cargando productos...</p>
          </div>
          <div className="admin-products-list">
            <ProductSkeleton count={6} />
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
          <h1>Panel de Administración</h1>
          <p>Gestiona todos los productos y variantes de tu tienda</p>
        </div>

        {/* Navegación de administración */}
        <div className="admin-nav flex gap-20">
          <button 
            onClick={() => navigate('/admin/dropshipping')}
            className="btn-orden btn-dropshipping"
          >
            ↳ Configurar Dropshipping
          </button>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="btn-orden btn-orders"
          >
           ↳ Ver Órdenes de Compra
          </button>
          <button 
            onClick={() => navigate("/admin/clientes")}
            className="btn-orden btn-clientes"
          >
           ↳ Gestionar Clientes
          </button>
          <button 
            onClick={() => navigate("/admin/descuentos")}
            className="btn-orden btn-descuentos"
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white'
            }}
          >
           ↳ Gestionar Descuentos 🔥
          </button>
          <button 
            onClick={() => navigate("/admin/cupones")}
            className="btn-orden btn-cupones"
            style={{
              background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
              color: 'white'
            }}
          >
           ↳ Gestionar Cupones 🎟️
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
          
          <div className="delivery-section">
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value as 'all' | 'fast' | 'slow')}
              className="admin-select"
            >
              <option value="all">Todos los tiempos</option>
              <option value="fast">Stock físico </option>
              <option value="slow">A pedido </option>
            </select>
          </div>
          
          <div className="sort-section">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'delivery')}
              className="admin-select"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
              <option value="delivery">Ordenar por entrega</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="admin-sort-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* 🆕 Información de paginación y control */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>
                📊 Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedItems.length)} de {filteredAndSortedItems.length} items
              </h3>
              {totalPages > 1 && (
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Página {currentPage} de {totalPages}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '600' }}>Items por página:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                style={{
                  padding: '8px 15px',
                  borderRadius: '8px',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
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
            <h3>Sin Stock</h3>
            <span className="stat-number">{adminItems.filter(item => !item.isPaused && item.stock <= 0).length}</span>
          </div>
          <div className="stat-card">
            <h3>Pausados</h3>
            <span className="stat-number">{adminItems.filter(item => item.isPaused).length}</span>
          </div>
          <div className="stat-card">
            <h3>A Pedido</h3>
            <span className="stat-number">{adminItems.filter(item => item.es_entrega_larga).length}</span>
          </div>
          <div className="stat-card">
            <h3>Stock Físico</h3>
            <span className="stat-number">{adminItems.filter(item => !item.isPaused && item.stock > 0 && item.es_stock_fisico).length}</span>
            <div className="stat-subtitle">
              Self Service (~7 días)
            </div>
          </div>
        </div>

        {/* Lista de productos paginada */}
        <div className="admin-products-list">
          {currentItems.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            currentItems.map(item => (
              <div key={item.id} className={`admin-product-item ${item.es_entrega_larga ? 'slow-delivery-item' : ''}`}>
                <div className="product-image">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className={
                      item.isPaused 
                        ? 'paused-image' 
                        : item.esVariante 
                          ? 'variant-image' 
                          : (!item.esVariante && item.tieneVariantes) 
                            ? 'base-product-image' 
                            : 'product-image'
                    }
                  />
                </div>
                
                <div className="product-info">
                  <div className="product-main-info">
                    <h3 className={`product-title ${!item.esVariante && item.tieneVariantes ? 'product-base-title' : ''}`}>
                      {item.title} 
                    </h3>
                    <div className="product-badges">
                      {item.esVariante ? (
                        <span className="badge badge-variant">Variante</span>
                      ) : (!item.esVariante && item.tieneVariantes) ? (
                        <span className="badge badge-product-base">Producto Base</span>
                      ) : (
                        <span className="badge badge-product">Producto</span>
                      )}
                      {item.isPaused ? (
                        <span className="badge badge-paused">Pausado</span>
                      ) : !item.isPaused && item.stock <= 0 ? (
                        <span className="badge badge-no-stock">Sin Stock</span>
                      ) : null}
                      {item.es_entrega_larga && (
                        <span className="badge badge-slow-delivery">A Pedido</span>
                      )}
                      {item.es_stock_fisico && !item.isPaused && item.stock > 0 && (
                        <span className="badge badge-physical-stock" style={{
                          backgroundColor: item.productoPadre?.shipping?.logistic_type === 'fulfillment' 
                            ? '#00a650' 
                            : (item.productoPadre?.shipping?.logistic_type === 'xd_drop_off' && (item.dias_preparacion || 0) === 0)
                              ? '#2196f3'
                              : '#3483fa',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {item.productoPadre?.shipping?.logistic_type === 'fulfillment' 
                            ? '⚡ FLEX' 
                            : (item.productoPadre?.shipping?.logistic_type === 'xd_drop_off' && (item.dias_preparacion || 0) === 0)
                              ? '🚚 Cross Docking'
                              : `📦 ${item.tiempo_total_entrega || 7}d`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value">US$ {item.price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Stock:</span>
                      <span className={`detail-value ${item.stock <= 0 ? 'no-stock' : ''}`}>
                        {item.stock}{item.isPaused ? ' (Pausado)' : ''}
                        {!item.esVariante && item.tieneVariantes && (
                          <span className="stock-info">
                            {' '}(Total de variantes: {item.stockTotalVariantes})
                          </span>
                        )}
                      </span>
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
                    {(item.tiempo_total_entrega && item.tiempo_total_entrega > 0) && (
                      <div className="detail-row">
                        <span className="detail-label">Tiempo Entrega:</span>
                        <span className={`detail-value ${item.es_entrega_larga ? 'slow-delivery' : 'fast-delivery'}`}>
                          {item.tiempo_total_entrega} días
                          {(item.dias_preparacion || 0) > 0 && (item.dias_envio_estimado || 0) > 0 && (
                            <span className="delivery-breakdown">
                              {' '}(Prep: {item.dias_preparacion}d + Envío: {item.dias_envio_estimado}d)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {item.proveedor && item.proveedor !== 'No especificado' && (
                      <div className="detail-row">
                        <span className="detail-label">Proveedor:</span>
                        <span className="detail-value">{item.proveedor}</span>
                      </div>
                    )}
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

        {/* 🆕 Paginación */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginTop: '40px',
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            flexWrap: 'wrap',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '12px 24px',
                background: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'white',
                color: currentPage === 1 ? 'rgba(255,255,255,0.5)' : '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentPage === 1 ? 'none' : '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              ← Anterior
            </button>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Primera página */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    style={{
                      width: '45px',
                      height: '45px',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span style={{ color: 'white', fontWeight: '700', padding: '0 5px' }}>...</span>
                  )}
                </>
              )}

              {/* Páginas cercanas */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum =>
                  pageNum === currentPage ||
                  pageNum === currentPage - 1 ||
                  pageNum === currentPage + 1 ||
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                )
                .map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      width: '45px',
                      height: '45px',
                      background: pageNum === currentPage 
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'white',
                      color: pageNum === currentPage ? 'white' : '#667eea',
                      border: pageNum === currentPage ? '3px solid white' : 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: pageNum === currentPage ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: pageNum === currentPage 
                        ? '0 6px 20px rgba(245, 87, 108, 0.4)'
                        : '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

              {/* Última página */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span style={{ color: 'white', fontWeight: '700', padding: '0 5px' }}>...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    style={{
                      width: '45px',
                      height: '45px',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '12px 24px',
                background: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'white',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.5)' : '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentPage === totalPages ? 'none' : '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Info adicional si todo cabe en una página */}
        {totalPages <= 1 && filteredAndSortedItems.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            marginTop: '20px',
            background: '#e8f5e9',
            borderRadius: '10px',
            color: '#2e7d32',
            fontWeight: '600'
          }}>
            ✅ Todos los {filteredAndSortedItems.length} items están en una sola página
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminPage
