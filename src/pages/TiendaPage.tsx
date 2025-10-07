import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'
import Pagination from '../components/Pagination'
import '../styles/categoryFilter.css'
import '../styles/pagination.css'
import '../styles/tienda-improved.css'

// Mapeo de categorías de ML a categorías GENERALES
const mapeoCategorias: Record<string, string> = {
  // 📱 ELECTRÓNICA Y TECNOLOGÍA
  'MLU163646': 'electronica',
  'MLU163764': 'electronica',
  'MLU163765': 'electronica',
  'MLU163771': 'electronica',
  'MLU168248': 'electronica',
  'MLU3697': 'electronica',
  'MLU409415': 'electronica',
  'MLU5072': 'electronica',
  'MLU1055': 'electronica',
  'MLU1442': 'electronica',
  'MLU117113': 'electronica',
  'MLU36566': 'electronica',
  'MLU71938': 'electronica',
  'MLU10553': 'electronica',
  'MLU116559': 'electronica',
  'MLU4075': 'electronica',
  'MLU12953': 'electronica',
  'MLU14407': 'electronica',
  'MLU1676': 'electronica',
  'MLU431680': 'electronica',
  'MLU434342': 'electronica',
  'MLU5549': 'electronica',
  'MLU1915': 'electronica',
  'MLU443772': 'electronica',
  'MLU1155': 'electronica',
  'MLU1658': 'electronica',
  'MLU1717': 'electronica',
  'MLU195437': 'electronica',
  'MLU372999': 'electronica',
  'MLU188198': 'electronica',
  'MLU32605': 'electronica',
  'MLU413515': 'electronica',
  'MLU413564': 'electronica',
  'MLU429735': 'electronica',
  'MLU455057': 'electronica',
  'MLU455839': 'electronica',
  'MLU9914': 'electronica',
  'MLU176997': 'electronica',
  'MLU178391': 'electronica',
  'MLU165337': 'electronica',
  'MLU70969': 'electronica',
  'MLU6336': 'electronica',
  
  // 🎮 GAMING
  'MLU6344': 'gaming',
  'MLU443628': 'gaming',
  'MLU448172': 'gaming',
  'MLU443741': 'gaming',
  'MLU10858': 'gaming',
  'MLU11898': 'gaming',
  'MLU443583': 'gaming',
  'MLU439534': 'gaming',
  'MLU448173': 'gaming',
  
  // 🏠 HOGAR Y DECORACIÓN
  'MLU12201': 'hogar',
  'MLU7969': 'hogar',
  'MLU40398': 'hogar',
  'MLU205198': 'hogar',
  'MLU43687': 'hogar',
  'MLU442888': 'hogar',
  'MLU442952': 'hogar',
  'MLU416658': 'hogar',
  'MLU436268': 'hogar',
  'MLU456110': 'hogar',
  'MLU186068': 'hogar',
  'MLU438004': 'hogar',
  'MLU177716': 'hogar',
  'MLU457532': 'hogar',
  'MLU388628': 'hogar',
  'MLU387931': 'hogar',
  'MLU400173': 'hogar',
  'MLU413493': 'hogar',
  'MLU414208': 'hogar',
  'MLU168223': 'hogar',
  
  // 🍳 COCINA
  'MLU442710': 'cocina',
  'MLU196263': 'cocina',
  'MLU416585': 'cocina',
  'MLU414038': 'cocina',
  'MLU442747': 'cocina',
  'MLU442751': 'cocina',
  'MLU455144': 'cocina',
  'MLU74887': 'cocina',
  'MLU74925': 'cocina',
  'MLU412348': 'cocina',
  
  // 👶 BEBÉS Y NIÑOS
  'MLU178390': 'bebes-ninos',
  'MLU443005': 'bebes-ninos',
  'MLU412585': 'bebes-ninos',
  'MLU187852': 'bebes-ninos',
  'MLU443022': 'bebes-ninos',
  'MLU443133': 'bebes-ninos',
  'MLU1889': 'bebes-ninos',
  'MLU40629': 'bebes-ninos',
  'MLU457852': 'bebes-ninos',
  'MLU429242': 'bebes-ninos',
  
  // 🎒 ACCESORIOS Y MOCHILAS
  'MLU190994': 'accesorios',
  'MLU442981': 'accesorios',
  'MLU187975': 'accesorios',
  'MLU26538': 'accesorios',
  'MLU158838': 'accesorios',
  'MLU434789': 'accesorios',
  
  // 🚁 DRONES Y FOTOGRAFÍA
  'MLU178089': 'drones-foto',
  'MLU413447': 'drones-foto',
  'MLU413635': 'drones-foto',
  'MLU430406': 'drones-foto',
  'MLU413444': 'drones-foto',
  'MLU414123': 'drones-foto',
  'MLU1042': 'drones-foto',
  
  // 🏋️ DEPORTES Y FITNESS
  'MLU165701': 'deportes',
  'MLU165785': 'deportes',
  'MLU413593': 'deportes',
  'MLU206537': 'deportes',
  
  // 🎭 JUGUETES Y COLECCIONABLES
  'MLU176854': 'juguetes-coleccionables',
  'MLU455859': 'juguetes-coleccionables',
  'MLU412670': 'juguetes-coleccionables',
  
  // 🐾 MASCOTAS
  'MLU159067': 'mascotas',
  'MLU435781': 'mascotas',
  'MLU443444': 'mascotas',
  
  // 🔧 HERRAMIENTAS Y OTROS
  'MLU5824': 'otros',
  'MLU70061': 'otros',
  'MLU172030': 'otros',
  'MLU202844': 'otros',
  'MLU379647': 'otros',
  'MLU4702': 'otros',
  'MLU52047': 'otros',
  'MLU443331': 'otros',
  'MLU443332': 'otros',
  'MLU457091': 'otros',
}

// Nombres legibles de categorías GENERALES con iconos
const nombresCategoriasGenerales: Record<string, string> = {
  'electronica': 'Electrónica y Tecnología',
  'gaming': 'Gaming',
  'hogar': 'Hogar y Decoración',
  'cocina': 'Cocina',
  'bebes-ninos': 'Bebés y Niños',
  'accesorios': 'Accesorios',
  'drones-foto': 'Drones y Fotografía',
  'deportes': 'Deportes y Fitness',
  'juguetes-coleccionables': 'Juguetes y Coleccionables',
  'mascotas': 'Mascotas',
  'otros': 'Otros',
}

// Iconos para cada categoría
const iconosCategoriasGenerales: Record<string, string> = {
  'electronica': '📱',
  'gaming': '🎮',
  'hogar': '🏠',
  'cocina': '🍳',
  'bebes-ninos': '👶',
  'accesorios': '🎒',
  'drones-foto': '🚁',
  'deportes': '🏋️',
  'juguetes-coleccionables': '🎭',
  'mascotas': '🐾',
  'otros': '🔧',
}

// Función para obtener categoría general
const obtenerCategoria = (categoryId: string | undefined): string => {
  if (!categoryId) return 'otros'
  return mapeoCategorias[categoryId] || 'otros'
}

// Función para obtener nombre legible de categoría general
const obtenerNombreCategoria = (categorySlug: string): string => {
  return nombresCategoriasGenerales[categorySlug] || 'Otros'
}

// Interfaz para items a mostrar
interface ItemTienda {
  id: string;
  ml_id?: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  esVariante: boolean;
  variante?: Variante;
  productoPadre?: ProductoML;
  categoria?: string;
  isPaused: boolean;
}

const TiendaMLPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [itemsTienda, setItemsTienda] = useState<ItemTienda[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemTienda[]>([])
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(
    (location.state as any)?.categoryFilter || 'mostrar-todo'
  )
  const [loading, setLoading] = useState(true)
  const [categorias, setCategorias] = useState<{id: string, name: string, count?: number}[]>([
    { id: 'mostrar-todo', name: 'Mostrar Todo' },
    { id: 'destacados', name: '⭐ Productos Destacados' },
    { id: 'mas-vendidos', name: '🏆 Más Vendidos' },
    { id: 'con-descuento', name: '🔥 Con Descuento' }
  ])
  
  // 🚀 Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedItems, setPaginatedItems] = useState<ItemTienda[]>([])
  const [isChangingPage, setIsChangingPage] = useState(false)
  
  const { addToCart } = useCart()

  // Fetch productos de Mercado Libre desde el backend
  const fetchProducts = async (): Promise<ProductoML[]> => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
      const data = await response.json()
      console.log('🔍 Productos recibidos:', data)
      return data || []
    } catch (error) {
      console.error('Error fetching ML products:', error)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      const productList = await fetchProducts()
      
      // Procesar productos para crear items únicos para la tienda
      const items: ItemTienda[] = []
      
      productList.forEach(producto => {
        const categoria = obtenerCategoria(producto.category_id)
        const isPaused = producto.status === 'paused'
        
        // 🔍 DEBUG: Log para verificar el status
        console.log(`🔍 Producto: ${producto.title}, Status: "${producto.status}", isPaused: ${isPaused}`)
        
        // Si el producto tiene variantes, mostramos solo la primera variante de cada combinación única
        if (producto.variantes && producto.variantes.length > 0) {
          // Agrupar variantes por color para evitar duplicados
          const variantesUnicas = producto.variantes.reduce((unique: Variante[], variante) => {
            if (!unique.some(v => v.color === variante.color)) {
              unique.push(variante);
            }
            return unique;
          }, []);
          
          // Usar solo la primera variante de cada color
          variantesUnicas.forEach(variante => {
            const imagenVariante = variante.images && variante.images.length > 0 
              ? variante.images[0].url 
              : producto.images[0]?.url || producto.main_image;
            
            // Si el producto está pausado, el stock efectivo es 0
            const effectiveStock = isPaused ? 0 : producto.variantes.reduce((total, v) => total + v.stock, 0);
            
            items.push({
              id: `${producto.ml_id || producto._id}_${variante.color}`,
              ml_id: producto.ml_id,
              title: `${producto.title} - ${variante.color || ''}`.trim(),
              price: variante.price || producto.price,
              image: imagenVariante,
              stock: effectiveStock,
              esVariante: true,
              variante: variante,
              productoPadre: producto,
              categoria: categoria,
              isPaused: isPaused
            })
          })
        } else {
          // Si no tiene variantes, mostramos el producto principal
          // Si el producto está pausado, el stock efectivo es 0
          const effectiveStock = isPaused ? 0 : producto.available_quantity;
          
          items.push({
            id: producto.ml_id || producto._id,
              ml_id: producto.ml_id,
            title: producto.title,
            price: producto.price,
            image: producto.images[0]?.url || producto.main_image,
            stock: effectiveStock,
            esVariante: false,
            productoPadre: producto,
            categoria: categoria,
            isPaused: isPaused
          })
        }
      })
      
      // 🔍 DEBUG: Log para verificar items procesados
      console.log('🔍 Items procesados:', items.map(item => ({
        title: item.title,
        isPaused: item.isPaused,
        stock: item.stock,
        status: item.productoPadre?.status
      })))
      
      setItemsTienda(items)
      setFilteredItems(items)
      
      // Extraer categorías únicas de los items con contadores
      const categoriasMap = new Map<string, number>()
      items.forEach(item => {
        if (item.categoria) {
          categoriasMap.set(item.categoria, (categoriasMap.get(item.categoria) || 0) + 1)
        }
      })
      
      // Crear array de categorías para el filtro con nombres legibles y contadores
      const categoriasFiltro = Array.from(categoriasMap.entries()).map(([cat, count]) => ({
        id: cat,
        name: obtenerNombreCategoria(cat),
        count: count
      }))
      
      // Ordenar por cantidad de productos
      categoriasFiltro.sort((a, b) => (b.count || 0) - (a.count || 0))
      
      setCategorias([
        { id: 'mostrar-todo', name: 'Mostrar Todo' },
        { id: 'destacados', name: '⭐ Productos Destacados' },
        { id: 'mas-vendidos', name: '🏆 Más Vendidos' },
        { id: 'con-descuento', name: '🔥 Con Descuento' },
        ...categoriasFiltro
      ])
      
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Filtrar items y aplicar paginación
  useEffect(() => {
    let filtered = itemsTienda

    // Filtros especiales
    if (categoryFilter === 'destacados') {
      // Productos destacados: basado en score combinado (visitas, rating, reseñas, health)
      const calcularScore = (item: ItemTienda) => {
        const producto = item.productoPadre
        if (!producto) return 0
        
        const visitas = producto.metrics?.visits || 0
        const rating = producto.metrics?.reviews.rating_average || 0
        const totalReseñas = producto.metrics?.reviews.total || 0
        const health = producto.health || 0
        
        return (visitas * 0.3) + (rating * 10) + (totalReseñas * 3) + (health * 5)
      }
      
      filtered = filtered
        .filter(item => item.productoPadre?.status !== 'paused')
        .map(item => ({ ...item, score: calcularScore(item) }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 50) // Top 50 destacados
    } 
    else if (categoryFilter === 'mas-vendidos') {
      // Productos más vendidos: ordenados por cantidad vendida
      filtered = filtered
        .filter(item => item.productoPadre?.status !== 'paused' && (item.productoPadre?.sold_quantity || 0) > 0)
        .sort((a, b) => (b.productoPadre?.sold_quantity || 0) - (a.productoPadre?.sold_quantity || 0))
        .slice(0, 50) // Top 50 más vendidos
    }
    else if (categoryFilter === 'con-descuento') {
      // Productos con descuento: filtrar por productos que tengan descuento
      filtered = filtered.filter(item => {
        const producto = item.productoPadre
        return producto?.status !== 'paused' && 
               producto?.original_price && 
               producto.original_price > producto.price
      })
    }
    else if (categoryFilter !== 'mostrar-todo') {
      // Filtro por categoría normal
      filtered = filtered.filter(item => item.categoria === categoryFilter)
    }

    // Filtro por precio
    filtered = filtered.filter(item => item.price >= priceFilter)

    setFilteredItems(filtered)
    
    // 🚀 Calcular paginación
    const totalItems = filtered.length
    const totalPagesCalculated = Math.ceil(totalItems / itemsPerPage)
    setTotalPages(totalPagesCalculated)
    
    // 🚀 Ajustar página actual si es necesario
    if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
      setCurrentPage(1)
    }
    
    // 🚀 Obtener items para la página actual
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const itemsForCurrentPage = filtered.slice(startIndex, endIndex)
    
    setPaginatedItems(itemsForCurrentPage)
  }, [itemsTienda, categoryFilter, priceFilter, currentPage, itemsPerPage])

  const handleProductClick = (item: ItemTienda) => {
    // Usar ml_id en lugar de _id para buscar el producto
    const productId = item.productoPadre?.ml_id || item.ml_id || item.id
    navigate(`/producto/${productId}`)
  }

  const handleAddToCart = (e: React.MouseEvent, item: ItemTienda) => {
    e.stopPropagation()
    
    // 🔍 DEBUG: Log para verificar qué está pasando
    console.log('�� Intentando agregar al carrito:', {
      title: item.title,
      isPaused: item.isPaused,
      stock: item.stock,
      status: item.productoPadre?.status
    })
    
    // ✅ VALIDACIÓN: No permitir agregar productos pausados
    if (item.isPaused) {
      console.log('🚫 Producto pausado detectado, bloqueando agregar al carrito')
      alert('Este producto está pausado y no se puede agregar al carrito.')
      return
    }
    
    // ✅ VALIDACIÓN: No permitir agregar productos sin stock
    if (item.stock <= 0) {
      console.log('🚫 Producto sin stock detectado, bloqueando agregar al carrito')
      alert('Este producto no tiene stock disponible.')
      return
    }
    
    console.log('✅ Producto válido, agregando al carrito')
    
    const cartProduct = {
      id: item.id, // Ahora es string
      name: item.title,
      image: item.image,
      category: item.categoria || 'general',
      price: item.price,
      stock: item.stock,
      cantidad: 1,
      color: item.variante?.color,
      size: item.variante?.size
    }
    
    addToCart(cartProduct)
  }

  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId)
  }

  const handlePriceFilter = (price: number) => {
    setPriceFilter(price)
  }

  // 🚀 Funciones para manejar paginación
  const handlePageChange = (page: number) => {
    setIsChangingPage(true)
    setCurrentPage(page)
    // Scroll hacia arriba cuando cambies de página
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Simular un pequeño delay para mostrar el indicador de carga
    setTimeout(() => {
      setIsChangingPage(false)
    }, 300)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset a la primera página
  }


  if (loading) {
    return (
      <main className="container">
        <section className="pagina-principal">
          {/* Filtros */}
          <div className="div-filtros">
            <div className="filtro">
              <div className="lista-filtro">
                <section className="precios centrar-texto">
                  <h3 className="precios-titulo">Filtrar por Precios</h3>
                  <div className="div-precios">
                    <div className="precio-principal">
                      <label htmlFor="precio"></label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1500" 
                        value={priceFilter} 
                        className="" 
                        id="input-precio"
                        onChange={(e) => handlePriceFilter(Number(e.target.value))}
                      />
                      <span id="mostrar-precio">${priceFilter}</span>
                    </div>
                  </div>
                </section>

                <section className="filtro-categorias centrar-texto">
                  <div className="categorias-grid-especial">
                    {categorias.filter(cat => ['mostrar-todo', 'destacados', 'mas-vendidos', 'con-descuento'].includes(cat.id)).map(category => (
                      <div 
                        key={category.id}
                        className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                        onClick={() => handleCategoryFilter(category.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="categoria-nombre">{category.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="categorias-grid" style={{ marginTop: '12px' }}>
                    {categorias.filter(cat => !['mostrar-todo', 'destacados', 'mas-vendidos', 'con-descuento'].includes(cat.id)).map(category => (
                      <div 
                        key={category.id}
                        className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                        onClick={() => handleCategoryFilter(category.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="categoria-icono">{iconosCategoriasGenerales[category.id]}</span>
                        <span className="categoria-nombre">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Skeleton loader para productos */}
          <div className="productos">
            <ProductSkeleton count={8} />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="container">
      <section className="pagina-principal">
        {/* Filtros */}
        <div className="div-filtros">
          <div className="filtro">
            <div className="lista-filtro">
              <section className="precios centrar-texto">
                <h3 className="precios-titulo">Filtrar por Precios</h3>
                <div className="div-precios">
                  <div className="precio-principal">
                    <label htmlFor="precio"></label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1500" 
                      value={priceFilter} 
                      className="input-precio" 
                      id="input-precio"
                      onChange={(e) => handlePriceFilter(Number(e.target.value))}
                    />
                    <span id="mostrar-precio">${priceFilter}</span>
                  </div>
                </div>
              </section>

              <section className="filtro-categorias centrar-texto">
                <div className="categorias-grid-especial">
                  {categorias.filter(cat => ['mostrar-todo', 'destacados', 'mas-vendidos', 'con-descuento'].includes(cat.id)).map(category => (
                    <div 
                      key={category.id}
                      className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="categoria-nombre">{category.name}</span>
                    </div>
                  ))}
                </div>

                <div className="categorias-grid" style={{ marginTop: '12px' }}>
                  {categorias.filter(cat => !['mostrar-todo', 'destacados', 'mas-vendidos', 'con-descuento'].includes(cat.id)).map(category => (
                    <div 
                      key={category.id}
                      className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="categoria-icono">{iconosCategoriasGenerales[category.id]}</span>
                      <span className="categoria-nombre">{category.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Items de la tienda */}
        <div className="productos" style={{ position: 'relative' }}>
          {/* Indicador de carga cuando se cambia de página */}
          {isChangingPage && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Cargando productos...</span>
            </div>
          )}

          {paginatedItems.map(item => (
            <div 
              key={item.id}
              className="producto centrar-texto"
              onClick={() => handleProductClick(item)}
              style={{ 
                cursor: 'pointer',
                opacity: isChangingPage ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <img src={item.image} alt={item.title} />
              <p>{item.title}</p>
              <p>${item.price}</p>
              {/* 🔍 DEBUG: Mostrar información de debug en el botón */}
              <button 
                className="add"
                onClick={(e) => handleAddToCart(e, item)}
                disabled={item.stock <= 0 || item.isPaused}
                title={`Debug: isPaused=${item.isPaused}, stock=${item.stock}, status=${item.productoPadre?.status}`}
              >
                {item.isPaused ? 'Pausado' : item.stock <= 0 ? 'Sin Stock' : 'Agregar Carrito'}
              </button>
            </div>
          ))}
          
          {paginatedItems.length === 0 && !isChangingPage && (
            <div className="centrar-texto">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* 🚀 Controles de paginación */}
        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </section>
    </main>
  )
}

export default TiendaMLPage
