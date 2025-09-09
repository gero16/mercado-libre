import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import '../css/detalleProducto.css'

const DetalleProductoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [producto, setProducto] = useState<ProductoML | null>(null)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(null)
  const [talleSeleccionado, setTalleSeleccionado] = useState<string>('')
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
      console.log('🔍 Producto cargado en detalle:', productoData)
      setProducto(productoData)
      
      // Seleccionar la primera variante por defecto
      if (productoData.variantes && productoData.variantes.length > 0) {
        // Agrupar variantes por color y tomar la primera de cada grupo
        const variantesUnicas = productoData.variantes.reduce((unique: Variante[], variante: Variante) => {
          if (!unique.some(v => v.color === variante.color)) {
            unique.push(variante);
          }
          return unique;
        }, []);
        
        if (variantesUnicas.length > 0) {
          setVarianteSeleccionada(variantesUnicas[0])
          
          // Seleccionar el primer talle disponible para este color
          const tallesDisponibles = productoData.variantes
            .filter((v: Variante) => v.color === variantesUnicas[0].color)
            .map((v: Variante) => v.size)
            .filter((size: string | null): size is string => size !== null && size !== undefined);
          
          if (tallesDisponibles.length > 0) {
            setTalleSeleccionado(tallesDisponibles[0])
          }
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error cargando producto:', error)
      setError('Error al cargar el producto')
      setLoading(false)
    }
  }

  const handleVarianteChange = (variante: Variante) => {
    setVarianteSeleccionada(variante)
    
    // Seleccionar el primer talle disponible para este color
    if (producto?.variantes) {
      const tallesDisponibles = producto.variantes
        .filter((v: Variante) => v.color === variante.color)
        .map((v: Variante) => v.size)
        .filter((size: string | null): size is string => size !== null && size !== undefined);
      
      if (tallesDisponibles.length > 0) {
        setTalleSeleccionado(tallesDisponibles[0])
      } else {
        setTalleSeleccionado('')
      }
    }
  }

  const handleTalleChange = (talle: string) => {
    setTalleSeleccionado(talle)
  }

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    
    // Encontrar el stock para la variante y talle seleccionados
    let stockDisponible = producto?.available_quantity || 0;
    if (varianteSeleccionada && talleSeleccionado && producto?.variantes) {
      const varianteConTalle = producto.variantes.find((v: Variante) => 
        v.color === varianteSeleccionada.color && v.size === talleSeleccionado
      );
      stockDisponible = varianteConTalle?.stock || 0;
    }
    
    if (value > 0 && value <= stockDisponible) {
      setCantidad(value)
    }
  }

  const handleAgregarAlCarrito = () => {
    if (!producto) {
      alert('Error: Producto no disponible')
      return
    }

    // ✅ VALIDACIÓN: Verificar si el producto está pausado
    const isPaused = producto.status === 'paused'
    console.log('🔍 Verificando producto en detalle:', {
      title: producto.title,
      status: producto.status,
      isPaused: isPaused
    })

    if (isPaused) {
      console.log('🚫 Producto pausado detectado en detalle, bloqueando agregar al carrito')
      alert('Este producto está pausado y no se puede agregar al carrito.')
      return
    }

    // Si hay variantes pero ninguna seleccionada
    if (producto.variantes && producto.variantes.length > 0 && !varianteSeleccionada) {
      alert('Por favor, selecciona una variante')
      return
    }

    // Si hay variantes pero ningún talle seleccionado
    if (producto.variantes && producto.variantes.length > 0 && !talleSeleccionado) {
      alert('Por favor, selecciona un talle')
      return
    }

    // Encontrar la variante exacta (color + talle)
    let varianteExacta = null;
    if (varianteSeleccionada && talleSeleccionado && producto.variantes) {
      varianteExacta = producto.variantes.find((v: Variante) => 
        v.color === varianteSeleccionada.color && v.size === talleSeleccionado
      );
    }

    // Determinar el stock disponible
    const stockDisponible = varianteExacta?.stock || producto.available_quantity
    
    // ✅ VALIDACIÓN: Verificar stock disponible
    if (stockDisponible <= 0) {
      alert('Este producto no tiene stock disponible.')
      return
    }
    
    // Obtener la imagen correcta (usar images[0].url en lugar de image)
    const imagenVariante = varianteExacta?.images && varianteExacta.images.length > 0 
      ? varianteExacta.images[0].url 
      : producto.images[0]?.url || producto.main_image;

    console.log('✅ Producto válido en detalle, agregando al carrito')

    // Convertir a formato compatible con el carrito
    const cartProduct = {
      id: varianteExacta 
        ? `${producto._id}_${varianteExacta.color}_${varianteExacta.size}` // ID único para la variante
        : producto._id, // ID del producto si no hay variantes
      name: varianteExacta 
        ? `${producto.title} - ${varianteExacta.color} ${varianteExacta.size}`
        : producto.title,
      image: imagenVariante,
      category: producto.categoria || 'general',
      price: varianteExacta?.price || producto.price,
      stock: stockDisponible,
      cantidad: cantidad,
      color: varianteExacta?.color,
      size: varianteExacta?.size
    }
    
    addToCart(cartProduct)
    alert('Producto agregado al carrito!')
  }

  // Obtener la imagen principal a mostrar
  const getImagenPrincipal = (): string => {
    if (varianteSeleccionada && varianteSeleccionada.images && varianteSeleccionada.images.length > 0) {
      return varianteSeleccionada.images[0].url;
    }
    return producto?.images[0]?.url || producto?.main_image || '';
  }

  // Verificar si el producto está pausado
  const isProductPaused = producto?.status === 'paused'

  // Verificar si es producto de dropshipping
  const isDropshipping = producto?.dropshipping?.dias_preparacion && producto.dropshipping.dias_preparacion > 14
  const diasPreparacion = producto?.dropshipping?.dias_preparacion || 0
  const diasEnvio = producto?.dropshipping?.dias_envio_estimado || 0
  const tiempoTotal = diasPreparacion + diasEnvio

  // Función helper para obtener el stock de una variante específica
  const getStockVariante = (): number => {
    if (varianteSeleccionada && talleSeleccionado && producto?.variantes) {
      const variante = producto.variantes.find((v: Variante) => 
        v.color === varianteSeleccionada.color && v.size === talleSeleccionado
      );
      return variante?.stock || 0;
    }
    return producto?.available_quantity || 0;
  }

  if (loading) {
    return (
      <div className="container">
        <div className="detalle-producto skeleton-container">
          {/* Breadcrumb skeleton */}
          <nav className="breadcrumb">
            <div className="skeleton-breadcrumb"></div>
          </nav>

          <div className="producto-detalle">
            {/* Imagen skeleton */}
            <div className="imagen-producto">
              <div className="skeleton-image-large"></div>
            </div>

            {/* Información skeleton */}
            <div className="info-producto">
              <div className="skeleton-title-large"></div>
              <div className="skeleton-price-large"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-description short"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="detalle-producto">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/tienda-ml')} className="btn-volver">
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="container">
        <div className="detalle-producto">
          <div className="error-message">
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no existe o ha sido eliminado.</p>
            <button onClick={() => navigate('/tienda-ml')} className="btn-volver">
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="detalle-producto">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">Inicio</a> / 
          <a href="/tienda-ml">Productos</a> / 
          <span>{producto.title}</span>
        </nav>

        <div className="producto-detalle">
          {/* Imagen del producto */}
          <div className="imagen-producto">
            <img src={getImagenPrincipal()} alt={producto.title} />
          </div>

          {/* Información del producto */}
          <div className="info-producto">
            <h1>{producto.title}</h1>
            
            {/* Mostrar badge de estado si está pausado */}
            {isProductPaused && (
              <div className="product-status-badge paused">
                <span>⚠️ Producto Pausado</span>
              </div>
            )}

            {/* Mostrar información de dropshipping si aplica */}
            {isDropshipping && (
              <div className="dropshipping-info">
                <div className="dropshipping-badge">
                  <span>⚙️ Dropshipping</span>
                </div>
                <div className="tiempo-entrega">
                  <h4>⏰ Tiempo de entrega estimado:</h4>
                  <div className="tiempo-detalle">
                    <div className="tiempo-item">
                      <span className="tiempo-label">Preparación:</span>
                      <span className="tiempo-value">{diasPreparacion} días</span>
                    </div>
                    <div className="tiempo-item">
                      <span className="tiempo-label">Envío:</span>
                      <span className="tiempo-value">{diasEnvio} días</span>
                    </div>
                    <div className="tiempo-item total">
                      <span className="tiempo-label">Total:</span>
                      <span className="tiempo-value">{tiempoTotal} días</span>
                    </div>
                  </div>
                  {producto.dropshipping?.proveedor && (
                    <p className="proveedor-info">
                      <strong>Proveedor:</strong> {producto.dropshipping.proveedor}
                    </p>
                  )}
                  {producto.dropshipping?.pais_origen && (
                    <p className="pais-info">
                      <strong>País de origen:</strong> {producto.dropshipping.pais_origen}
                    </p>
                  )}
                  {producto.dropshipping?.requiere_confirmacion && (
                    <div className="confirmacion-info">
                      <span>⚠️ Este producto requiere confirmación antes del envío</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="precio-disponibilidad">
              <h2>${varianteSeleccionada?.price || producto.price}</h2>
              <p className={`disponibilidad ${isProductPaused ? 'paused' : 'available'}`}>
                {isProductPaused ? 'Producto pausado' : 'Disponible'}
              </p>
            </div>

            {/* Variantes de color */}
            {producto.variantes && producto.variantes.length > 0 && (
              <div className="variantes">
                <h3>Colores disponibles:</h3>
                <div className="opciones-variantes">
                  {producto.variantes.reduce((unique: Variante[], variante: Variante) => {
                    if (!unique.some(v => v.color === variante.color)) {
                      unique.push(variante);
                    }
                    return unique;
                  }, []).map((variante: Variante) => (
                    <div
                      key={variante.color}
                      className={`variante-opcion ${varianteSeleccionada?.color === variante.color ? 'seleccionada' : ''}`}
                      onClick={() => handleVarianteChange(variante)}
                    >
                      <p><strong>{variante.color}</strong></p>
                      <p>${variante.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Talles disponibles para el color seleccionado */}
            {varianteSeleccionada && producto.variantes && (
              <div className="talles">
                <h3>Talles disponibles:</h3>
                <div className="opciones-talles">
                  {producto.variantes
                    .filter((v: Variante) => v.color === varianteSeleccionada.color)
                    .map((variante: Variante) => (
                      <button
                        key={variante.size}
                        className={`talle-opcion ${talleSeleccionado === variante.size ? 'seleccionado' : ''}`}
                        onClick={() => handleTalleChange(variante.size || '')}
                        disabled={isProductPaused || variante.stock <= 0}
                      >
                        {variante.size}
                        <span className="stock-info">({variante.stock})</span>
                      </button>
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
                max={getStockVariante()}
                value={cantidad}
                onChange={handleCantidadChange}
                disabled={isProductPaused}
              />
            </div>

            {/* Descripción */}
            {producto.description && (
              <div className="descripcion">
                <h3>Descripción</h3>
                <p>{producto.description}</p>
              </div>
            )}

            {/* Botón de agregar al carrito */}
            <button
              className="btn-agregar-carrito"
              onClick={handleAgregarAlCarrito}
              disabled={isProductPaused || getStockVariante() <= 0}
            >
              {isProductPaused 
                ? 'Producto Pausado' 
                : getStockVariante() <= 0
                  ? 'Sin Stock' 
                  : 'Agregar al Carrito'
              }
            </button>

            <button onClick={() => navigate('/tienda-ml')} className="btn-volver">
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleProductoPage
