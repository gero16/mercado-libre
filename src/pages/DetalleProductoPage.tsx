import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'

const DetalleProductoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [producto, setProducto] = useState<ProductoML | null>(null)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      cargarProducto(id)
    }
  }, [id])

  const cargarProducto = async (productId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://tienda-virtual-ts-back-production.up.railway.app/ml/productos/${productId}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const productoData = await response.json()
      setProducto(productoData)
      
      // Seleccionar la primera variante por defecto
      if (productoData.variantes && productoData.variantes.length > 0) {
        setVarianteSeleccionada(productoData.variantes[0])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar el producto:', error)
      setError('Error al cargar el producto')
      setLoading(false)
    }
  }

  const handleVarianteChange = (variante: Variante) => {
    setVarianteSeleccionada(variante)
    setCantidad(1) // Resetear cantidad al cambiar variante
  }

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 0 && value <= (producto?.available_quantity || 1)) {
      setCantidad(value)
    }
  }

  const handleAgregarAlCarrito = () => {
    if (!producto || !varianteSeleccionada) {
      alert('Por favor, selecciona una variante')
      return
    }

    // Convertir ProductoML a formato compatible con el carrito
    const cartProduct = {
      id: parseInt(producto._id) || 0,
      name: `${producto.title} - ${varianteSeleccionada.color} ${varianteSeleccionada.size}`,
      image: varianteSeleccionada.image || producto.main_image,
      category: producto.categoria || 'general',
      price: producto.price,
      stock: varianteSeleccionada.stock,
      cantidad: cantidad
    }
    
    addToCart(cartProduct)
    alert('Producto agregado al carrito!')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="centrar-texto">
          <div className="preloader">Cargando producto...</div>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="container">
        <div className="centrar-texto">
          <h2>Error al cargar el producto</h2>
          <p>{error || 'Producto no encontrado'}</p>
          <button onClick={() => navigate('/tienda-ml')} className="btn-volver">
            Volver a la tienda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="detalle-producto">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">Inicio</a> &gt; 
          <a href="/tienda-ml">Tienda ML</a> &gt; 
          <span id="nombre-producto-breadcrumb">{producto.title}</span>
        </nav>

        <div className="producto-detalle">
          {/* Imagen principal */}
          <div className="imagen-producto">
            <img 
              id="imagen-principal" 
              src={producto.images[0]?.url || producto.main_image} 
              alt={producto.title}
            />
          </div>

          {/* Información del producto */}
          <div className="info-producto">
            <h1 id="titulo-producto">{producto.title}</h1>
            
            <div className="precio-disponibilidad">
              <h2 id="precio-producto">${producto.price}</h2>
              <p 
                id="disponibilidad-producto"
                style={{ color: producto.available_quantity > 0 ? 'green' : 'red' }}
              >
                {producto.available_quantity > 0 
                  ? `Disponible (${producto.available_quantity} unidades)` 
                  : 'Agotado'
                }
              </p>
            </div>

            {/* Variantes */}
            {producto.variantes && producto.variantes.length > 0 && (
              <div className="variantes">
                <h3>Variantes disponibles:</h3>
                <div id="opciones-variantes" className="opciones-variantes">
                  {producto.variantes.map((variante) => (
                    <div 
                      key={variante._id}
                      className={`variante-opcion ${varianteSeleccionada?._id === variante._id ? 'seleccionada' : ''}`}
                      onClick={() => handleVarianteChange(variante)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p>Color: {variante.color}</p>
                      <p>Talla: {variante.size}</p>
                      <p>Stock: {variante.stock}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div className="cantidad">
              <label htmlFor="cantidad">Cantidad:</label>
              <input
                type="number"
                id="cantidad"
                min="1"
                max={producto.available_quantity}
                value={cantidad}
                onChange={handleCantidadChange}
              />
            </div>

            {/* Descripción */}
            {producto.description && (
              <div className="descripcion">
                <h3>Descripción:</h3>
                <p id="descripcion">{producto.description}</p>
              </div>
            )}

            {/* Botón agregar al carrito */}
            <button
              id="agregar-carrito"
              className="btn-agregar-carrito"
              onClick={handleAgregarAlCarrito}
              disabled={producto.available_quantity === 0}
            >
              {producto.available_quantity === 0 ? 'Agotado' : 'Agregar al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleProductoPage 