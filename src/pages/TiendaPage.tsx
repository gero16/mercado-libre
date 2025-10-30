import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'
import Pagination from '../components/Pagination'
import '../styles/categoryFilter.css'
import '../styles/pagination.css'
import '../styles/tienda-improved.css'
import { productsCache } from '../services/productsCache'
import { MetricsService } from '../services/event'

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || PROD_BACKEND

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

// 🔧 Deduplicar publicaciones por catálogo (dejar solo canónica visible)
function dedupeProductsByCatalog(list: ProductoML[]): ProductoML[] {
  const groups = new Map<string, ProductoML[]>()
  const others: ProductoML[] = []
  for (const p of list) {
    if (p.catalog_product_id) {
      const arr = groups.get(p.catalog_product_id) || []
      arr.push(p)
      groups.set(p.catalog_product_id, arr)
    } else {
      others.push(p)
    }
  }
  const pick = (arr: ProductoML[]) => {
    return arr.sort((a, b) => {
      const score = (x: any) => ((x.status === 'active' ? 1e6 : x.status === 'paused' ? 1e5 : 0) + (Number(x.sold_quantity)||0)*1e3 + (Number(x.health)||0)*10 - (Number(x.price)||0))
      return score(b) - score(a)
    })[0]
  }
  const picked: ProductoML[] = []
  for (const [, arr] of groups) {
    picked.push(pick(arr))
  }
  return [...picked, ...others]
}

