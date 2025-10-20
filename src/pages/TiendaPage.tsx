import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'
import Pagination from '../components/Pagination'
import '../styles/categoryFilter.css'
import '../styles/pagination.css'
import '../styles/tienda-improved.css'

// Mapeo de categorías de ML a categorías GENERALES
const mapeoCategorias: Record<string, string> = {
  // 📚 E-READERS Y KINDLE
  'MLU163646': 'ereaders',
  'MLU163764': 'ereaders',
  'MLU163765': 'ereaders',
  'MLU163771': 'ereaders',
  
  // 🎵 AUDIO Y PARLANTES
  'MLU168248': 'audio-parlantes',
  'MLU3697': 'audio-parlantes',
  'MLU5072': 'audio-parlantes',
  'MLU4075': 'audio-parlantes',
  'MLU116559': 'audio-parlantes',
  
  // ⌚ SMARTWATCHES
  'MLU117113': 'smartwatches',
  'MLU1442': 'smartwatches',
  'MLU431680': 'smartwatches',
  
  // 🏠 ASISTENTES VIRTUALES
  'MLU409415': 'asistentes-virtuales',
  
  // 🔔 SEGURIDAD HOGAR
  'MLU36566': 'seguridad-hogar',
  'MLU71938': 'seguridad-hogar',
  'MLU10553': 'seguridad-hogar',
  
  // 💾 MEMORIAS Y ALMACENAMIENTO
  'MLU70969': 'memorias-storage',
  'MLU6336': 'memorias-storage',
  
  // 📱 ELECTRÓNICA Y TECNOLOGÍA (resto)
  'MLU1055': 'electronica',
  'MLU12953': 'electronica',
  'MLU14407': 'electronica',
  'MLU1676': 'electronica',
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
  'MLU1152': 'gaming',
  
  // 🏕️ CAMPING Y OUTDOOR
  'MLU12201': 'camping-outdoor',
  'MLU400173': 'camping-outdoor',
  
  // 😴 DESCANSO Y ALMOHADAS
  'MLU7969': 'descanso-almohadas',
  'MLU438004': 'descanso-almohadas',
  'MLU436268': 'descanso-almohadas',
  'MLU456110': 'descanso-almohadas',
  'MLU186068': 'descanso-almohadas',
  
  // 🔇 MÁQUINAS RUIDO BLANCO Y RELAJACIÓN
  'MLU40398': 'hogar',
  
  // 🏠 HOGAR Y DECORACIÓN (resto)
  'MLU205198': 'hogar',
  'MLU43687': 'hogar',
  'MLU442888': 'hogar',
  'MLU442952': 'hogar',
  'MLU416658': 'hogar',
  'MLU177716': 'hogar',
  'MLU457532': 'hogar',
  'MLU388628': 'hogar',
  'MLU387931': 'hogar',
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
  
  // 🎴 TARJETAS COLECCIONABLES
  'MLU442981': 'tarjetas-coleccionables',
  
  // 🎒 MOCHILAS Y BOLSOS
  'MLU190994': 'mochilas-bolsos',
  'MLU26538': 'mochilas-bolsos',
  
  // ✏️ ACCESORIOS (resto)
  'MLU187975': 'accesorios',
  'MLU158838': 'accesorios',
  'MLU434789': 'accesorios',
  'MLU163766': 'accesorios',
  
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
  
  // 🗡️ FIGURAS DE ACCIÓN
  'MLU176854': 'figuras-accion',
  'MLU110854': 'figuras-accion',
  
  // 🪄 HARRY POTTER Y COLECCIONABLES
  'MLU455859': 'harry-potter',
  'MLU412670': 'harry-potter',
  
  // 🐾 MASCOTAS
  'MLU159067': 'mascotas',
  'MLU435781': 'mascotas',
  'MLU443444': 'mascotas',
  
  // 🏊 PISCINA Y JARDÍN
  'MLU172030': 'piscina-jardin',
  
  // 💇 CUIDADO PERSONAL
  'MLU70061': 'cuidado-personal',
  'MLU381270': 'cuidado-personal',
  
  // 🔧 HERRAMIENTAS
  'MLU5824': 'herramientas',
  'MLU457091': 'herramientas',
  'MLU202844': 'herramientas',
  
  // 🎵 AUDIO Y MÚSICA
  'MLU52047': 'audio-musica',
  'MLU442785': 'audio-musica',
  
  // 🔭 CIENCIA Y EDUCACIÓN
  'MLU4702': 'ciencia-educacion',
  
  // 🥋 ARTES MARCIALES
  'MLU443331': 'artes-marciales',
  'MLU443332': 'artes-marciales',
  
  // 🔧 OTROS
  'MLU379647': 'otros',
}

