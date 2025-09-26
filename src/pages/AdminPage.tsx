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

  // Fetch productos de Mercado Libre desde el backend
  const fetchProducts = async (): Promise<ProductoML[]> => {
    try {
      const response = await fetch('https://tienda-virtual-ts-back-production.up.railway.app/ml/productos')
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
            onClick={() => navigate('/admin/orders')} // 🆕 Agregar enlace a órdenes
            className="btn-orden btn-orders"
          >
           ↳ Ver Órdenes de Compra
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
            <span className="stat-number">{adminItems.filter(item => !item.es_entrega_larga && (item.tiempo_total_entrega || 0) > 0).length}</span>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="admin-products-list">
          {filteredAndSortedItems.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredAndSortedItems.map(item => (
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
                    </div>
                  </div>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value">${item.price}</span>
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
      </div>
    </main>
  )
}

export default AdminPage
