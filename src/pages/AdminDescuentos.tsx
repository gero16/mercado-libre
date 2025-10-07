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
          <h2 className="seccion-titulo">🔥 Productos con Descuento Activo</h2>
          
          {productosConDescuento.length === 0 ? (
            <p className="texto-vacio">No hay productos con descuento activo</p>
          ) : (
            <div className="productos-grid">
              {productosConDescuento.map((producto: any) => (
                <div key={producto.ml_id} className="producto-descuento-card">
                  <img 
                    src={producto.image} 
                    alt={producto.title}
                    className="producto-imagen"
                  />
                  <div className="producto-info">
                    <h3 className="producto-titulo">{producto.title}</h3>
                    <div className="producto-precios">
                      <span className="precio-original">${producto.precio_original}</span>
                      <span className="precio-descuento">${producto.precio_descuento}</span>
                      <span className="badge-descuento">-{producto.porcentaje}%</span>
                    </div>
                    <p className="producto-ahorro">Ahorro: ${producto.ahorro}</p>
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
          )}
        </section>

        {/* Sección: Aplicar descuentos */}
        <section className="seccion-aplicar-descuentos">
          <h2 className="seccion-titulo">💰 Aplicar Descuentos</h2>

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

          {/* Lista de productos */}
          <div className="productos-lista">
            {productosFiltrados.map(producto => (
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
        </section>
      </div>
    </div>
  )
}

export default AdminDescuentos