// Nombres legibles de categorías GENERALES con iconos
const nombresCategoriasGenerales: Record<string, string> = {
  'ereaders': 'E-readers y Kindle',
  'audio-parlantes': 'Audio y Parlantes',
  'smartwatches': 'Smartwatches',
  'asistentes-virtuales': 'Asistentes Virtuales',
  'seguridad-hogar': 'Seguridad Hogar',
  'memorias-storage': 'Memorias y Almacenamiento',
  'electronica': 'Electrónica',
  'gaming': 'Gaming',
  'camping-outdoor': 'Camping y Outdoor',
  'descanso-almohadas': 'Descanso y Almohadas',
  'hogar': 'Hogar',
  'cocina': 'Cocina',
  'bebes-ninos': 'Bebés y Niños',
  'tarjetas-coleccionables': 'Tarjetas Coleccionables',
  'mochilas-bolsos': 'Mochilas y Bolsos',
  'accesorios': 'Accesorios',
  'drones-foto': 'Drones y Fotografía',
  'deportes': 'Deportes y Fitness',
  'figuras-accion': 'Figuras de Acción',
  'harry-potter': 'Harry Potter',
  'mascotas': 'Mascotas',
  'piscina-jardin': 'Piscina y Jardín',
  'cuidado-personal': 'Cuidado Personal',
  'herramientas': 'Herramientas',
  'audio-musica': 'Audio y Música',
  'ciencia-educacion': 'Ciencia y Educación',
  'artes-marciales': 'Artes Marciales',
  'otros': 'Otros',
}

