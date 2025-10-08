import React, { useState, useEffect } from 'react'
import { ProductoML } from '../types'
import '../css/admin-descuentos.css'

interface ProductoConSeleccion extends ProductoML {
  seleccionado?: boolean
}

const AdminDescuentos: React.FC = () => {
  const [productos, setProductos] = useState<ProductoConSeleccion[]>([])
  const [productosConDescuento, setProductosConDescuento] = useState<ProductoML[]>([])
  const [loading, setLoading] = useState(true)
  const [porcentaje, setPorcentaje] = useState<number>(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Reducido a 10 para ver paginación más fácilmente
  const [currentPageDescuentos, setCurrentPageDescuentos] = useState(1)
  const [itemsPerPageDescuentos] = useState(6) // Reducido a 6 para ver paginación más fácilmente

  // Cargar productos
  useEffect(() => {
    fetchProductos()
    fetchProductosConDescuento()
  }, [])

  const fetchProductos = async () => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
      const data = await response.json()
      setProductos(data.map((p: ProductoML) => ({ ...p, seleccionado: false })))
      setLoading(false)
    } catch (error) {
      console.error('Error cargando productos:', error)
      setLoading(false)
      mostrarMensaje('error', 'Error al cargar productos')
    }
  }

  const fetchProductosConDescuento = async () => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/descuentos/listar')
      const data = await response.json()
      if (data.success) {
        setProductosConDescuento(data.productos)
      }
    } catch (error) {
      console.error('Error cargando productos con descuento:', error)
    }
  }

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 5000)
  }

  const handleSeleccionarProducto = (ml_id: string) => {
    setProductos(productos.map(p => 
      p.ml_id === ml_id ? { ...p, seleccionado: !p.seleccionado } : p
    ))
  }

  const handleSeleccionarTodos = () => {
    const todosSeleccionados = productos.every(p => p.seleccionado)
    setProductos(productos.map(p => ({ ...p, seleccionado: !todosSeleccionados })))
  }

  const handleAplicarDescuento = async () => {
    const productosSeleccionados = productos.filter(p => p.seleccionado).map(p => p.ml_id)
    
    if (productosSeleccionados.length === 0) {
      mostrarMensaje('error', 'Debes seleccionar al menos un producto')
      return
    }

    if (porcentaje <= 0 || porcentaje > 100) {
      mostrarMensaje('error', 'El porcentaje debe estar entre 1 y 100')
      return
    }

    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/descuentos/aplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_ids: productosSeleccionados,
          porcentaje: porcentaje
        })
      })

      const data = await response.json()
      
      if (data.success) {
        mostrarMensaje('success', `Descuento aplicado a ${data.resultados.filter((r: any) => r.success).length} productos`)
        fetchProductos()
        fetchProductosConDescuento()
      } else {
        mostrarMensaje('error', 'Error al aplicar descuentos')
      }
    } catch (error) {
      console.error('Error aplicando descuento:', error)
      mostrarMensaje('error', 'Error al aplicar descuentos')
    }
  }

  const handleQuitarDescuento = async (ml_id: string) => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/descuentos/quitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_ids: [ml_id]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        mostrarMensaje('success', 'Descuento removido exitosamente')
        fetchProductos()
        fetchProductosConDescuento()
      } else {
        mostrarMensaje('error', 'Error al remover descuento')
      }
    } catch (error) {
      console.error('Error quitando descuento:', error)
      mostrarMensaje('error', 'Error al remover descuento')
    }
  }

  const productosFiltrados = productos.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const productosSeleccionadosCount = productos.filter(p => p.seleccionado).length

  // Paginación para productos a aplicar descuento
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem)

  // Paginación para productos con descuento
  const totalPagesDescuentos = Math.ceil(productosConDescuento.length / itemsPerPageDescuentos)
  const indexOfLastDescuento = currentPageDescuentos * itemsPerPageDescuentos
  const indexOfFirstDescuento = indexOfLastDescuento - itemsPerPageDescuentos
  const currentDescuentos = productosConDescuento.slice(indexOfFirstDescuento, indexOfLastDescuento)

  // Debug: Log para verificar paginación
  console.log('📊 Paginación Info:', {
    totalProductos: productosFiltrados.length,
    totalPages,
    currentPage,
    productosConDescuento: productosConDescuento.length,
    totalPagesDescuentos,
    currentPageDescuentos
  })

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll suave al inicio de la lista
    document.querySelector('.productos-lista')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageChangeDescuentos = (pageNumber: number) => {
    setCurrentPageDescuentos(pageNumber)
    // Scroll suave al inicio de la sección
    document.querySelector('.seccion-descuentos-activos')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="admin-descuentos">
        <div className="container">
          <h1>Cargando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-descuentos">
      <div className="container">
        <h1 className="admin-title">🎯 Panel de Administración de Descuentos</h1>

        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Sección: Productos con descuento activo */}
        <section className="seccion-descuentos-activos">
          <h2 className="seccion-titulo">
            🔥 Productos con Descuento Activo 
            <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '10px', color: '#7f8c8d' }}>
              ({productosConDescuento.length} producto{productosConDescuento.length !== 1 ? 's' : ''})
            </span>
          </h2>
          
          {productosConDescuento.length === 0 ? (
            <p className="texto-vacio">No hay productos con descuento activo</p>
          ) : (
            <>
              <div className="productos-grid">
                {currentDescuentos.map((producto: any) => (
                <div key={producto.ml_id} className="producto-descuento-card">
                  <img 
                    src={producto.image} 
                    alt={producto.title}
                    className="producto-imagen"
                  />
                  <div className="producto-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span 
                        className={`badge ${
                          producto.status === 'active' ? 'badge-active' : 
                          producto.status === 'paused' ? 'badge-paused' : 
                          'badge-closed'
                        }`}
                      >
                        {producto.status === 'active' ? '✓ Activo' : 
                         producto.status === 'paused' ? '⏸ Pausado' : 
                         '🔒 Cerrado'}
                      </span>
                      <span className="badge badge-stock" style={{
                        background: producto.available_quantity > 0 ? '#e8f5e9' : '#ffebee',
                        color: producto.available_quantity > 0 ? '#2e7d32' : '#c62828'
                      }}>
                        Stock: {producto.available_quantity}
                      </span>
                    </div>
                    <h3 className="producto-titulo">{producto.title}</h3>
                    <div className="producto-precios">
                      <span className="precio-original">${producto.precio_original}</span>
                      <span className="precio-descuento">${producto.precio_descuento}</span>
                      <span className="badge-descuento">-{producto.porcentaje}%</span>
                    </div>
                    <p className="producto-ahorro">Ahorro: ${producto.ahorro}</p>
                    {producto.status !== 'active' && (
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: '#f57c00', 
                        fontWeight: '600',
                        margin: '8px 0',
                        padding: '6px',
                        background: '#fff3e0',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        ⚠️ Este producto no se muestra en la tienda
                      </p>
                    )}
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleQuitarDescuento(producto.ml_id)}
                    >
                      Quitar Descuento
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Información y Paginación para productos con descuento */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontWeight: '600' }}>
                Mostrando {indexOfFirstDescuento + 1} - {Math.min(indexOfLastDescuento, productosConDescuento.length)} de {productosConDescuento.length} productos con descuento
              </p>
              {totalPagesDescuentos > 1 && (
                <div className="paginacion">
                <button 
                  onClick={() => handlePageChangeDescuentos(currentPageDescuentos - 1)}
                  disabled={currentPageDescuentos === 1}
                  className="btn-paginacion"
                >
                  ← Anterior
                </button>
                
                <div className="numeros-pagina">
                  {Array.from({ length: totalPagesDescuentos }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChangeDescuentos(pageNum)}
                      className={`numero-pagina ${currentPageDescuentos === pageNum ? 'activo' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => handlePageChangeDescuentos(currentPageDescuentos + 1)}
                  disabled={currentPageDescuentos === totalPagesDescuentos}
                  className="btn-paginacion"
                >
                  Siguiente →
                </button>
              </div>
              )}
            </div>
          </>
          )}
        </section>

        {/* Sección: Aplicar descuentos */}
        <section className="seccion-aplicar-descuentos">
          <h2 className="seccion-titulo">
            💰 Aplicar Descuentos
            <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '10px', color: '#7f8c8d' }}>
              ({productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''})
            </span>
          </h2>

          <div className="controles">
            <div className="control-grupo">
              <label htmlFor="porcentaje">Porcentaje de Descuento:</label>
              <div className="input-con-slider">
                <input 
                  type="range"
                  id="porcentaje"
                  min="1"
                  max="100"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(Number(e.target.value))}
                  className="slider"
                />
                <span className="porcentaje-valor">{porcentaje}%</span>
              </div>
            </div>

            <div className="control-grupo">
              <input 
                type="text"
                placeholder="🔍 Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-buscar"
              />
            </div>

            <div className="acciones">
              <button 
                className="btn btn-secondary"
                onClick={handleSeleccionarTodos}
              >
                {productos.every(p => p.seleccionado) ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={handleAplicarDescuento}
                disabled={productosSeleccionadosCount === 0}
              >
                Aplicar Descuento ({productosSeleccionadosCount} productos)
              </button>
            </div>
          </div>

          {/* Información de paginación - Siempre visible */}
          <div style={{ 
            textAlign: 'center', 
            margin: '20px 0',
            padding: '12px',
            background: '#e8f4f8',
            borderRadius: '8px',
            border: '2px solid #3498db'
          }}>
            <p style={{ margin: 0, color: '#2c3e50', fontWeight: '600', fontSize: '1rem' }}>
              📦 Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, productosFiltrados.length)} de {productosFiltrados.length} productos
              {totalPages > 1 && <span style={{ marginLeft: '15px', color: '#3498db' }}>| Página {currentPage} de {totalPages}</span>}
            </p>
          </div>

          {/* Lista de productos */}
          <div className="productos-lista">
            {currentItems.map(producto => (
              <div 
                key={producto.ml_id} 
                className={`producto-item ${producto.seleccionado ? 'seleccionado' : ''}`}
                onClick={() => handleSeleccionarProducto(producto.ml_id)}
              >
                <input 
                  type="checkbox"
                  checked={producto.seleccionado || false}
                  onChange={() => {}}
                  className="checkbox"
                />
                <img 
                  src={producto.images[0]?.url || producto.main_image} 
                  alt={producto.title}
                  className="producto-mini-imagen"
                />
                <div className="producto-detalles">
                  <h4>{producto.title}</h4>
                  <p className="producto-precio">${producto.price}</p>
                  {producto.descuento?.activo && (
                    <span className="badge-activo">Descuento Activo</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación para productos - Siempre mostrar info */}
          <div style={{ 
            marginTop: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #3498db'
          }}>
            {totalPages > 1 ? (
              <div className="paginacion">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-paginacion"
              >
                ← Anterior
              </button>
              
              <div className="numeros-pagina">
                {/* Mostrar primeras páginas */}
                {currentPage > 3 && (
                  <>
                    <button onClick={() => handlePageChange(1)} className="numero-pagina">1</button>
                    {currentPage > 4 && <span className="puntos">...</span>}
                  </>
                )}
                
                {/* Páginas alrededor de la actual */}
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
                      className={`numero-pagina ${currentPage === pageNum ? 'activo' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                
                {/* Últimas páginas */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="puntos">...</span>}
                    <button onClick={() => handlePageChange(totalPages)} className="numero-pagina">
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-paginacion"
              >
                Siguiente →
              </button>
            </div>
            ) : (
              <p style={{ 
                textAlign: 'center', 
                margin: 0, 
                color: '#7f8c8d',
                fontSize: '0.95rem'
              }}>
                ℹ️ Todos los productos caben en una página ({productosFiltrados.length} productos)
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDescuentos
