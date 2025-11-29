import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import SEO from '../components/SEO'
import '../css/detalleProducto.css'

const DetalleProductoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, setCartOpen } = useCart()
  
  const [producto, setProducto] = useState<ProductoML | null>(null)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(null)
  const [talleSeleccionado, setTalleSeleccionado] = useState<string>('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imagenPrincipalIndex, setImagenPrincipalIndex] = useState(0)
  const [miniaturaStartIndex, setMiniaturaStartIndex] = useState(0)

  useEffect(() => {
    if (id) {
      cargarProducto(id)
    }
  }, [id])

  const cargarProducto = async (productId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://poppy-shop-production.up.railway.app/ml/productos/${productId}`)
      
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
            .filter((size: string | undefined): size is string => size !== undefined);
          
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
    setImagenPrincipalIndex(0) // Resetear a la primera imagen
    
    // Seleccionar el primer talle disponible para este color
    if (producto?.variantes) {
      const tallesDisponibles = producto.variantes
        .filter((v: Variante) => v.color === variante.color)
        .map((v: Variante) => v.size)
        .filter((size: string | undefined): size is string => size !== undefined);
      
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
    const productIdBase = producto.ml_id || producto._id
    
    // Calcular precio con descuento para el carrito
    const precioParaCarrito = varianteExacta?.price || producto.price
    const precioFinalCarrito = tieneDescuento 
      ? Math.round(precioParaCarrito * (1 - porcentajeDescuento / 100) * 100) / 100
      : precioParaCarrito
    
    const cartProduct = {
      id: varianteExacta 
        ? `${productIdBase}_${varianteExacta.color}_${varianteExacta.size}` // ID único para la variante
        : productIdBase, // ID del producto si no hay variantes
      name: varianteExacta 
        ? `${producto.title} - ${varianteExacta.color} ${varianteExacta.size}`
        : producto.title,
      image: imagenVariante,
      category: producto.categoria || 'general',
      price: precioFinalCarrito,
      stock: stockDisponible,
      cantidad: cantidad,
      color: varianteExacta?.color,
      size: varianteExacta?.size || null
    }
    
    console.log('🛒 Agregando producto al carrito desde detalle:', cartProduct)
    addToCart(cartProduct)
    alert('¡Producto agregado al carrito exitosamente!')
    setCartOpen(true) // Abrir el carrito para mostrar el producto agregado
  }

  // Obtener todas las imágenes disponibles
  const getImagenesDisponibles = (): string[] => {
    if (varianteSeleccionada && varianteSeleccionada.images && varianteSeleccionada.images.length > 0) {
      return varianteSeleccionada.images.map(img => img.url);
    } else if (producto?.images && producto.images.length > 0) {
      return producto.images.map(img => img.url);
    }
    return producto?.main_image ? [producto.main_image] : [];
  }

  // Obtener la imagen principal a mostrar
  const getImagenPrincipal = (): string => {
    const imagenesDisponibles = getImagenesDisponibles();
    let imagenUrl = imagenesDisponibles[imagenPrincipalIndex] || imagenesDisponibles[0] || producto?.main_image || '';
    
    // Redimensionar imagen de Mercado Libre a 250x250 (un poco más grande)
    if (imagenUrl.includes('mlb-s1-p.mlstatic.com') || imagenUrl.includes('mlb-s2-p.mlstatic.com')) {
      // Reemplazar el tamaño en la URL (ML usa -I- para el tamaño)
      imagenUrl = imagenUrl.replace(/-I-[^-]*\./, '-I-250x250.');
    }
    
    return imagenUrl;
  }

  // Función para cambiar la imagen principal
  const handleImagenClick = (index: number) => {
    setImagenPrincipalIndex(index);
  }

  // Constantes para el carrusel de miniaturas
  const MINIATURAS_VISIBLES = 6
  
  // Funciones para navegar el carrusel de miniaturas
  const handlePrevMiniatura = () => {
    setMiniaturaStartIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextMiniatura = () => {
    const imagenesDisponibles = getImagenesDisponibles()
    const maxStart = Math.max(0, imagenesDisponibles.length - MINIATURAS_VISIBLES)
    setMiniaturaStartIndex(prev => Math.min(maxStart, prev + 1))
  }

  // Verificar si el producto está pausado
  const isProductPaused = producto?.status === 'paused'

  // Verificar si es producto de dropshipping
  const isDropshipping = producto?.tipo_venta === 'dropshipping'
  const diasPreparacion = producto?.dropshipping?.dias_preparacion || producto?.dias_preparacion || 0
  const diasEnvio = producto?.dropshipping?.dias_envio_estimado || producto?.dias_envio_estimado || 0
  const diasTotales = diasPreparacion + diasEnvio
  
  // 🔍 DEBUG: Verificar información de dropshipping
  if (producto) {
    console.log('🔍 DEBUG Producto:', {
      ml_id: producto.ml_id,
      title: producto.title,
      tipo_venta: producto.tipo_venta,
      isDropshipping: isDropshipping,
      diasPreparacion: diasPreparacion,
      diasEnvio: diasEnvio,
      diasTotales: diasTotales,
      dropshipping: producto.dropshipping
    })
  }

  // Calcular precio con descuento si está activo
  // Considerar descuento de ML: cuando hay descuento_ml, el producto.price ya viene rebajado de ML
  const tieneDescuentoML = !!producto?.descuento_ml?.original_price
  const tieneDescuento = producto?.descuento?.activo || false
  const porcentajeDescuento = producto?.descuento?.porcentaje || 0
  const precioBase = varianteSeleccionada?.price || producto?.price || 0
  // Si hay descuento manual, calcular sobre el precio base (que ya puede estar rebajado de ML si tieneDescuentoML)
  // Si solo hay descuento ML, el precio ya viene rebajado
  const precioConDescuento = tieneDescuento 
    ? Math.round(precioBase * (1 - porcentajeDescuento / 100) * 100) / 100 
    : precioBase
  const useUYU = false
  const conv = 1
  const displayPrice = useUYU ? Math.round(precioBase * conv * 100) / 100 : precioBase
  const displayDiscountPrice = useUYU ? Math.round(precioConDescuento * conv * 100) / 100 : precioConDescuento

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

  const params = useParams();
  const slug = (params as any).slug as string | undefined;
  const themeStyles = React.useMemo(() => {
    switch ((slug || '').toLowerCase()) {
      case 'halloween':
        return {
          background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
          color: '#fff',
        };
      case 'blackfriday':
        return {
          background: 'linear-gradient(135deg, #000000, #333333, #000000)',
          color: '#fff',
        };
      default:
        return {
          background: 'linear-gradient(135deg, var(--color-primary), #e08a00, var(--color-primary))',
          color: '#111',
        };
    }
  }, [slug]);

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

  // Preparar datos para SEO
  const getProductUrl = () => `https://mercado-libre-roan.vercel.app/producto/${id}`
  const getProductImage = () => getImagenPrincipal()
  const getProductDescription = () => {
    if (producto.description) {
      // Tomar solo los primeros 155 caracteres para la meta descripción
      return producto.description.substring(0, 155) + (producto.description.length > 155 ? '...' : '')
    }
    return `${producto.title} - Disponible en nuestra tienda virtual con envío a todo el país.`
  }

  const precioOriginalML = producto?.descuento_ml?.original_price;
  const precioOriginalMLString = precioOriginalML !== undefined && precioOriginalML !== null
    ? (useUYU
        ? `UYU ${(precioOriginalML * conv).toFixed(2)}`
        : `US$ ${precioOriginalML.toFixed(2)}`)
    : '—';

  const ahorroTexto = useUYU
    ? (precioOriginalML !== undefined && precioOriginalML !== null
        ? `¡Ahorras UYU ${(displayPrice - displayDiscountPrice).toFixed(2)}!`
        : '¡Ahorras UYU —!')
    : (precioOriginalML !== undefined && precioOriginalML !== null
        ? `¡Ahorras US$ ${(precioOriginalML - precioConDescuento).toFixed(2)}!`
        : `¡Ahorras US$ ${(precioBase - precioConDescuento).toFixed(2)}!`);

  return (
    <>
      {/* SEO Component - Metadatos dinámicos para cada producto */}
      <SEO
        title={`${producto.title} - Tienda Virtual`}
        description={getProductDescription()}
        keywords={`${producto.title}, ${producto.categoria || 'productos'}, comprar online, envío rápido`}
        image={getProductImage()}
        url={getProductUrl()}
        type="product"
        price={precioConDescuento}
        currency="USD"
        availability={getStockVariante() <= 0 || isProductPaused ? 'out of stock' : 'in stock'}
        productSchema={{
          name: producto.title,
          image: getProductImage(),
          description: producto.description || producto.title,
          price: precioConDescuento,
          currency: 'USD',
          availability: getStockVariante() <= 0 || isProductPaused ? 'out of stock' : 'in stock',
          brand: producto.attributes?.find((attr: any) => attr.name === 'Marca')?.value_name || 'Tienda Virtual',
          category: producto.categoria || 'general',
          sku: producto.ml_id || producto._id
        }}
      />

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
          <div className="imagen-container">
            <div className="imagen-producto">
              <img src={getImagenPrincipal()} alt={producto.title} />
            </div>

            {/* Galería de miniaturas con carrusel */}
            {getImagenesDisponibles().length > 1 && (
              <div className="galeria-miniaturas-container">
                {getImagenesDisponibles().length > MINIATURAS_VISIBLES && (
                  <button 
                    className="miniatura-nav-btn prev" 
                    onClick={handlePrevMiniatura}
                    disabled={miniaturaStartIndex === 0}
                    aria-label="Imágenes anteriores"
                  >
                    &#8249;
                  </button>
                )}
                
                <div className="galeria-miniaturas">
                  {getImagenesDisponibles()
                    .slice(miniaturaStartIndex, miniaturaStartIndex + MINIATURAS_VISIBLES)
                    .map((imagen, relativeIndex) => {
                      const absoluteIndex = miniaturaStartIndex + relativeIndex
                      return (
                        <div
                          key={absoluteIndex}
                          className={`miniatura ${imagenPrincipalIndex === absoluteIndex ? 'activa' : ''}`}
                          onClick={() => handleImagenClick(absoluteIndex)}
                        >
                          <img src={imagen} alt={`${producto.title} - imagen ${absoluteIndex + 1}`} />
                        </div>
                      )
                    })}
                </div>

                {getImagenesDisponibles().length > MINIATURAS_VISIBLES && (
                  <button 
                    className="miniatura-nav-btn next" 
                    onClick={handleNextMiniatura}
                    disabled={miniaturaStartIndex >= getImagenesDisponibles().length - MINIATURAS_VISIBLES}
                    aria-label="Imágenes siguientes"
                  >
                    &#8250;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="info-producto">
            {slug && (
              <div
                className="evento-banner"
                style={{
                  background: themeStyles.background,
                  color: themeStyles.color,
                  fontWeight: 700,
                  padding: '8px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.09)'
                }}
              >
                {slug.toLowerCase() === 'blackfriday'
                  ? '¡Promoción especial de BLACK FRIDAY!'
                  : slug.toLowerCase() === 'halloween'
                    ? '¡Promoción especial HALLOWEEN!'
                    : `Evento especial: ${slug}`}
              </div>
            )}
            <h1>{producto.title}</h1>
            
            {/* Mostrar badge de estado - prioridad: sin stock > pausado */}
            {getStockVariante() === 0 ? (
              <div className="product-status-badge sin-stock">
                <span>Sin Stock Disponible</span>
              </div>
            ) : isProductPaused ? (
              <div className="product-status-badge paused">
                <span>Producto Pausado</span>
              </div>
            ) : null}
            
            {producto.status === 'closed' && (
              <div className="product-status-badge cerrado">
                <span>Producto Cerrado en MercadoLibre</span>
              </div>
            )}

            {/* Mostrar solo días de preparación (sin sumar envío) */}
            {isDropshipping && diasPreparacion > 0 && (
              <div className="dropshipping-info">
                <div className="tiempo-entrega">
                  <h4>🚚 Tiempo de preparación: {diasPreparacion} días</h4>
                </div>
              </div>
            )}
            

          

              <div className="precio-disponibilidad">
                {tieneDescuento || tieneDescuentoML ? (
                  <div className="precio-con-descuento">
                    <div className="precio-descuento-header">
                      {tieneDescuento && porcentajeDescuento > 0 && (
                        <span className="badge-descuento">-{porcentajeDescuento}%</span>
                      )}
                      {tieneDescuentoML && producto?.descuento_ml?.original_price !== undefined && (
                        <p className="precio-original-tachado">{precioOriginalMLString}</p>
                      )}
                      {tieneDescuento && !tieneDescuentoML && (
                        <p className="precio-original-tachado">{useUYU ? `UYU ${displayPrice.toFixed(2)}` : `US$ ${precioBase.toFixed(2)}`}</p>
                      )}
                    </div>
                    <h2 className='h2-precio precio-rebajado'>{useUYU ? `UYU ${displayDiscountPrice.toFixed(2)}` : `US$ ${precioConDescuento.toFixed(2)}`}</h2>
                    {(tieneDescuento || tieneDescuentoML) && (
                      <p className="ahorro-texto">{ahorroTexto}</p>
                    )}
                  </div>
                ) : (
                  <h2 className='h2-precio'>{useUYU ? `UYU ${displayPrice.toFixed(2)}` : `US$ ${precioBase.toFixed(2)}`}</h2>
                )}
                {/* Solo mostrar disponibilidad si hay stock */}
                {getStockVariante() > 0 && (
                  <p className={`disponibilidad p-precio-detalle ${
                    isProductPaused ? 'paused' : 
                    getStockVariante() <= 5 ? 'poco-stock' : 
                    'available'
                  }`}>
                    {isProductPaused 
                      ? 'Producto pausado (con stock)'
                      : getStockVariante() <= 5 
                        ? `Últimas ${getStockVariante()} unidades`
                        : `Disponible (${getStockVariante()} unidades)`
                    }
                  </p>
                )}
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
                      <p>US$ {Number(variante.price).toFixed(2)}</p>
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


            {/* Descripción */}
            {producto.description && (
              <div className="descripcion">
                <h3>Descripción</h3>
                <div className="descripcion-texto">
                  {producto.description.split('\n').map((linea, index) => (
                    <p key={index}>{linea || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Garantía */}
            {producto.warranty && (
              <div className="garantia">
                <h3>Garantía</h3>
                <p>{producto.warranty}</p>
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

            {/* Botón de agregar al carrito */}
            <div className='flex gap-20'>
              <button
                className="btn-agregar-carrito"
                onClick={handleAgregarAlCarrito}
                disabled={getStockVariante() <= 0 || isProductPaused}
              >
                {getStockVariante() <= 0
                  ? 'Sin Stock' 
                  : isProductPaused 
                    ? 'Producto Pausado' 
                    : 'Agregar al Carrito'
                }
              </button>

              <button onClick={() => navigate('/tienda-ml')} className="btn-volver">
                Volver a la tienda
              </button>

              {/* Botón para ver en MercadoLibre - Solo si está activo */}
              {producto.permalink && producto.status !== 'closed' && producto.status !== 'inactive' && (
                <button 
                  onClick={() => window.open(producto.permalink, '_blank')}
                  className="btn-mercadolibre"
                  title="Ver publicación en MercadoLibre"
                >
                 Mercado Libre
                </button>
              )}
              
              {/* Mensaje si el producto está cerrado */}
              {producto.status === 'closed' && (
                <div className="producto-cerrado-info">
                  <p>Producto cerrado en MercadoLibre</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Características principales - Sección completa debajo */}
        {producto.attributes && producto.attributes.length > 0 && (
          <div className="caracteristicas-seccion-completa">
            <h3>Características del Producto</h3>
            <div className="lista-caracteristicas-grid">
              {producto.attributes.map((attr) => (
                <div key={attr.id} className="caracteristica-item-grid">
                  <span className="caracteristica-nombre">{attr.name}:</span>
                  <span className="caracteristica-valor">{attr.value_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default DetalleProductoPage