// Iconos para cada categoría
const iconosCategoriasGenerales: Record<string, string> = {
  'ereaders': '📚',
  'audio-parlantes': '🎵',
  'smartwatches': '⌚',
  'asistentes-virtuales': '🏠',
  'seguridad-hogar': '🔔',
  'memorias-storage': '💾',
  'electronica': '📱',
  'gaming': '🎮',
  'camping-outdoor': '🏕️',
  'descanso-almohadas': '😴',
  'hogar': '🏠',
  'cocina': '🍳',
  'bebes-ninos': '👶',
  'tarjetas-coleccionables': '🎴',
  'mochilas-bolsos': '🎒',
  'accesorios': '✏️',
  'drones-foto': '🚁',
  'deportes': '🏋️',
  'figuras-accion': '🗡️',
  'harry-potter': '🪄',
  'mascotas': '🐾',
  'piscina-jardin': '🏊',
  'cuidado-personal': '💇',
  'herramientas': '🔧',
  'audio-musica': '🎵',
  'ciencia-educacion': '🔭',
  'artes-marciales': '🥋',
  'otros': '📦',
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
  const [searchParams] = useSearchParams()
  
  // Obtener término de búsqueda de la URL si existe
  const urlSearchQuery = searchParams.get('search') || ''
  
  const [itemsTienda, setItemsTienda] = useState<ItemTienda[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemTienda[]>([])
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery)
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState(
    (location.state as any)?.categoryFilter || 'mostrar-todo'
  )
  const [stockFilter, setStockFilter] = useState(false)
  const [pedidoFilter, setPedidoFilter] = useState(false)
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

  // 🔍 Efecto para actualizar searchQuery cuando cambie el parámetro de la URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
      setCurrentPage(1) // Reset a la primera página cuando se busca desde el navbar
    }
  }, [searchParams])

  // 🆕 Mostrar loader cuando cambia la categoría desde el navbar (location.state)
  useEffect(() => {
    const newCategory = (location.state as any)?.categoryFilter
    if (newCategory && newCategory !== categoryFilter) {
      setIsChangingPage(true)
      setCategoryFilter(newCategory)
      setCurrentPage(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setIsChangingPage(false), 300)
    }
  }, [location.state])

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
            
            // Calcular precio con descuento si está activo
            const precioBase = variante.price || producto.price;
            const tieneDescuento = producto.descuento?.activo || false;
            const porcentaje = producto.descuento?.porcentaje || 0;
            const precioConDescuento = tieneDescuento 
              ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 
              : precioBase;
            
            // Solo agregar si tiene imagen
            if (imagenVariante) {
              items.push({
                id: `${producto.ml_id || producto._id}_${variante.color}`,
                ml_id: producto.ml_id,
                title: `${producto.title} - ${variante.color || ''}`.trim(),
                price: precioConDescuento,
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
          
          // Calcular precio con descuento si está activo
          const precioBase = producto.price;
          const tieneDescuento = producto.descuento?.activo || false;
          const porcentaje = producto.descuento?.porcentaje || 0;
          const precioConDescuento = tieneDescuento 
            ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 
            : precioBase;
          
          // Solo agregar si tiene imagen
          if (imagenPrincipal) {
            items.push({
              id: producto.ml_id || producto._id,
                ml_id: producto.ml_id,
              title: producto.title,
              price: precioConDescuento,
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
                
                // Calcular precio con descuento si está activo
                const precioBase = variante.price || producto.price;
                const tieneDescuento = producto.descuento?.activo || false;
                const porcentaje = producto.descuento?.porcentaje || 0;
                const precioConDescuento = tieneDescuento ? precioBase * (1 - porcentaje / 100) : precioBase;
                
                if (imagenVariante) {
                  remainingItems.push({
                    id: `${producto.ml_id || producto._id}_${variante.color}`,
                    ml_id: producto.ml_id,
                    title: `${producto.title} - ${variante.color || ''}`.trim(),
                    price: precioConDescuento,
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
              
              // Calcular precio con descuento si está activo
              const precioBase = producto.price;
              const tieneDescuento = producto.descuento?.activo || false;
              const porcentaje = producto.descuento?.porcentaje || 0;
              const precioConDescuento = tieneDescuento ? precioBase * (1 - porcentaje / 100) : precioBase;
              
              if (imagenPrincipal) {
                remainingItems.push({
                  id: producto.ml_id || producto._id,
                  ml_id: producto.ml_id,
                  title: producto.title,
                  price: precioConDescuento,
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

    const normalize = (s: string) => s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

    // Filtro por búsqueda de texto
    if (searchQuery.trim() !== '') {
      const query = normalize(searchQuery)
      filtered = filtered.filter(item => {
        const titleNorm = normalize(item.title)
        return titleNorm.includes(query)
      })
    }

    // Filtro por categoría
    if (categoryFilter !== 'mostrar-todo') {
      filtered = filtered.filter(item => item.categoria === categoryFilter)
    }

    // Filtro por precio
    filtered = filtered.filter(item => item.price >= priceFilter)

    // Filtro por stock
    if (stockFilter) {
      filtered = filtered.filter(item => item.stock > 0 && !item.isPaused)
    }

    // Filtro por productos a pedido (dropshipping)
    if (pedidoFilter) {
      filtered = filtered.filter(item => item.productoPadre?.tipo_venta === 'dropshipping')
    }

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
  }, [itemsTienda, searchQuery, categoryFilter, priceFilter, stockFilter, pedidoFilter, currentPage, itemsPerPage])

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
    setIsChangingPage(true)
    setCategoryFilter(categoryId)
    setCurrentPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setIsChangingPage(false), 300)
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
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 35px 10px 12px',
                        fontSize: '14px',
                        border: '2px solid #ddd',
                        borderRadius: '20px',
                        outline: 'none',
                        backgroundColor: '#f5f5f5',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </section>

              {/* Filtro de Stock */}
              <section className="centrar-texto" style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    id="stock-filter-loading"
                    checked={stockFilter}
                    disabled
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'not-allowed'
                    }}
                  />
                  <label 
                    htmlFor="stock-filter-loading" 
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      userSelect: 'none',
                      color: '#333'
                    }}
                  >
                    📦 Solo productos en stock
                  </label>
                </div>
              </section>

              {/* Filtro de Productos a Pedido */}
              <section className="centrar-texto" style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    id="pedido-filter-loading"
                    checked={pedidoFilter}
                    disabled
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'not-allowed'
                    }}
                  />
                  <label 
                    htmlFor="pedido-filter-loading" 
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      userSelect: 'none',
                      color: '#333'
                    }}
                  >
                    🚚 Solo productos a pedido
                  </label>
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

              {/* Filtro de Stock */}
              <section className="centrar-texto" style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: stockFilter ? '2px solid var(--color-primary)' : '2px solid transparent',
                  boxShadow: stockFilter ? '0 4px 12px rgba(254, 159, 1, 0.2)' : 'none'
                }}
                onClick={() => setStockFilter(!stockFilter)}
                >
                  <input
                    type="checkbox"
                    id="stock-filter"
                    checked={stockFilter}
                    onChange={(e) => setStockFilter(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label 
                    htmlFor="stock-filter" 
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      userSelect: 'none',
                      color: stockFilter ? 'var(--color-primary)' : '#333'
                    }}
                  >
                    📦 Solo productos en stock
                  </label>
                </div>
              </section>

              {/* Filtro de Productos a Pedido */}
              <section className="centrar-texto" style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: pedidoFilter ? '2px solid var(--color-primary)' : '2px solid transparent',
                  boxShadow: pedidoFilter ? '0 4px 12px rgba(254, 159, 1, 0.2)' : 'none'
                }}
                onClick={() => setPedidoFilter(!pedidoFilter)}
                >
                  <input
                    type="checkbox"
                    id="pedido-filter"
                    checked={pedidoFilter}
                    onChange={(e) => setPedidoFilter(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label 
                    htmlFor="pedido-filter" 
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      userSelect: 'none',
                      color: pedidoFilter ? 'var(--color-primary)' : '#333'
                    }}
                  >
                    🚚 Solo productos a pedido
                  </label>
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
            // Descuento de MercadoLibre
            const tieneDescuentoML = !!item.productoPadre?.descuento_ml?.original_price
            const precioOriginalML = item.productoPadre?.descuento_ml?.original_price
            const porcentajeDescuentoML = precioOriginalML 
              ? Math.round(((precioOriginalML - item.price) / precioOriginalML) * 100)
              : 0
            const productoCerrado = item.productoPadre?.status === 'closed'
            const sinStock = item.stock === 0
            
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
                {(tieneDescuento && porcentajeDescuento || tieneDescuentoML) && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: tieneDescuentoML 
                      ? 'linear-gradient(135deg, #FFE600 0%, #FFC300 100%)' // Amarillo de MercadoLibre
                      : 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)', // Rojo para descuentos web
                    color: tieneDescuentoML ? '#000' : 'white',
                    padding: '8px 15px',
                    borderRadius: '25px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    boxShadow: tieneDescuentoML 
                      ? '0 4px 15px rgba(255, 230, 0, 0.4)'
                      : '0 4px 15px rgba(211, 47, 47, 0.4)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {tieneDescuentoML && <span style={{ fontSize: '0.85rem' }}>ML</span>}
                    -{tieneDescuentoML ? porcentajeDescuentoML : porcentajeDescuento}%
                  </div>
                )}
                
                {productoCerrado && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    boxShadow: '0 3px 10px rgba(30, 41, 59, 0.4)',
                    zIndex: 2
                  }}>
                    CERRADO
                  </div>
                )}
                
                {!productoCerrado && sinStock && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#1a1a1a',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    boxShadow: '0 3px 10px rgba(251, 191, 36, 0.4)',
                    zIndex: 2
                  }}>
                    SIN STOCK
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
                
                {/* Quitar cartel gris inferior; solo mantener badges superiores */}
                
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '5px',
                  margin: '10px 0'
                }}>
                  {(tieneDescuento && precioOriginal) || tieneDescuentoML ? (
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
                        US$ {tieneDescuentoML ? precioOriginalML?.toFixed(2) : precioOriginal}
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
                {/* Ocultar botón cuando no se puede comprar; mantener solo badges superiores */}
                {!(productoCerrado || item.stock <= 0 || item.isPaused) && (
                  <button 
                    className="add"
                    onClick={(e) => handleAddToCart(e, item)}
                  >
                    Agregar Carrito
                  </button>
                )}
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