// 🔧 Deduplicar items de tienda por catálogo (usa productoPadre.catalog_product_id)
function dedupeItemsByCatalog(items: ItemTienda[]): ItemTienda[] {
  const groups = new Map<string, ItemTienda[]>()
  const others: ItemTienda[] = []
  for (const it of items) {
    const cat = it.productoPadre?.catalog_product_id
    if (cat) {
      const arr = groups.get(cat) || []
      arr.push(it)
      groups.set(cat, arr)
    } else {
      others.push(it)
    }
  }
  const score = (x: ItemTienda) => {
    const p: any = x.productoPadre
    return ((p?.status === 'active' ? 1e6 : p?.status === 'paused' ? 1e5 : 0)
      + (Number(p?.sold_quantity)||0)*1e3
      + (Number(p?.health)||0)*10
      - (Number(x.price)||0))
  }
  const picked: ItemTienda[] = []
  for (const [, arr] of groups) {
    picked.push(arr.sort((a,b)=>score(b)-score(a))[0])
  }
  return [...picked, ...others]
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Bloquear scroll del body cuando el overlay de filtros está abierto
  useEffect(() => {
    if (showMobileFilters) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [showMobileFilters])
  const [, setIsBackgroundLoading] = useState(false)

  // 🔎 Modo búsqueda en servidor (trae resultados de toda la BD)
  const [isServerSearch, setIsServerSearch] = useState(false)
  const [serverTotalItems, setServerTotalItems] = useState(0)
  const [isFetchingResults, setIsFetchingResults] = useState(false)
  // 🆕 Total global reportado por backend (independiente de la deduplicación local)
  const [allServerTotal, setAllServerTotal] = useState(0)
  
  const { addToCart } = useCart()

  // 🧪 Métricas Web Vitals + envío a backend
  useEffect(() => {
    try {
      if ('PerformanceObserver' in window) {
        let lcpValue: number | undefined
        let clsValue = 0
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).name === 'largest-contentful-paint') {
              lcpValue = entry.startTime
              console.log('📏 LCP:', Math.round(lcpValue), 'ms')
            }
            if (entry.entryType === 'layout-shift') {
              const ls = entry as any
              if (!ls.hadRecentInput) {
                clsValue += ls.value || 0
               
              }
            }
          }
        })
        try { po.observe({ type: 'largest-contentful-paint', buffered: true } as any) } catch {}
        try { po.observe({ type: 'layout-shift', buffered: true } as any) } catch {}

        const send = async () => {
          const measures: Array<{ name: string; duration: number }> = []
          try {
            const perf = performance.getEntriesByType('measure') as PerformanceMeasure[]
            for (const m of perf) measures.push({ name: m.name, duration: m.duration })
          } catch {}
          await MetricsService.sendPerf({
            page: 'tienda',
            lcp: typeof lcpValue === 'number' ? lcpValue : undefined,
            cls: clsValue,
            measures,
            url: typeof window !== 'undefined' ? window.location.href : undefined
          })
        }
        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') send()
        })
        window.addEventListener('pagehide', send)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Cargar categorías desde backend para alinear con el header
    const loadCategoriesFromBackend = async () => {
      try {
        const urlBase = `${API_BASE_URL}/ml/categories/distinct`
        const url1 = `${urlBase}?onlyActive=true&requireImage=true&onlyInStock=true&_ts=${Date.now()}`
        const res1 = await fetch(url1, { cache: 'no-store', headers: { Accept: 'application/json' } })
        const json1 = await res1.json()
        let cats: Array<{ category_id: string, count: number }> = Array.isArray(json1?.categories) ? json1.categories : []
        if (!cats.length) {
          const url2 = `${urlBase}?onlyActive=false&requireImage=true&onlyInStock=false&_ts=${Date.now()}`
          const res2 = await fetch(url2, { cache: 'no-store', headers: { Accept: 'application/json' } })
          const json2 = await res2.json()
          cats = Array.isArray(json2?.categories) ? json2.categories : []
        }
        const mapCount = new Map<string, number>()
        for (const c of cats) {
          const slug = (mapeoCategorias as any)[c.category_id] || 'otros'
          mapCount.set(slug, (mapCount.get(slug) || 0) + Number(c.count || 0))
        }
        const entries = Array.from(mapCount.entries()).map(([id, count]) => ({ id, count, name: obtenerNombreCategoria(id) }))
        entries.sort((a, b) => (b.count || 0) - (a.count || 0) || a.name.localeCompare(b.name))
        setCategorias([{ id: 'mostrar-todo', name: 'Mostrar Todo', count: entries.reduce((s, e) => s + (e.count || 0), 0) }, ...entries])
      } catch {
        // ignorar errores; la UI seguirá usando categorías derivadas de items
      }
    }
    loadCategoriesFromBackend()
  }, [])

  // 🆕 Obtener total global de items desde backend para mostrar conteo real
  useEffect(() => {
    (async () => {
      try {
        const res = await productsCache.getProductsPage({ limit: 1, offset: 0, status: 'all' }, /*preferNoFields*/ true)
        if (typeof res?.total === 'number') setAllServerTotal(res.total)
      } catch {}
    })()
  }, [])

  // Mantener contadores sincronizados con los items cargados (sin perder categorías del backend)
  useEffect(() => {
    const counts = new Map<string, number>()
    for (const item of itemsTienda) {
      const id = item.categoria || 'otros'
      counts.set(id, (counts.get(id) || 0) + 1)
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
    const existing = new Map(categorias.map(c => [c.id, c]))
    // Actualizar counts en existentes
    const updated: {id: string, name: string, count?: number}[] = []
    for (const c of categorias) {
      if (c.id === 'mostrar-todo') continue
      updated.push({ id: c.id, name: c.name, count: counts.get(c.id) || 0 })
    }
    // Agregar categorías nuevas detectadas en items y que no estaban
    for (const [id, count] of counts.entries()) {
      if (!existing.has(id)) {
        updated.push({ id, name: obtenerNombreCategoria(id), count })
      }
    }
    updated.sort((a, b) => (b.count || 0) - (a.count || 0) || a.name.localeCompare(b.name))
    setCategorias([{ id: 'mostrar-todo', name: 'Mostrar Todo', count: total }, ...updated])
  }, [itemsTienda])

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
      setIsFetchingResults(true)
      setIsChangingPage(true)
      setCategoryFilter(newCategory)
      setCurrentPage(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    // ⚡ Hacer búsqueda de servidor inmediata (sin debounce) para la categoría del navbar
    ;(async () => {
      try {
        setIsServerSearch(true)
        const { items, total } = await fetchServerSearch(1, itemsPerPage, '', newCategory)
        let filtered = items
        filtered = filtered.filter(i => i.price >= priceFilter)
        if (stockFilter) filtered = filtered.filter(i => i.stock > 0 && !i.isPaused)
        if (pedidoFilter) filtered = filtered.filter(i => i.productoPadre?.tipo_venta === 'dropshipping')
        setPaginatedItems(filtered)
        setServerTotalItems(Math.max(total, filtered.length))
        setTotalPages(Math.max(1, Math.ceil(Math.max(total, filtered.length) / itemsPerPage)))
      } catch (e) {
        console.error('❌ Error cargando categoría desde navbar:', e)
      } finally {
        setIsFetchingResults(false)
        setTimeout(() => setIsChangingPage(false), 200)
      }
    })()
    }
  }, [location.state])

  // 🆕 Función para optimizar imágenes de ML (usar versiones de mayor calidad para móvil grande)
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return url
    
    // Mercado Libre usa diferentes sufijos para tamaños:
    // -I.jpg = Original (muy grande, ~2-5MB)
    // -O.jpg = 500x500px (~200KB) ← Mejor para imágenes grandes en mobile 2-col
    // -V.jpg = 250x250px (~50KB)
    // -S.jpg = 150x150px (~20KB)
    
    // Para evitar pixelación con imágenes más grandes, usar -O.jpg
    if (url.match(/-[IOSV]\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/-[IOSV]\.(jpg|jpeg|png|webp)$/i, '-O.jpg')
    }
    
    // Si no tiene sufijo, intentar agregarlo antes de la extensión
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/\.(jpg|jpeg|png|webp)$/i, '-O.jpg')
    }
    
    // Si nada funciona, devolver URL original
    return url
  }

  // 🚀 Función para cargar productos con paginación del servidor
  const fetchProductsPaginated = async (limit: number, offset: number): Promise<ProductoML[]> => {
    try {
      console.log(`📡 Solicitando ${limit} productos (offset: ${offset}) desde servidor...`)
      const startFetch = performance.now()
      const FIELDS = [
        'ml_id','_id','title','price','images.url','main_image','available_quantity',
        'status','category_id','catalog_product_id','tipo_venta',
        'variantes.color','variantes.size','variantes.price','variantes.stock','variantes.images.url',
        'descuento','descuento_ml.original_price','sold_quantity','health'
      ].join(',')
      const { items } = await productsCache.getProductsPage({ limit, offset, fields: FIELDS, status: 'all' }, /*preferNoFields*/ false)
      const endFetch = performance.now()
      console.log(`✅ Servidor respondió en: ${(endFetch - startFetch).toFixed(0)}ms`)
      return Array.isArray(items) ? items : []
    } catch (error) {
      console.error('❌ Error cargando productos paginados:', error)
      return []
    }
  }

  // 🚀 Búsqueda completa en servidor (toma toda la DB usando q)
  const fetchServerSearch = async (page: number, perPage: number, query: string, categorySlug?: string): Promise<{ items: ItemTienda[], total: number }> => {
    const FIELDS = [
      'ml_id','_id','title','price','images.url','main_image','available_quantity',
      'status','category_id','catalog_product_id','tipo_venta',
      'variantes.color','variantes.size','variantes.price','variantes.stock','variantes.images.url',
      'descuento','descuento_ml.original_price','sold_quantity','health'
    ].join(',')
    const offset = (page - 1) * perPage
    try {
      // Si viene categoría general, traducir a categoryIds de ML y utilizar endpoint específico
      let productos: ProductoML[] = []
      let total = 0
      const ids = categorySlug && categorySlug !== 'mostrar-todo'
        ? Object.entries(mapeoCategorias).filter(([, slug]) => slug === categorySlug).map(([mlCat]) => mlCat)
        : []
      if (ids.length > 0) {
        // Si hay texto de búsqueda y categoría, usar endpoint general con ambos filtros (q + categoryIds)
        if (query && query.trim().length > 0) {
          const res = await productsCache.getProductsPage({ limit: perPage, offset, fields: FIELDS, status: 'all', q: query, categoryIds: ids }, /*preferNoFields*/ false)
          productos = res.items
          total = res.total
        } else {
          // Solo categoría, sin texto: usar endpoint específico por categorías
          const res = await productsCache.getProductsByCategories({ categoryIds: ids, limit: perPage, offset, fields: FIELDS, status: 'all' }, /*preferNoFields*/ false)
          productos = res.items
          total = res.total
        }
      } else {
        const res = await productsCache.getProductsPage({ limit: perPage, offset, fields: FIELDS, status: 'all', q: query }, /*preferNoFields*/ false)
        productos = res.items
        total = res.total
      }
      // Reusar lógica de construcción de items (versión compacta del bloque existente)
      const items: ItemTienda[] = []
      const list = dedupeProductsByCatalog(productos)
      list.forEach(producto => {
        const categoria = obtenerCategoria(producto.category_id)
        const isPaused = producto.status === 'paused'
        if (producto.variantes && producto.variantes.length > 0) {
          const variantesUnicas = producto.variantes.reduce((unique: Variante[], variante) => {
            if (!unique.some(v => v.color === variante.color)) unique.push(variante)
            return unique
          }, [])
          variantesUnicas.forEach(variante => {
            const imagenVariante = (variante.images && variante.images[0]?.url) || producto.images[0]?.url || producto.main_image
            const effectiveStock = isPaused ? 0 : producto.variantes.reduce((total, v) => total + v.stock, 0)
            const precioBase = variante.price || producto.price
            const tieneDescuento = producto.descuento?.activo || false
            const porcentaje = producto.descuento?.porcentaje || 0
            const precioConDescuento = tieneDescuento ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 : precioBase
            if (imagenVariante) {
              items.push({
                id: `${producto.ml_id || producto._id}_${variante.color}`,
                ml_id: producto.ml_id,
                title: `${producto.title} - ${variante.color || ''}`.trim(),
                price: precioConDescuento,
                image: getOptimizedImageUrl(imagenVariante),
                stock: effectiveStock,
                esVariante: true,
                variante,
                productoPadre: producto,
                categoria,
                isPaused
              })
            }
          })
        } else {
          const effectiveStock = isPaused ? 0 : producto.available_quantity
          const imagenPrincipal = producto.images[0]?.url || producto.main_image
          const precioBase = producto.price
          const tieneDescuento = producto.descuento?.activo || false
          const porcentaje = producto.descuento?.porcentaje || 0
          const precioConDescuento = tieneDescuento ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 : precioBase
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
              categoria,
              isPaused
            })
          }
        }
      })
      const itemsUnicos = dedupeItemsByCatalog(items)
      return { items: itemsUnicos, total }
    } catch (e) {
      console.error('❌ Error en búsqueda servidor:', e)
      return { items: [], total: 0 }
    }
  }

useEffect(() => {
  let mounted = true
  // ⚡ Si venimos desde el navbar con una categoría seleccionada, saltar la carga inicial pesada
  if ((location.state as any)?.categoryFilter) {
    setLoading(false)
    return () => { mounted = false }
  }
  const loadProducts = async () => {
      performance.mark('tienda:init:start')
      const startTime = performance.now()
      console.log('⏱️ Iniciando carga RÁPIDA (primeros 60 productos desde servidor)...')
      
      // 🚀 FASE 1: Cargar SOLO los primeros 60 productos desde el servidor (rápido)
      const first50Products = await fetchProductsPaginated(60, 0)
      const fetchTime = performance.now()
      console.log(`📡 Primeros 120 productos cargados en: ${(fetchTime - startTime).toFixed(0)}ms`)
      console.log('🔍 Total productos recibidos:', first50Products.length)
      
      console.log('⚡ Procesando primeros 120 productos para carga rápida...')
      // 🔧 Quitar duplicados por catálogo antes de construir items
      const productList = dedupeProductsByCatalog(first50Products)
      
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
      
      const itemsUnicos = dedupeItemsByCatalog(items)
      setItemsTienda(itemsUnicos)
      setFilteredItems(itemsUnicos)
      
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
      console.log(`✅ Carga INICIAL (60 productos) completada en: ${totalTime.toFixed(0)}ms`)
      console.log(`   - Fetch API: ${(fetchTime - startTime).toFixed(0)}ms`)
      console.log(`   - Procesamiento: ${(endTime - fetchTime).toFixed(0)}ms`)
      performance.mark('tienda:init:end')
      try { performance.measure('tienda:init', 'tienda:init:start', 'tienda:init:end') } catch {}
      
      if (!mounted) return
      setLoading(false)
      
      // 🔄 FASE 2: Cargar el resto en segundo plano (sin bloquear UI) DESDE EL SERVIDOR
      console.log(`🔄 Cargando productos restantes en segundo plano...`)
      performance.mark('tienda:bg:start')
      setIsBackgroundLoading(true)
      
      setTimeout(async () => {
        if (!mounted) return
        const backgroundStart = performance.now()
        
        // Cargar todos los productos restantes en lotes de 100
        let allRemainingProducts: ProductoML[] = []
        let currentOffset = 60
        const batchSize = 100
        let hasMore = true
        
        while (hasMore) {
          if (!mounted) break
          const batch = await fetchProductsPaginated(batchSize, currentOffset)
          
          if (batch.length === 0) {
            hasMore = false
            break
          }
          
          allRemainingProducts = [...allRemainingProducts, ...batch]
          currentOffset += batchSize
          
          console.log(`📦 Lote cargado: ${batch.length} productos (total acumulado: ${allRemainingProducts.length + 50})`)
          
          // Si recibimos menos productos que el batch size, ya no hay más
          if (batch.length < batchSize) {
            hasMore = false
          }
        }
        
        const remainingItems: ItemTienda[] = []
        
        // 🔧 Quitar duplicados por catálogo en el conjunto restante
        const uniqueRemaining = dedupeProductsByCatalog(allRemainingProducts)
        uniqueRemaining.forEach(producto => {
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
          
          // Deduplicar mezclando con los ya presentes
          const merged = dedupeItemsByCatalog([...(itemsTienda || []), ...remainingItems])
          if (mounted) {
            setItemsTienda(merged)
            setFilteredItems(merged)
          }

          const backgroundEnd = performance.now()
          console.log(`✅ Productos restantes cargados en: ${(backgroundEnd - backgroundStart).toFixed(0)}ms`)
          
          console.log(`🎉 TODOS los productos cargados (${allRemainingProducts.length + 50} total)`)
          setIsBackgroundLoading(false)
          performance.mark('tienda:bg:end')
          try { performance.measure('tienda:bg', 'tienda:bg:start', 'tienda:bg:end') } catch {}
        }, 100) // Pequeño delay para no bloquear UI
    }
    loadProducts()
    return () => { mounted = false }
  }, [])

  // Filtrar items y aplicar paginación (modo local)
  useEffect(() => {
    if (isServerSearch) return
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
    const localTotal = filtered.length
    const effectiveTotal = allServerTotal > 0 ? allServerTotal : localTotal
    const totalPagesCalculated = Math.ceil(effectiveTotal / itemsPerPage)
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
  }, [itemsTienda, searchQuery, categoryFilter, priceFilter, stockFilter, pedidoFilter, currentPage, itemsPerPage, isServerSearch, allServerTotal])

  // Debounce y carga de búsqueda/categoría modo servidor
  useEffect(() => {
    const q = searchQuery.trim()
    const useServer = q !== '' || (categoryFilter !== 'mostrar-todo')
    if (!useServer) {
      setIsServerSearch(false)
      setServerTotalItems(0)
      setCurrentPage(1)
      // 🛟 Fallback: si no hay datos locales (caso venir desde navbar con categoría), cargar inicial rápido
      if (itemsTienda.length === 0) {
        ;(async () => {
          try {
            setIsFetchingResults(true)
            const productos = await fetchProductsPaginated(120, 0)
            const list = dedupeProductsByCatalog(productos)
            const items: ItemTienda[] = []
            list.forEach(producto => {
              const categoria = obtenerCategoria(producto.category_id)
              const isPaused = producto.status === 'paused'
              if (producto.variantes && producto.variantes.length > 0) {
                const variantesUnicas = producto.variantes.reduce((unique: Variante[], variante) => {
                  if (!unique.some(v => v.color === variante.color)) unique.push(variante)
                  return unique
                }, [])
                variantesUnicas.forEach(variante => {
                  const imagenVariante = (variante.images && variante.images[0]?.url) || producto.images[0]?.url || producto.main_image
                  const effectiveStock = isPaused ? 0 : producto.variantes.reduce((total, v) => total + v.stock, 0)
                  const precioBase = variante.price || producto.price
                  const tieneDescuento = producto.descuento?.activo || false
                  const porcentaje = producto.descuento?.porcentaje || 0
                  const precioConDescuento = tieneDescuento ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 : precioBase
                  if (imagenVariante) {
                    items.push({
                      id: `${producto.ml_id || (producto as any)._id}_${variante.color}`,
                      ml_id: producto.ml_id,
                      title: `${producto.title} - ${variante.color || ''}`.trim(),
                      price: precioConDescuento,
                      image: getOptimizedImageUrl(imagenVariante),
                      stock: effectiveStock,
                      esVariante: true,
                      variante,
                      productoPadre: producto,
                      categoria,
                      isPaused
                    })
                  }
                })
              } else {
                const effectiveStock = isPaused ? 0 : producto.available_quantity
                const imagenPrincipal = producto.images[0]?.url || producto.main_image
                const precioBase = producto.price
                const tieneDescuento = producto.descuento?.activo || false
                const porcentaje = producto.descuento?.porcentaje || 0
                const precioConDescuento = tieneDescuento ? Math.round(precioBase * (1 - porcentaje / 100) * 100) / 100 : precioBase
                if (imagenPrincipal) {
                  items.push({
                    id: producto.ml_id || (producto as any)._id,
                    ml_id: producto.ml_id,
                    title: producto.title,
                    price: precioConDescuento,
                    image: getOptimizedImageUrl(imagenPrincipal),
                    stock: effectiveStock,
                    esVariante: false,
                    productoPadre: producto,
                    categoria,
                    isPaused
                  })
                }
              }
            })
            const itemsUnicos = dedupeItemsByCatalog(items)
            setItemsTienda(itemsUnicos)
            // Aplicar filtros locales activos
            let filtered = itemsUnicos
            filtered = filtered.filter(i => i.price >= priceFilter)
            if (stockFilter) filtered = filtered.filter(i => i.stock > 0 && !i.isPaused)
            if (pedidoFilter) filtered = filtered.filter(i => i.productoPadre?.tipo_venta === 'dropshipping')
            setFilteredItems(filtered)
            const totalItems = filtered.length
            const totalPagesCalculated = Math.max(1, Math.ceil(totalItems / itemsPerPage))
            setTotalPages(totalPagesCalculated)
            setPaginatedItems(filtered.slice(0, itemsPerPage))
          } catch (e) {
            console.error('❌ Error fallback cargar Mostrar Todo:', e)
          } finally {
            setIsFetchingResults(false)
          }
        })()
      }
      return
    }
    setIsServerSearch(true)
    let cancelled = false
    const handle = setTimeout(async () => {
      setIsFetchingResults(true)
      console.log('⏳ Cargando resultados (server search)...')
      // Si hay texto de búsqueda, ignorar categoría (buscar globalmente)
      const { items, total } = await fetchServerSearch(1, itemsPerPage, q, q ? undefined : categoryFilter)
      // Aplicar filtros adicionales sobre resultados del servidor si están activos
      let filtered = items
      if (q === '' && categoryFilter !== 'mostrar-todo') filtered = filtered.filter(i => i.categoria === categoryFilter)
      filtered = filtered.filter(i => i.price >= priceFilter)
      if (stockFilter) filtered = filtered.filter(i => i.stock > 0 && !i.isPaused)
      if (pedidoFilter) filtered = filtered.filter(i => i.productoPadre?.tipo_venta === 'dropshipping')
      if (!cancelled) {
        setPaginatedItems(filtered)
        const totalCalc = Math.max(total, filtered.length)
        setServerTotalItems(totalCalc)
        setTotalPages(Math.max(1, Math.ceil(totalCalc / itemsPerPage)))
        setCurrentPage(1)
        setIsFetchingResults(false)
      }
    }, 300)
    return () => { cancelled = true; clearTimeout(handle); setIsFetchingResults(false) }
  }, [searchQuery, itemsPerPage, categoryFilter, priceFilter, stockFilter, pedidoFilter, itemsTienda])

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
    setIsFetchingResults(true)
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
    setIsFetchingResults(true)
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
    // Si estamos en modo servidor (o forzamos para mostrar todo), cargar la página solicitada
    if (isServerSearch || (searchQuery.trim() === '' && categoryFilter === 'mostrar-todo')) {
      if (!isServerSearch) setIsServerSearch(true)
      setIsFetchingResults(true)
      console.log('⏳ Paginando (server)...')
      const q = searchQuery.trim()
      fetchServerSearch(page, itemsPerPage, q, q ? undefined : categoryFilter).then(({ items, total }) => {
        let filtered = items
        if (q === '' && categoryFilter !== 'mostrar-todo') filtered = filtered.filter(i => i.categoria === categoryFilter)
        filtered = filtered.filter(i => i.price >= priceFilter)
        if (stockFilter) filtered = filtered.filter(i => i.stock > 0 && !i.isPaused)
        if (pedidoFilter) filtered = filtered.filter(i => i.productoPadre?.tipo_venta === 'dropshipping')
        setPaginatedItems(filtered)
        const totalCalc = Math.max(total || 0, filtered.length)
        setServerTotalItems(totalCalc)
        setTotalPages(Math.max(1, Math.ceil(totalCalc / itemsPerPage)))
      }).finally(() => setIsFetchingResults(false))
    }
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset a la primera página
    // Forzar modo servidor al cambiar a páginas grandes aun en "Mostrar Todo"
    if (!isServerSearch && categoryFilter === 'mostrar-todo' && searchQuery.trim() === '') {
      setIsServerSearch(true)
    }
    if (isServerSearch || (searchQuery.trim() === '' && categoryFilter === 'mostrar-todo')) {
      setIsFetchingResults(true)
      console.log('⏳ Cambiando items por página (server)...')
      const q = searchQuery.trim()
      fetchServerSearch(1, items, q, q ? undefined : categoryFilter).then(({ items: list, total }) => {
        let filtered = list
        if (q === '' && categoryFilter !== 'mostrar-todo') filtered = filtered.filter(i => i.categoria === categoryFilter)
        filtered = filtered.filter(i => i.price >= priceFilter)
        if (stockFilter) filtered = filtered.filter(i => i.stock > 0 && !i.isPaused)
        if (pedidoFilter) filtered = filtered.filter(i => i.productoPadre?.tipo_venta === 'dropshipping')
        setPaginatedItems(filtered)
        const totalCalc = Math.max(total, filtered.length)
        setTotalPages(Math.max(1, Math.ceil(totalCalc / items)))
      }).finally(() => setIsFetchingResults(false))
    }
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
        {/* Botón filtros (móvil) */}
        <div className="filtros-toggle-btn">
          <button
            onClick={() => setShowMobileFilters(true)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ☰ Filtros
          </button>
        </div>

        {/* Filtros laterales (ocultos en móvil por CSS) */}
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
                    {(isServerSearch ? serverTotalItems : filteredItems.length) > 0 
                      ? `${(isServerSearch ? serverTotalItems : filteredItems.length)} resultado${(isServerSearch ? serverTotalItems : filteredItems.length) !== 1 ? 's' : ''}`
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

        {/* Overlay de filtros en móvil */}
        {showMobileFilters && (
          <div className="filtros-overlay">
            <div className="filtros-overlay-header">
              <h3 style={{ margin: 0 }}>Filtros</h3>
              <button className="filtros-overlay-close" onClick={() => setShowMobileFilters(false)}>Cerrar</button>
            </div>
            <div className="filtros-overlay-content">
              {/* Duplicamos los mismos controles del panel lateral */}
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

              <section className="centrar-texto" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3 className="precios-titulo">Buscar Productos</h3>
                <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
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
                  />
                </div>
              </section>

              {/* Toggles compactos en una misma fila */}
              <div className="mobile-toggle-row">
                <div className={`toggle-chip ${stockFilter ? 'active' : ''}`} onClick={() => setStockFilter(!stockFilter)}>
                  <input type="checkbox" id="stock-filter-m" checked={stockFilter} onChange={(e)=>setStockFilter(e.target.checked)} onClick={(e)=>e.stopPropagation()} />
                  <label htmlFor="stock-filter-m">📦 En stock</label>
                </div>
                <div className={`toggle-chip ${pedidoFilter ? 'active' : ''}`} onClick={() => setPedidoFilter(!pedidoFilter)}>
                  <input type="checkbox" id="pedido-filter-m" checked={pedidoFilter} onChange={(e)=>setPedidoFilter(e.target.checked)} onClick={(e)=>e.stopPropagation()} />
                  <label htmlFor="pedido-filter-m">🚚 A pedido</label>
                </div>
              </div>

              <section className="filtro-categorias centrar-texto">
                <div className="categorias-grid">
                  {categorias.map(category => (
                    <div key={category.id} className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`} onClick={() => handleCategoryFilter(category.id)} style={{ cursor: 'pointer' }}>
                      {category.id !== 'mostrar-todo' && (
                        <span className="categoria-icono">{iconosCategoriasGenerales[category.id]}</span>
                      )}
                      <span className="categoria-nombre">{category.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="filtros-overlay-footer">
              <button className="filtros-overlay-apply-btn" onClick={() => setShowMobileFilters(false)}>Aplicar filtros</button>
            </div>
          </div>
        )}

        {/* Items de la tienda */}
        <div className="productos" style={{ position: 'relative', minHeight: (isFetchingResults || isChangingPage) ? 300 : undefined }}>
          {(isFetchingResults || isChangingPage) ? (
            <ProductSkeleton count={8} />
          ) : (
            <>
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
                      width={250}
                      height={250}
                      style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '1 / 0.82',
                        objectFit: 'cover',
                        display: 'block',
                        willChange: 'auto'
                      }}
                    />
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.2', margin: '6px 0 4px 0' }}>{item.title}</p>
                    
                    {/* Quitar cartel gris inferior; solo mantener badges superiores */}
                    
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: '5px',
                      margin: '6px 0 4px 0'
                    }}>
                      {(tieneDescuento && precioOriginal) || tieneDescuentoML ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          flexWrap: 'wrap',
                          justifyContent: 'center'
                        }}>
                          <p style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontSize: '0.85rem',
                            margin: '0',
                            lineHeight: '1'
                          }}>
                            US$ {tieneDescuentoML ? precioOriginalML?.toFixed(2) : precioOriginal}
                          </p>
                          <p style={{ 
                            color: '#d32f2f',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            margin: '0',
                            lineHeight: '1'
                          }}>
                            US$ {item.price}
                          </p>
                        </div>
                      ) : (
                        <p style={{ margin: '0', fontSize: '0.95rem' }}>US$ {item.price}</p>
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
              
              {paginatedItems.length === 0 && !isChangingPage && !isFetchingResults && (
                <div className="centrar-texto">
                  <p>No se encontraron productos con los filtros seleccionados.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 🚀 Controles de paginación */}
        {(isServerSearch ? serverTotalItems : (allServerTotal || filteredItems.length)) > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={isServerSearch ? serverTotalItems : (allServerTotal || filteredItems.length)}
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
