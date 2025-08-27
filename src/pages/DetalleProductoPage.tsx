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
          const talles = productoData.variantes.filter((v: Variante) => v.color === variantesUnicas[0].color);
          if (talles.length > 0) {
            setTalleSeleccionado(talles[0].size);
          }
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar el producto:', error)
      setError('Error al cargar el producto')
      setLoading(false)
    }
  }

  // Obtener variantes únicas por color
  const getVariantesUnicas = (): Variante[] => {
    if (!producto || !producto.variantes) return [];
    
    return producto.variantes.reduce((unique: Variante[], variante: Variante) => {
      if (!unique.some(v => v.color === variante.color)) {
        unique.push(variante);
      }
      return unique;
    }, []);
  }

  // Obtener talles disponibles para la variante seleccionada (color)
  const getTallesDisponibles = (): Variante[] => {
    if (!producto || !producto.variantes || !varianteSeleccionada) return [];
    
    return producto.variantes.filter((v: Variante) => v.color === varianteSeleccionada.color);
  }

  const handleVarianteChange = (variante: Variante) => {
    setVarianteSeleccionada(variante)
    
    // Seleccionar el primer talle disponible para este color
    const talles = getTallesDisponibles();
    if (talles.length > 0) {
      setTalleSeleccionado(talles[0].size);
    }
    
    setCantidad(1) // Resetear cantidad al cambiar variante
  }

  const handleTalleChange = (talle: string) => {
    setTalleSeleccionado(talle);
    setCantidad(1); // Resetear cantidad al cambiar talle
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
    
    // Convertir a formato compatible con el carrito
    const cartProduct = {
      id: varianteExacta 
        ? parseInt(varianteExacta._id)  // Usar ID de la variante exacta
        : parseInt(producto._id),       // O ID del producto si no hay variantes
      name: varianteExacta 
        ? `${producto.title} - ${varianteExacta.color} ${varianteExacta.size}`
        : producto.title,
      image: varianteExacta?.image || producto.images[0]?.url || producto.main_image,
      category: producto.categoria || 'general',
      price: varianteExacta?.price || producto.price,
      stock: stockDisponible,
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

  // Obtener variantes únicas por color
  const variantesUnicas = getVariantesUnicas();
  
  // Obtener talles disponibles para la variante seleccionada
  const tallesDisponibles = getTallesDisponibles();
  
  // Determinar el stock disponible para mostrar
  let stockDisponible = producto.available_quantity;
  if (varianteSeleccionada && talleSeleccionado && producto.variantes) {
    const varianteExacta = producto.variantes.find((v: Variante) => 
      v.color === varianteSeleccionada.color && v.size === talleSeleccionado
    );
    stockDisponible = varianteExacta?.stock || 0;
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
              src={varianteSeleccionada?.image || producto.images[0]?.url || producto.main_image} 
              alt={producto.title}
            />
          </div>

          {/* Información del producto */}
          <div className="info-producto">
            <h1 id="titulo-producto">{producto.title}</h1>
            
            <div className="precio-disponibilidad">
              <h2 id="precio-producto">${varianteSeleccionada?.price || producto.price}</h2>
              <p 
                id="disponibilidad-producto"
                style={{ color: stockDisponible > 0 ? 'green' : 'red' }}
              >
                {stockDisponible > 0 
                  ? `Disponible (${stockDisponible} unidades)` 
                  : 'Agotado'
                }
              </p>
            </div>

            {/* Variantes (solo por color) */}
            {variantesUnicas.length > 0 && (
              <div className="variantes">
                <h3>Colores disponibles:</h3>
                <div id="opciones-variantes" className="opciones-variantes">
                  {variantesUnicas.map((variante) => (
                    <div 
                      key={variante._id}
                      className={`variante-opcion ${varianteSeleccionada?._id === variante._id ? 'seleccionada' : ''}`}
                      onClick={() => handleVarianteChange(variante)}
                      style={{ 
                        cursor: 'pointer',
                        border: varianteSeleccionada?._id === variante._id ? '2px solid #4040b5' : '1px solid #ccc',
                        padding: '10px',
                        margin: '5px',
                        borderRadius: '5px'
                      }}
                    >
                      <p>Color: {variante.color}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Talles (solo para la variante seleccionada) */}
            {tallesDisponibles.length > 0 && (
              <div className="talles flex gap-20">
                <h3>Talles disponibles:</h3>
                <div id="opciones-talles" className="opciones-talles">
                  {tallesDisponibles.map((variante) => (
                    <span 
                      key={variante._id}
                      className={`talle-opcion ${talleSeleccionado === variante.size ? 'seleccionada' : ''}`}
                      onClick={() => handleTalleChange(variante.size)}
                      style={{ 
                        cursor: 'pointer',
                        border: talleSeleccionado === variante.size ? '2px solid #4040b5' : '1px solid #ccc',
                        padding: '10px',
                        borderRadius: '5px'
                      }}
                    >
                      <span>Talle: {variante.size}</span>
                      { /* <p>Stock: {variante.stock}</p> */ }
                    </span>
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
                max={stockDisponible}
                value={cantidad}
                onChange={handleCantidadChange}
                disabled={stockDisponible === 0}
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
              disabled={stockDisponible === 0}
            >
              {stockDisponible === 0 ? 'Agotado' : 'Agregar al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleProductoPage