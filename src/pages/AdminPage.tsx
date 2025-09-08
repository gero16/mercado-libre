import React, { useState, useEffect } from 'react'
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
}

const AdminPage: React.FC = () => {
  const [adminItems, setAdminItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'products' | 'variants'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
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
          // Nueva propiedad para indicar si tiene variantes
          tieneVariantes: producto.variantes && producto.variantes.length > 0,
          stockTotalVariantes: totalVariantsStock
        })
        
        // Agregar cada variante como un item separado
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach(variante => {
            const imagenVariante = variante.images && variante.images.length > 0 
              ? variante.images[0].url 
              : producto.images[0]?.url || producto.main_image;
            
            // Si el producto padre está pausado, las variantes también se consideran sin stock
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
              productId: producto.ml_id, // ✅ Cambiado a ml_id
              variantId: variante._id,
              status: producto.status,
              isPaused: isPaused
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
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleEditProduct = (item: AdminItem) => {
    // TODO: Implementar edición de producto
    console.log('Editar producto:', item)
    alert(`Función de edición para: ${item.title}`)
  }

  const handleDeleteProduct = (item: AdminItem) => {
    // TODO: Implementar eliminación de producto
    console.log('Eliminar producto:', item)
    if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
      alert(`Función de eliminación para: ${item.title}`)
    }
  }

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
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock')}
              className="admin-select"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
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
            <span className="stat-number">{adminItems.filter(item => item.stock <= 0).length}</span>
          </div>
          <div className="stat-card">
            <h3>Pausados</h3>
            <span className="stat-number">{adminItems.filter(item => item.isPaused).length}</span>
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
              <div key={item.id} className="admin-product-item">
                <div className="product-image">
                  <img src={item.image} alt={item.title} />
                </div>
                
                <div className="product-info">
                  <div className="product-main-info">
                    <h3 className="product-title">{item.title}</h3>
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
                        {item.isPaused ? '0 (Pausado)' : item.stock + " (Total de variantes)" }
                        
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
                
                <div className="product-actions">
                  <button
                    onClick={() => handleEditProduct(item)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(item)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
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
