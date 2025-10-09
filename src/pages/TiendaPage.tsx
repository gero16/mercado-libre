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
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(
    (location.state as any)?.categoryFilter || 'mostrar-todo'
  )
  const [loading, setLoading] = useState(true)
  const [categorias, setCategorias] = useState<{id: string, name: string, count?: number}[]>([
    { id: 'mostrar-todo', name: 'Mostrar Todo' }
  ])
  
  // 🚀 Estados para paginación (24 items para carga inicial más rápida)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedItems, setPaginatedItems] = useState<ItemTienda[]>([])
  const [isChangingPage, setIsChangingPage] = useState(false)
  
  const { addToCart } = useCart()

  // 🆕 Función para optimizar imágenes de ML (usar versiones más pequeñas)
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return url
    
    // Mercado Libre usa diferentes sufijos para tamaños:
    // -I.jpg = Original (muy grande, ~2-5MB)
    // -O.jpg = 500x500px (~200KB)
    // -V.jpg = 250x250px (~50KB) ← Perfecto para tienda
    // -S.jpg = 150x150px (~20KB)
    
    // Intentar reemplazar cualquier sufijo por -V.jpg
    if (url.match(/-[IOSV]\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/-[IOSV]\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
    }
    
    // Si no tiene sufijo, intentar agregarlo antes de la extensión
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
    }
    
    // Si nada funciona, devolver URL original
    return url
  }

  // 🚀 Función para cargar productos con paginación del servidor
  const fetchProductsPaginated = async (limit: number, skip: number): Promise<ProductoML[]> => {
    try {
      console.log(`📡 Solicitando ${limit} productos (skip: ${skip}) desde servidor...`)
      const startFetch = performance.now()
      
      const response = await fetch(
        `https://poppy-shop-production.up.railway.app/ml/productos?limit=${limit}&skip=${skip}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          keepalive: true
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const endFetch = performance.now()
      
      console.log(`✅ Servidor respondió en: ${(endFetch - startFetch).toFixed(0)}ms`)
      
      // La respuesta ahora viene con metadata de paginación
      if (data.productos) {
        console.log(`📊 Paginación - Total en DB: ${data.pagination.total}, Página actual: ${data.pagination.page}/${data.pagination.totalPages}`)
        return data.productos
      }
      
      // Fallback por si el servidor devuelve array directo (compatibilidad)
      if (Array.isArray(data)) {
        return data
      }
      
      return []
    } catch (error) {
      console.error('❌ Error cargando productos paginados:', error)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      const startTime = performance.now()
      console.log('⏱️ Iniciando carga RÁPIDA (primeros 50 productos desde servidor)...')
      
      // 🚀 FASE 1: Cargar SOLO los primeros 50 productos desde el servidor (SÚPER RÁPIDO)
      const first50Products = await fetchProductsPaginated(50, 0)
      const fetchTime = performance.now()
      console.log(`📡 Primeros 50 productos cargados en: ${(fetchTime - startTime).toFixed(0)}ms`)
      console.log('🔍 Total productos recibidos:', first50Products.length)
      
      console.log('⚡ Procesando primeros 50 productos para carga rápida...')
      const productList = first50Products
      
      // Procesar productos para crear items únicos para la tienda
      const items: ItemTienda[] = []
      
      productList.forEach(producto => {
        const categoria = obtenerCategoria(producto.category_id)
        const isPaused = producto.status === 'paused'
        
        // 🔍 DEBUG: Log para verificar el status
       // console.log(`🔍 Producto: ${producto.title}, Status: "${producto.status}", isPaused: ${isPaused}`)
        
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
            
            // Solo agregar si tiene imagen
            if (imagenVariante) {
              items.push({
                id: `${producto.ml_id || producto._id}_${variante.color}`,
                ml_id: producto.ml_id,
                title: `${producto.title} - ${variante.color || ''}`.trim(),
                price: variante.price || producto.price,
                image: getOptimizedImageUrl(imagenVariante),
                stock: effectiveStock,
                esVariante: true,
                variante: variante,
                productoPadre: producto,
                categoria: categoria,
                isPaused: isPaused
              })
            }
          })
        } else {
          // Si no tiene variantes, mostramos el producto principal
          // Si el producto está pausado, el stock efectivo es 0
          const effectiveStock = isPaused ? 0 : producto.available_quantity;
          const imagenPrincipal = producto.images[0]?.url || producto.main_image;
          
          // Solo agregar si tiene imagen
          if (imagenPrincipal) {
            items.push({
              id: producto.ml_id || producto._id,
                ml_id: producto.ml_id,
              title: producto.title,
              price: producto.price,
              image: getOptimizedImageUrl(imagenPrincipal),
              stock: effectiveStock,
              esVariante: false,
              productoPadre: producto,
              categoria: categoria,
              isPaused: isPaused
            })
          }
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
        ...categoriasFiltro
      ])
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      console.log(`✅ Carga INICIAL (50 productos) completada en: ${totalTime.toFixed(0)}ms`)
      console.log(`   - Fetch API: ${(fetchTime - startTime).toFixed(0)}ms`)
      console.log(`   - Procesamiento: ${(endTime - fetchTime).toFixed(0)}ms`)
      
      setLoading(false)
      
      // 🔄 FASE 2: Cargar el resto en segundo plano (sin bloquear UI) DESDE EL SERVIDOR
      console.log(`🔄 Cargando productos restantes en segundo plano...`)
      
      setTimeout(async () => {
        const backgroundStart = performance.now()
        
        // Cargar todos los productos restantes en lotes de 100
        let allRemainingProducts: ProductoML[] = []
        let currentSkip = 50
        const batchSize = 100
        let hasMore = true
        
        while (hasMore) {
          const batch = await fetchProductsPaginated(batchSize, currentSkip)
          
          if (batch.length === 0) {
            hasMore = false
            break
          }
          
          allRemainingProducts = [...allRemainingProducts, ...batch]
          currentSkip += batchSize
          
          console.log(`📦 Lote cargado: ${batch.length} productos (total acumulado: ${allRemainingProducts.length + 50})`)
          
          // Si recibimos menos productos que el batch size, ya no hay más
          if (batch.length < batchSize) {
            hasMore = false
          }
        }
        
        const remainingItems: ItemTienda[] = []
        
        allRemainingProducts.forEach(producto => {
            const categoria = obtenerCategoria(producto.category_id)
            const isPaused = producto.status === 'paused'
            
            if (producto.variantes && producto.variantes.length > 0) {
              const variantesUnicas = producto.variantes.reduce((unique: Variante[], variante) => {
                if (!unique.some(v => v.color === variante.color)) {
                  unique.push(variante);
                }
                return unique;
              }, []);
              
              variantesUnicas.forEach(variante => {
                const imagenVariante = variante.images && variante.images.length > 0 
                  ? variante.images[0].url 
                  : producto.images[0]?.url || producto.main_image;
                
                const effectiveStock = isPaused ? 0 : producto.variantes.reduce((total, v) => total + v.stock, 0);
                
                if (imagenVariante) {
                  remainingItems.push({
                    id: `${producto.ml_id || producto._id}_${variante.color}`,
                    ml_id: producto.ml_id,
                    title: `${producto.title} - ${variante.color || ''}`.trim(),
                    price: variante.price || producto.price,
                    image: getOptimizedImageUrl(imagenVariante),
                    stock: effectiveStock,
                    esVariante: true,
                    variante: variante,
                    productoPadre: producto,
                    categoria: categoria,
                    isPaused: isPaused
                  })
                }
              })
            } else {
              const effectiveStock = isPaused ? 0 : producto.available_quantity;
              const imagenPrincipal = producto.images[0]?.url || producto.main_image;
              
              if (imagenPrincipal) {
                remainingItems.push({
                  id: producto.ml_id || producto._id,
                  ml_id: producto.ml_id,
                  title: producto.title,
                  price: producto.price,
                  image: getOptimizedImageUrl(imagenPrincipal),
                  stock: effectiveStock,
                  esVariante: false,
                  productoPadre: producto,
                  categoria: categoria,
                  isPaused: isPaused
                })
              }
            }
          })
          
          const backgroundEnd = performance.now()
          console.log(`✅ Productos restantes cargados en: ${(backgroundEnd - backgroundStart).toFixed(0)}ms`)
          
          setItemsTienda(prev => [...prev, ...remainingItems])
          setFilteredItems(prev => [...prev, ...remainingItems])
          
          console.log(`🎉 TODOS los productos cargados (${allRemainingProducts.length + 50} total)`)
        }, 100) // Pequeño delay para no bloquear UI
    }
    loadProducts()
  }, [])

  // Filtrar items y aplicar paginación
  useEffect(() => {
    let filtered = itemsTienda

    // Filtro por búsqueda de texto
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query)
      )
    }

    // Filtro por categoría
    if (categoryFilter !== 'mostrar-todo') {
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
  }, [itemsTienda, searchQuery, categoryFilter, priceFilter, currentPage, itemsPerPage])

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset a la primera página cuando se busca
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
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
                  <div className="categorias-grid">
                    {categorias.map(category => (
                      <div 
                        key={category.id}
                        className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                        onClick={() => handleCategoryFilter(category.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {category.id !== 'mostrar-todo' && (
                          <span className="categoria-icono">{iconosCategoriasGenerales[category.id]}</span>
                        )}
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

              {/* Buscador */}
              <section className="centrar-texto" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3 className="precios-titulo">Buscar Productos</h3>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  marginTop: '10px'
                }}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 35px 10px 12px',
                      fontSize: '14px',
                      border: '2px solid #ddd',
                      borderRadius: '20px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 4px 12px rgba(254, 159, 1, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ddd'
                      e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#999',
                        padding: '0 5px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div style={{
                    marginTop: '8px',
                    color: '#666',
                    fontSize: '12px'
                  }}>
                    {filteredItems.length > 0 
                      ? `${filteredItems.length} resultado${filteredItems.length !== 1 ? 's' : ''}`
                      : 'Sin resultados'
                    }
                  </div>
                )}
              </section>

              <section className="filtro-categorias centrar-texto">
                <div className="categorias-grid">
                  {categorias.map(category => (
                    <div 
                      key={category.id}
                      className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {category.id !== 'mostrar-todo' && (
                        <span className="categoria-icono">{iconosCategoriasGenerales[category.id]}</span>
                      )}
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

          {paginatedItems.map(item => {
            const tieneDescuento = item.productoPadre?.descuento?.activo
            const precioOriginal = item.productoPadre?.descuento?.precio_original
            const porcentajeDescuento = item.productoPadre?.descuento?.porcentaje
            
            return (
              <div 
                key={item.id}
                className="producto centrar-texto"
                onClick={() => handleProductClick(item)}
                style={{ 
                  cursor: 'pointer',
                  opacity: isChangingPage ? 0.5 : 1,
                  transition: 'opacity 0.3s ease',
                  position: 'relative'
                }}
              >
                {tieneDescuento && porcentajeDescuento && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '25px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
                    zIndex: 2
                  }}>
                    -{porcentajeDescuento}%
                  </div>
                )}
                <img 
                  src={item.image} 
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    willChange: 'auto'
                  }}
                />
                <p>{item.title}</p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '5px',
                  margin: '10px 0'
                }}>
                  {tieneDescuento && precioOriginal ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      <p style={{ 
                        textDecoration: 'line-through', 
                        color: '#999',
                        fontSize: '1rem',
                        margin: '0',
                        lineHeight: '1'
                      }}>
                        US$ {precioOriginal}
                      </p>
                      <p style={{ 
                        color: '#d32f2f',
                        fontWeight: '700',
                        fontSize: '1rem',
                        margin: '0',
                        lineHeight: '1'
                      }}>
                        US$ {item.price}
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: '0' }}>US$ {item.price}</p>
                  )}
                </div>
                <button 
                  className="add"
                  onClick={(e) => handleAddToCart(e, item)}
                  disabled={item.stock <= 0 || item.isPaused}
                >
                  {item.isPaused ? 'Pausado' : item.stock <= 0 ? 'Sin Stock' : 'Agregar Carrito'}
                </button>
              </div>
            )
          })}
          
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
