import React, { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import Loader from '../components/Loader'
import { EventService } from '../services/event'
import { AuthService } from '../services/auth'
import { productsCache } from '../services/productsCache'
import { API_BASE_URL } from '../config/api'
import { fetchCensus, fetchDuplicates, type CensusResponse } from '../services/diagnostics'

// Interfaz para items de administración
interface AdminItem {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  esVariante: boolean;
  variante?: Variante;
  productoPadre?: ProductoML;
  categoria?: string;
  productId: string;
  variantId?: string;
  status: string;
  isPaused: boolean;
  // Nuevas propiedades
  tieneVariantes?: boolean;
  stockTotalVariantes?: number;
  tipoEntrega?: 'dropshipping' | 'stock_fisico';
  // Propiedades de tiempo de entrega
  dias_preparacion?: number;
  dias_envio_estimado?: number;
  tiempo_total_entrega?: number;
  es_entrega_larga?: boolean; // > 14 días
  es_stock_fisico?: boolean; // Flex o entrega 1-7 días
  proveedor?: string;
  pais_origen?: string;
  destacado?: boolean;  // 🆕 Campo para productos destacados
}

// Optimiza URLs de imágenes de ML a la variante V (más liviana)
const getOptimizedImageUrl = (url?: string) => {
  if (!url) return url as any
  if (url.match(/-[IOSV]\.(jpg|jpeg|png|webp)$/i)) {
    return url.replace(/-[IOSV]\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
  }
  if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return url.replace(/\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
  }
  return url
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const [adminItems, setAdminItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'products' | 'variants'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'fast' | 'slow'>('all')
  const [filterDestacado, setFilterDestacado] = useState<'all' | 'destacados' | 'no-destacados'>('all')  // 🆕 Filtro de destacados
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'delivery'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // 🆕 Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  // 🆕 Métricas de censo/duplicados
  const [census, setCensus] = useState<CensusResponse | null>(null)
  const [dupExcess, setDupExcess] = useState<number | null>(null)

  // Config paginación servidor
  const [serverTotal, setServerTotal] = useState(0)
  const [serverLimit, setServerLimit] = useState(60)
  const [serverOffset, setServerOffset] = useState(0)
  const [serverLoading, setServerLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null)
  

  const SERVER_FIELDS = 'ml_id,title,price,available_quantity,status,images,main_image,category_id,shipping,tipo_venta,dropshipping.dias_preparacion,dropshipping.dias_envio_estimado,dias_preparacion,dias_envio_estimado,proveedor,pais_origen,destacado,seller_sku,variantes,variantes.tipo_venta,variantes.dropshipping.dias_preparacion,variantes.dropshipping.dias_envio_estimado'

  // Normalización básica para búsqueda insensible a acentos/espacios
  const normalize = (s: string) => {
    let input = String(s || '')
    try {
      // Permitir que el usuario pegue cadenas con %20 u otros encodes
      input = decodeURIComponent(input)
    } catch {}
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[_-]+/g, ' ')            // guiones como espacio
      .replace(/\s+/g, ' ')             // colapsar espacios
      .trim()
  }

  // Extraer mapeo a nivel de componente para reutilizar en múltiples cargas
  const buildItemsFromProduct = (producto: ProductoML): AdminItem[] => {
    const isPaused = producto.status === 'paused'
    let totalVariantsStock = 0
    if (Array.isArray(producto.variantes) && producto.variantes.length > 0) {
      totalVariantsStock = (producto.variantes as any[])
        .map(v => (typeof v?.stock === 'number' ? v.stock : 0))
        .reduce((sum, n) => sum + n, 0)
    }
    // Calcular stock efectivo primero (usado más abajo)
    const effectiveStock = (producto.variantes && producto.variantes.length > 0)
      ? totalVariantsStock
      : producto.available_quantity

    const diasPreparacion = producto.dropshipping?.dias_preparacion || producto.dias_preparacion || 0
    const diasEnvio = producto.dropshipping?.dias_envio_estimado || producto.dias_envio_estimado || 0
    const tiempoTotalEntrega = diasPreparacion + diasEnvio
    const tipoVentaProd = (producto as any).tipo_venta as ('stock_fisico'|'dropshipping'|'mixto'|undefined)
    // Stock físico: solo Self Service/Fulfillment sin preparación y con stock
    const isSelfService = (producto.shipping?.logistic_type === 'self_service' || producto.shipping?.logistic_type === 'fulfillment')
    const sinPreparacion = (producto.dropshipping?.dias_preparacion || producto.dias_preparacion || 0) === 0
    const hasAnyStock = ((producto.variantes && producto.variantes.length > 0) ? totalVariantsStock : (producto.available_quantity || 0)) > 0
    const esStockFisico = (tipoVentaProd === 'stock_fisico') || (isSelfService && sinPreparacion && hasAnyStock)
    // A pedido: todo lo que no sea stock físico
    const esEntregaLarga = !esStockFisico

    // effectiveStock ya calculado arriba

    const result: AdminItem[] = []
    result.push({
      id: (producto as any)._id || (producto as any).id || producto.ml_id,
      title: producto.title,
      price: producto.price,
      image: (producto.images && producto.images[0]?.url) || (producto as any).main_image,
      stock: effectiveStock,
      esVariante: false,
      productoPadre: producto,
      categoria: (producto as any).category_id || (producto as any).category || '',
      productId: producto.ml_id,
      status: (producto as any).status || 'active',
      isPaused: isPaused,
      tieneVariantes: producto.variantes && producto.variantes.length > 0,
      stockTotalVariantes: totalVariantsStock,
      dias_preparacion: diasPreparacion,
      dias_envio_estimado: diasEnvio,
      tiempo_total_entrega: tiempoTotalEntrega,
      es_entrega_larga: esEntregaLarga,
      es_stock_fisico: esStockFisico,
      proveedor: producto.dropshipping?.proveedor || producto.proveedor || 'No especificado',
      pais_origen: producto.dropshipping?.pais_origen || producto.pais_origen || 'No especificado',
      destacado: producto.destacado || false
    })

    if (Array.isArray(producto.variantes) && producto.variantes.length > 0 && typeof (producto.variantes[0] as any) === 'object' && (producto.variantes[0] as any).stock !== undefined) {
      (producto.variantes as any[]).forEach((variante: any) => {
        const imagenVariante = variante.images && variante.images.length > 0
          ? variante.images[0].url
          : producto.images[0]?.url || producto.main_image
        const variantDiasPreparacion = variante.dropshipping?.dias_preparacion || diasPreparacion
        const variantDiasEnvio = variante.dropshipping?.dias_envio_estimado || diasEnvio
        const variantTiempoTotal = variantDiasPreparacion + variantDiasEnvio
        const tipoVentaVar = (variante as any).tipo_venta as ('stock_fisico'|'dropshipping'|'mixto'|undefined)
        const variantSinPreparacion = (variante.dropshipping?.dias_preparacion || producto.dropshipping?.dias_preparacion || 0) === 0
        const variantEsStockFisico = (tipoVentaVar === 'stock_fisico') || (isSelfService && variantSinPreparacion && ((variante.stock ?? 0) > 0))
        const variantEsEntregaLarga = !variantEsStockFisico

        result.push({
          id: `${producto._id}_${variante._id || variante.id || Math.random()}`,
          title: `${producto.title} - ${variante.color || ''} ${variante.size || ''}`.trim(),
          price: (variante.price ?? producto.price) || 0,
          image: imagenVariante,
          stock: variante.stock ?? 0,
          esVariante: true,
          variante: variante,
          productoPadre: producto,
          categoria: producto.category_id,
          productId: producto.ml_id,
          variantId: (variante._id || variante.id || '').toString(),
          status: producto.status,
          isPaused: isPaused,
          dias_preparacion: variantDiasPreparacion,
          dias_envio_estimado: variantDiasEnvio,
          tiempo_total_entrega: variantTiempoTotal,
          es_entrega_larga: variantEsEntregaLarga,
          es_stock_fisico: variantEsStockFisico,
          proveedor: variante.dropshipping?.proveedor || producto.dropshipping?.proveedor || producto.proveedor || 'No especificado',
          pais_origen: variante.dropshipping?.pais_origen || producto.dropshipping?.pais_origen || producto.pais_origen || 'No especificado',
          destacado: producto.destacado || false
        })
      })
    }

    return result
  }

  useEffect(() => {
    // Si hay búsqueda activa, evitamos la carga paginada parcial para no sobreescribir resultados completos
    if (searchTerm.trim()) {
      return
    }
    const fetchPage = async (reset: boolean) => {
      try {
        setServerLoading(true)
        console.log('[Admin] Fetching page', { limit: serverLimit, offset: serverOffset, status: filterStatus, q: searchTerm, fields: SERVER_FIELDS })
        const { total, items } = await productsCache.getAdminProductsPage({
          limit: serverLimit,
          offset: serverOffset,
          fields: SERVER_FIELDS,
          status: filterStatus,
          q: searchTerm
        })
        setServerTotal(total)
        console.log('[Admin] Response', { total, itemsType: Array.isArray(items) ? 'array' : typeof items, itemsLength: Array.isArray(items) ? items.length : undefined })
        let mapped: AdminItem[] = []
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((p: any) => mapped.push(...buildItemsFromProduct(p as any)))
        }
        // Fallback desactivado para evitar demoras enormes y 404
        // if (reset && mapped.length === 0 && !didFallback.current) {
        //   console.log('[Admin] Fallback: cargando todos los productos (modo antiguo)')
        //   try {
        //     const all = await productsCache.getProducts()
        //     setServerTotal(Array.isArray(all) ? all.length : 0)
        //     const slice = Array.isArray(all) ? all.slice(0, serverLimit) : []
        //     mapped = []
        //     slice.forEach((p: any) => mapped.push(...buildItemsFromProduct(p as any)))
        //     didFallback.current = true
        //     console.log('[Admin] Fallback mapped count', { mappedCount: mapped.length })
        //   } catch (fe) {
        //     console.error('[Admin] Fallback error', fe)
        //   }
        // }
        console.log('[Admin] Mapped items count', { mappedCount: mapped.length, reset })
        setAdminItems(prev => reset ? mapped : [...prev, ...mapped])
      } catch (e) {
        console.error('[Admin] Error obteniendo página de productos:', e)
      } finally {
        setLoading(false)
        setServerLoading(false)
        console.log('[Admin] Page load finished', { loading: false, serverLoading: false })
      }
    }

    // Cuando cambia offset/limit o filtro de status, recargar desde servidor
    fetchPage(serverOffset === 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverLimit, serverOffset, filterStatus, searchTerm])

  // Al cambiar el término de búsqueda, reiniciar el offset del servidor
  useEffect(() => {
    setServerOffset(0)
  }, [searchTerm])

  // 🆕 Cuando hay búsqueda, cargar todos los lotes para resultados completos
  useEffect(() => {
    const q = searchTerm.trim()
    if (!q) return
    // Evitar carga duplicada si ya estamos cargando
    if (serverLoading) return
    // Cargar todo asincrónicamente sin bloquear UI inicial
    const id = setTimeout(() => {
      loadAllServerPages()
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // 🆕 Cargar todos los lotes desde el servidor (optimizado con carga paralela)
  const loadAllServerPages = async (options?: { ignoreQuery?: boolean }) => {
    if (serverLoading) return
    try {
      setServerLoading(true)
      setLoading(true)
      setLoadProgress({ loaded: 0, total: 0 })
      
      // Primero obtener el total
      const firstPage = await productsCache.getAdminProductsPage({
        limit: 1,
        offset: 0,
        fields: SERVER_FIELDS,
        status: filterStatus,
        q: options?.ignoreQuery ? '' : searchTerm
      })
      const total = firstPage.total || 0
      setLoadProgress({ loaded: 0, total })
      
      if (total === 0) {
        setServerTotal(0)
        setAdminItems([])
        return
      }

      // Usar lotes más grandes para reducir número de requests
      const batchLimit = Math.max(serverLimit, 100) // Lotes de al menos 100
      const batchCount = Math.ceil(total / batchLimit)
      
      // Cargar en paralelo con límite de concurrencia (máx 3 requests simultáneos)
      const CONCURRENT_LIMIT = 3
      let allMapped: AdminItem[] = []
      let completedBatches = 0
      
      for (let i = 0; i < batchCount; i += CONCURRENT_LIMIT) {
        const batchPromises = []
        const batchEnd = Math.min(i + CONCURRENT_LIMIT, batchCount)
        
        for (let j = i; j < batchEnd; j++) {
          const offset = j * batchLimit
          const promise = productsCache.getAdminProductsPage({
            limit: batchLimit,
            offset,
            fields: SERVER_FIELDS,
            status: filterStatus,
            q: options?.ignoreQuery ? '' : searchTerm
          }).then(({ items }) => {
            const mapped: AdminItem[] = []
            if (Array.isArray(items) && items.length > 0) {
              items.forEach((p: any) => mapped.push(...buildItemsFromProduct(p as any)))
            }
            completedBatches++
            setLoadProgress({ loaded: Math.min(offset + batchLimit, total), total })
            return mapped
          })
          batchPromises.push(promise)
        }
        
        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(mapped => {
          allMapped = allMapped.concat(mapped)
        })
      }
      
      setServerTotal(total)
      setAdminItems(allMapped)
      setServerOffset(0)
      setCurrentPage(1)
      setLoadProgress(null)
      console.log('[Admin] Carga completa de servidor', { total, items: allMapped.length, batches: batchCount, ignoreQuery: !!options?.ignoreQuery })
    } catch (e) {
      console.error('[Admin] Error al cargar todos los lotes', e)
      setLoadProgress(null)
    } finally {
      setLoading(false)
      setServerLoading(false)
    }
  }

  // Log cambios en la lista resultante
  useEffect(() => {
    if (!loading) {
      console.log('[Admin] adminItems updated', { count: adminItems.length })
    }
  }, [adminItems, loading])

  // 🆕 Cargar métricas de censo y duplicados de forma diferida (post-render)
  useEffect(() => {
    if (loading) return
    const loadCensusAndDuplicates = async () => {
      try {
        const [c, d] = await Promise.all([
          fetchCensus(),
          fetchDuplicates({ type: 'catalog', limit: 1000, summary: true })
        ])
        setCensus(c)
        setDupExcess((d as any)?.summary?.excess_catalog ?? null)
      } catch (e) {
        console.error('Error cargando métricas de duplicados/censo:', e)
      }
    }
    const anyWindow = window as any
    if (anyWindow && typeof anyWindow.requestIdleCallback === 'function') {
      anyWindow.requestIdleCallback(loadCensusAndDuplicates, { timeout: 3000 })
    } else {
      setTimeout(loadCensusAndDuplicates, 1500)
    }
  }, [loading])

  // Filtrar y ordenar items (memo + búsqueda diferida)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const filteredAndSortedItems = useMemo(() => adminItems
    .filter(item => {
      // Filtro por búsqueda
      if (deferredSearchTerm) {
        const needle = normalize(deferredSearchTerm)
        const hayTitle = normalize(item.title)
        const hayIds = `${(item.productId||'')}`.toLowerCase()
        const hayVarId = `${(item.variantId||'')}`.toLowerCase()
        const haySku = normalize(String((item.productoPadre as any)?.seller_sku || ''))
        if (!(hayTitle.includes(needle) || hayIds.includes(needle) || hayVarId.includes(needle) || (haySku && haySku.includes(needle)))) {
        return false
      }
      }
      
      // Filtro por tipo
      if (filterType === 'products' && item.esVariante) return false
      if (filterType === 'variants' && !item.esVariante) return false
      
      // Filtro por status
      if (filterStatus === 'active' && item.isPaused) return false
      if (filterStatus === 'paused' && !item.isPaused) return false
      
      // Filtro por tiempo de entrega
      if (filterDelivery === 'fast' && item.es_entrega_larga) return false
      if (filterDelivery === 'slow' && !item.es_entrega_larga) return false
      
      // 🆕 Filtro por destacado (solo aplica a productos, no variantes)
      if (filterDestacado === 'destacados' && (!item.destacado || item.esVariante)) return false
      if (filterDestacado === 'no-destacados' && (item.destacado || item.esVariante)) return false
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'delivery':
          comparison = (a.tiempo_total_entrega || 0) - (b.tiempo_total_entrega || 0)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    }), [adminItems, deferredSearchTerm, filterType, filterStatus, filterDelivery, filterDestacado, sortBy, sortOrder])

  // 🆕 Paginación (memo)
  const { totalPages, indexOfFirstItem, indexOfLastItem, currentItems } = useMemo(() => {
    const total = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
    const last = currentPage * itemsPerPage
    const first = last - itemsPerPage
    return {
      totalPages: total,
      indexOfFirstItem: first,
      indexOfLastItem: last,
      currentItems: filteredAndSortedItems.slice(first, last)
    }
  }, [filteredAndSortedItems, currentPage, itemsPerPage])

  // 🆕 Funciones de paginación
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset a primera página
  }

  // 🆕 Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType, filterStatus, filterDelivery, filterDestacado, sortBy, sortOrder])

  // 🆕 Función para marcar/desmarcar producto como destacado
  const toggleDestacado = async (item: AdminItem) => {
    if (!canManageExtended) {
      alert('No tienes permisos para gestionar productos destacados. Solo el administrador principal puede hacerlo.')
      return
    }
    try {
      const nuevoEstado = !item.destacado
      
      // Llamar al endpoint para actualizar en el backend
      const token = AuthService.getToken() || ''
      // Sin token: usar endpoint público con _id para evitar CastError por ml_id
      const idForPublicEndpoint = (item as any).id || item.productId
      const response = await fetch(
        `${API_BASE_URL}/ml/productos/${idForPublicEndpoint}/destacado`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ destacado: nuevoEstado })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 403) {
          throw new Error('No tienes permisos para gestionar productos destacados')
        }
        throw new Error(errorData.error || 'Error al actualizar producto destacado')
      }
      
      // Actualizar el estado local
      setAdminItems(prevItems =>
        prevItems.map(i =>
          i.productId === item.productId
            ? { ...i, destacado: nuevoEstado }
            : i
        )
      )
      
      alert(`Producto ${nuevoEstado ? 'marcado como destacado' : 'desmarcado como destacado'} exitosamente`)
    } catch (error) {
      console.error('Error:', error)
      alert((error as any)?.message || 'Error al actualizar el producto. Por favor, intenta de nuevo.')
    }
  }

  // 🆕 Selección múltiple de productos para destacados
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const toggleSelectProduct = (item: AdminItem) => {
    if (item.esVariante) return // solo productos base
    setSelectedProductIds(prev => {
      const next = new Set(prev)
      if (next.has(item.productId)) next.delete(item.productId)
      else next.add(item.productId)
      return next
    })
  }

  const selectAllCurrentPage = () => {
    const ids = currentItems.filter(i => !i.esVariante).map(i => i.productId)
    setSelectedProductIds(new Set(ids))
  }

  const clearSelection = () => setSelectedProductIds(new Set())

  // 🆕 Batch actualizar destacados
  const batchSetDestacados = async (destacado: boolean) => {
    if (!canManageExtended) {
      alert('No tienes permisos para gestionar productos destacados. Solo el administrador principal puede hacerlo.')
      return
    }
    try {
      const ml_ids = Array.from(selectedProductIds)
      if (ml_ids.length === 0) {
        alert('Seleccioná al menos un producto (no variantes).')
        return
      }
      const token = AuthService.getToken() || ''
      if (token) {
        const res = await fetch(`${API_BASE_URL}/ml/productos/destacado/batch`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ml_ids, destacado })
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          if (res.status === 403) {
            throw new Error('No tienes permisos para gestionar productos destacados')
          }
          throw new Error(errorData.error || 'Error actualizando destacados')
        }
      } else {
        // Fallback sin token: iterar endpoint público por _id
        const idMap = new Map(adminItems.filter(i => !i.esVariante).map(i => [i.productId, (i as any).id]))
        const idsToCall = ml_ids.map(ml => idMap.get(ml)).filter(Boolean) as string[]
        if (idsToCall.length === 0) throw new Error('No se encontraron IDs locales para actualizar')
        const results = await Promise.allSettled(idsToCall.map(_id => fetch(`${API_BASE_URL}/ml/productos/${_id}/destacado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destacado })
        })))
        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) throw new Error(`Fallaron ${failed.length} de ${results.length} actualizaciones`)
      }
      // Actualizar estado local
      setAdminItems(prev => prev.map(i => (
        selectedProductIds.has(i.productId) && !i.esVariante ? { ...i, destacado } : i
      )))
      alert(`Productos ${destacado ? 'marcados' : 'desmarcados'} como destacados`)
      clearSelection()
    } catch (e: any) {
      alert(e?.message || 'Error en actualización masiva de destacados')
    }
  }

  // 🆕 Agregar/Remover producto de evento especial (ej: halloween)
  const toggleEvento = async (item: AdminItem, slug: string) => {
    try {
      const token = AuthService.getToken() || ''
      const productId = item.productId
      const estaEnEvento = (item.productoPadre as any)?.eventos_especiales?.includes(slug)
      if (estaEnEvento) {
        await EventService.removeFromEvent(slug, [productId], token)
        alert(`Removido de ${slug}`)
      } else {
        await EventService.addToEvent(slug, [productId], token)
        alert(`Agregado a ${slug}`)
      }
    } catch (e: any) {
      alert(e.message || 'Error actualizando evento')
    }
  }

  // Comentamos las funciones no utilizadas
  // const handleEditProduct = (item: AdminItem) => {
  //   console.log('Editar producto:', item)
  //   alert(`Función de edición para: ${item.title}`)
  // }

  // const handleDeleteProduct = (item: AdminItem) => {
  //   console.log('Eliminar producto:', item)
  //   if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
  //     alert(`Función de eliminación para: ${item.title}`)
  //   }
  // }

  // Control de permisos por email para opciones avanzadas del admin
  const currentUser = AuthService.getStoredUser()
  const canManageExtended = (currentUser?.email || '').toLowerCase() === 'geronicola1696@gmail.com'

  // Renderizar siempre el header y la navegación, incluso durante la carga
  return (
    <main className="container">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>Panel de Administración</h1>
          <p>Gestiona todos los productos y variantes de tu tienda</p>
        </div>

        {/* Navegación de administración */}
        <div className="admin-nav flex gap-20">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="btn-orden btn-orders"
          >
           ↳ Ver Órdenes de Compra
          </button>
            <button 
              onClick={() => navigate("/admin/clientes")}
              className="btn-orden btn-clientes"
            >
              ↳ Gestionar Clientes
            </button>
            <button 
              onClick={() => navigate("/admin/usuarios")}
              className="btn-orden"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: 'white'
              }}
            >
              ↳ Gestionar Usuarios
            </button>
          {canManageExtended && (
            <>
              <button 
                onClick={() => navigate("/admin/descuentos")}
                className="btn-orden btn-descuentos"
                style={{
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: 'white'
                }}
              >
               ↳ Gestionar Descuentos 🔥
              </button>
              <button 
                onClick={() => navigate("/admin/cupones")}
                className="btn-orden btn-cupones"
                style={{
                  background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
                  color: 'white'
                }}
              >
               ↳ Gestionar Cupones 🎟️
              </button>
              <button 
                onClick={() => navigate("/admin/eventos")}
                className="btn-orden"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: 'white'
                }}
              >
               ↳ Gestionar Eventos 🎉
              </button>
              <button 
                onClick={() => navigate("/admin/destacados")}
                className="btn-orden"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#111827'
                }}
              >
               ↳ Gestionar Destacados ⭐
              </button>
            </>
          )}
        </div>

        {/* Controles de filtrado y búsqueda */}
        <div className="admin-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-section">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'products' | 'variants')}
              className="admin-select"
            >
              <option value="all">Todos los items</option>
              <option value="products">Solo productos</option>
              <option value="variants">Solo variantes</option>
            </select>
          </div>
          
          <div className="status-section">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'paused')}
              className="admin-select"
            >
              <option value="all">Todos los status</option>
              <option value="active">Activos</option>
              <option value="paused">Pausados</option>
            </select>
          </div>
          
          <div className="delivery-section">
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value as 'all' | 'fast' | 'slow')}
              className="admin-select"
            >
              <option value="all">Todos los tiempos</option>
              <option value="fast">Stock físico </option>
              <option value="slow">A pedido </option>
            </select>
          </div>
          
          {/* 🆕 Filtro de destacados - Solo para geronicola1696@gmail.com */}
          {canManageExtended && (
            <div className="destacado-section">
              <select
                value={filterDestacado}
                onChange={(e) => setFilterDestacado(e.target.value as 'all' | 'destacados' | 'no-destacados')}
                className="admin-select"
                style={{
                  borderColor: filterDestacado === 'destacados' ? '#fbbf24' : undefined,
                  background: filterDestacado === 'destacados' 
                    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                    : undefined,
                  fontWeight: filterDestacado === 'destacados' ? '600' : undefined
                }}
              >
                <option value="all">Todos</option>
                <option value="destacados">⭐ Solo Destacados</option>
                <option value="no-destacados">☆ No Destacados</option>
              </select>
            </div>
          )}
          
          <div className="sort-section">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'delivery')}
              className="admin-select"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
              <option value="delivery">Ordenar por entrega</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="admin-sort-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* 🆕 Acciones para destacados (selección múltiple) - Solo para geronicola1696@gmail.com */}
          {canManageExtended && (
            <div className="featured-batch-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-orden" onClick={selectAllCurrentPage} title="Seleccionar productos de esta página">
                Seleccionar página
              </button>
              <button className="btn-orden" onClick={clearSelection} title="Limpiar selección">
                Limpiar selección
              </button>
              <button className="btn-orden" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white' }} onClick={() => batchSetDestacados(true)}>
                Marcar Destacados
              </button>
              <button className="btn-orden" onClick={() => batchSetDestacados(false)}>
                Quitar Destacados
              </button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Seleccionados: {selectedProductIds.size}</span>
            </div>
          )}
        </div>

        {/* 🆕 Información de paginación y control (cliente) */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>
                📊 Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedItems.length)} de {filteredAndSortedItems.length} items
              </h3>
              {totalPages > 1 && (
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Página {currentPage} de {totalPages}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '600' }}>Items por página:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                style={{
                  padding: '8px 15px',
                  borderRadius: '8px',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🆕 Paginación de servidor */}
        <div style={{
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          color: '#c9d1d9'
        }}>
          <div>
            <strong>Servidor</strong>: {serverOffset + 1} - {Math.min(serverOffset + serverLimit, serverTotal)} de {serverTotal}
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Cargados en cliente: {adminItems.length} items
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label>Items por request:</label>
            <select
              value={serverLimit}
              onChange={e => { setServerLimit(Number(e.target.value)); setServerOffset(0); }}
              className="admin-select"
              style={{ minWidth: 90 }}
            >
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={750}>750</option>
              <option value={1000}>1000</option>
              <option value={2000}>2000</option>
            </select>

            <button
              className="admin-sort-btn"
              disabled={serverOffset === 0 || serverLoading}
              onClick={() => setServerOffset(Math.max(0, serverOffset - serverLimit))}
            >
              ← Anterior lote
            </button>
            <button
              className="admin-sort-btn"
              disabled={serverOffset + serverLimit >= serverTotal || serverLoading}
              onClick={() => setServerOffset(serverOffset + serverLimit)}
            >
              Siguiente lote →
            </button>
            <button
              className="admin-sort-btn"
              disabled={serverLoading || serverTotal === 0}
              onClick={() => loadAllServerPages({ ignoreQuery: true })}
              title="Carga todos los lotes hasta completar"
            >
              {loadProgress ? (
                <>
                  Cargando... {loadProgress.loaded} / {loadProgress.total} ({Math.round((loadProgress.loaded / loadProgress.total) * 100)}%)
                </>
              ) : (
                'Cargar todo'
              )}
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="admin-stats">
          <div 
            className="stat-card"
            title="Productos base + Variantes"
          >
            <h3>Total items</h3>
            <span className="stat-number">{adminItems.length}</span>
            <div className="stat-subtitle">Productos + Variantes</div>
          </div>
          {/* 🆕 Total real y duplicados */}
          <div 
            className="stat-card"
            title="Total de publicaciones en la base de datos (incluye duplicados)"
            onClick={() => navigate('/admin/duplicados')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Total real (DB)</h3>
            <span className="stat-number">{typeof census?.db_total === 'number' ? census?.db_total : '-'}</span>
            <div className="stat-subtitle">Incluye duplicados</div>
          </div>
          <div 
            className="stat-card"
            title="Exceso por catálogo: suma de (count - 1) por grupo"
            onClick={() => navigate('/admin/duplicados')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Duplicados</h3>
            <span className="stat-number">{typeof dupExcess === 'number' ? dupExcess : '-'}</span>
            <div className="stat-subtitle">Click para ver detalles</div>
          </div>
          <div 
            className="stat-card"
            title="Solo publicaciones base (sin variantes)"
          >
            <h3>Total productos</h3>
            <span className="stat-number">{adminItems.filter(item => !item.esVariante).length}</span>
            <div className="stat-subtitle">Solo productos base</div>
          </div>
          <div 
            className="stat-card"
            title="Cada variante individual"
          >
            <h3>Total variantes</h3>
            <span className="stat-number">{adminItems.filter(item => item.esVariante).length}</span>
            <div className="stat-subtitle">Solo variantes</div>
          </div>
          <div className="stat-card">
            <h3>Sin Stock</h3>
            <span className="stat-number">{adminItems.filter(item => !item.isPaused && item.stock <= 0).length}</span>
          </div>
          <div className="stat-card">
            <h3>Pausados</h3>
            <span className="stat-number">{adminItems.filter(item => item.isPaused).length}</span>
          </div>
          <div className="stat-card">
            <h3>A Pedido</h3>
            <span className="stat-number">{adminItems.filter(item => item.es_entrega_larga).length}</span>
          </div>
          <div className="stat-card">
            <h3>Stock Físico</h3>
            <span className="stat-number">{adminItems.filter(item => !item.isPaused && item.stock > 0 && item.es_stock_fisico).length}</span>
            <div className="stat-subtitle">
              Self Service (~7 días)
            </div>
          </div>
          {/* 🆕 Tarjeta de productos destacados */}
          <div 
            className="stat-card" 
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderColor: '#fbbf24',
              cursor: 'pointer'
            }}
            onClick={() => setFilterDestacado(filterDestacado === 'destacados' ? 'all' : 'destacados')}
          >
            <h3 style={{ color: '#854d0e' }}>⭐ Destacados</h3>
            <span className="stat-number" style={{ color: '#92400e' }}>
              {adminItems.filter(item => !item.esVariante && item.destacado).length}
            </span>
            <div className="stat-subtitle" style={{ color: '#a16207' }}>
              Click para {filterDestacado === 'destacados' ? 'ver todos' : 'filtrar'}
            </div>
          </div>
        </div>

        {/* Lista de productos paginada */}
        <div className="admin-products-list">
          {loading ? (
            <Loader type="spinner" size="large" text="Cargando productos..." />
          ) : currentItems.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            currentItems.map(item => (
              <div key={item.id} className={`admin-product-item ${item.es_entrega_larga ? 'slow-delivery-item' : ''}`}>
                <div className="product-image">
                  <img 
                    src={getOptimizedImageUrl(item.image)} 
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className={
                      item.isPaused 
                        ? 'paused-image' 
                        : item.esVariante 
                          ? 'variant-image' 
                          : (!item.esVariante && item.tieneVariantes) 
                            ? 'base-product-image' 
                            : 'product-image'
                    }
                  />
                </div>
                
                <div className="product-info">
                  {/* Checkbox de selección múltiple */}
                  {!item.esVariante && (
                    <div style={{ marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(item.productId)}
                        onChange={() => toggleSelectProduct(item)}
                      />
                      <span style={{ marginLeft: 6, fontSize: 12, color: '#6b7280' }}>Seleccionar</span>
                    </div>
                  )}
                  <div className="product-main-info">
                    <h3 className={`product-title ${!item.esVariante && item.tieneVariantes ? 'product-base-title' : ''}`}>
                      {item.title} 
                    </h3>
                    <div className="product-badges">
                      {item.esVariante ? (
                        <span className="badge badge-variant">Variante</span>
                      ) : (!item.esVariante && item.tieneVariantes) ? (
                        <span className="badge badge-product-base">Producto Base</span>
                      ) : (
                        <span className="badge badge-product">Producto</span>
                      )}
                      {item.isPaused ? (
                        <span className="badge badge-paused">Pausado</span>
                      ) : !item.isPaused && item.stock <= 0 ? (
                        <span className="badge badge-no-stock">Sin Stock</span>
                      ) : null}
                      {item.es_entrega_larga && (
                        <span className="badge badge-slow-delivery">A Pedido</span>
                      )}
                      {item.es_stock_fisico && !item.isPaused && item.stock > 0 && (
                        <span className="badge badge-physical-stock" style={{
                          backgroundColor: item.productoPadre?.shipping?.logistic_type === 'fulfillment' 
                            ? '#00a650' 
                            : (item.productoPadre?.shipping?.logistic_type === 'xd_drop_off' && (item.dias_preparacion || 0) === 0)
                              ? '#2196f3'
                              : '#3483fa',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {item.productoPadre?.shipping?.logistic_type === 'fulfillment' 
                            ? '⚡ FLEX' 
                            : (item.productoPadre?.shipping?.logistic_type === 'xd_drop_off' && (item.dias_preparacion || 0) === 0)
                              ? '🚚 Cross Docking'
                              : `📦 ${item.tiempo_total_entrega || 7}d`}
                        </span>
                      )}
                    </div>
                    
                    {/* 🆕 Toggle para marcar como destacado - Solo para geronicola1696@gmail.com */}
                    {!item.esVariante && canManageExtended && (
                      <div className="product-featured-toggle" style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => toggleDestacado(item)}
                          className={`btn-toggle-destacado ${item.destacado ? 'destacado-activo' : ''}`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: item.destacado ? '2px solid #fbbf24' : '2px solid #e5e7eb',
                            background: item.destacado 
                              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                              : 'white',
                            color: item.destacado ? 'white' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            if (!item.destacado) {
                              e.currentTarget.style.borderColor = '#fbbf24'
                              e.currentTarget.style.background = '#fef3c7'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.destacado) {
                              e.currentTarget.style.borderColor = '#e5e7eb'
                              e.currentTarget.style.background = 'white'
                            }
                          }}
                        >
                          <span>{item.destacado ? '⭐' : '☆'}</span>
                          {item.destacado ? 'Destacado' : 'Marcar destacado'}
                        </button>
                        <button
                          onClick={() => toggleEvento(item, 'halloween')}
                          className="btn-toggle-evento"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '2px solid #8b5cf6',
                            background: 'white',
                            color: '#6b21a8',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🎃 Halloween
                        </button>
                        {item.destacado && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#f59e0b',
                            fontWeight: '500'
                          }}>
                            Este producto se mostrará en la sección destacados
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value">US$ {item.price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Stock:</span>
                      <span className={`detail-value ${item.stock <= 0 ? 'no-stock' : ''}`}>
                        {item.stock}{item.isPaused ? ' (Pausado)' : ''}
                        {!item.esVariante && item.tieneVariantes && (
                          <span className="stock-info">
                            {' '}(Total de variantes: {item.stockTotalVariantes})
                          </span>
                        )}
                      </span>
                    </div>
                    {!item.esVariante && item.tieneVariantes && (
                      <div className="detail-row">
                        <span className="detail-label">Tipo:</span>
                        <span className="detail-value product-base">
                          Producto Base (con {item.productoPadre?.variantes?.length || 0} variantes)
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value ${item.isPaused ? 'paused' : 'active'}`}>
                        {item.status}
                      </span>
                    </div>
                    {(item.tiempo_total_entrega && item.tiempo_total_entrega > 0) && (
                      <div className="detail-row">
                        <span className="detail-label">Tiempo Entrega:</span>
                        <span className={`detail-value ${item.es_entrega_larga ? 'slow-delivery' : 'fast-delivery'}`}>
                          {item.tiempo_total_entrega} días
                          {(item.dias_preparacion || 0) > 0 && (item.dias_envio_estimado || 0) > 0 && (
                            <span className="delivery-breakdown">
                              {' '}(Prep: {item.dias_preparacion}d + Envío: {item.dias_envio_estimado}d)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {item.proveedor && item.proveedor !== 'No especificado' && (
                      <div className="detail-row">
                        <span className="detail-label">Proveedor:</span>
                        <span className="detail-value">{item.proveedor}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">ID Producto:</span>
                      <span className="detail-value detail-id">{item.productId}</span>
                    </div>
                    {item.variantId && (
                      <div className="detail-row">
                        <span className="detail-label">ID Variante:</span>
                        <span className="detail-value detail-id">{item.variantId}</span>
                      </div>
                    )}
                    {item.variante && (
                      <>
                        {item.variante.color && (
                          <div className="detail-row">
                            <span className="detail-label">Color:</span>
                            <span className="detail-value">{item.variante.color}</span>
                          </div>
                        )}
                        {item.variante.size && (
                          <div className="detail-row">
                            <span className="detail-label">Talla:</span>
                            <span className="detail-value">{item.variante.size}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              
              </div>
            ))
          )}
        </div>

        {/* 🆕 Paginación */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginTop: '40px',
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            flexWrap: 'wrap',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '12px 24px',
                background: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'white',
                color: currentPage === 1 ? 'rgba(255,255,255,0.5)' : '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentPage === 1 ? 'none' : '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              ← Anterior
            </button>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Primera página */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    style={{
                      width: '45px',
                      height: '45px',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span style={{ color: 'white', fontWeight: '700', padding: '0 5px' }}>...</span>
                  )}
                </>
              )}

              {/* Páginas cercanas */}
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
                    style={{
                      width: '45px',
                      height: '45px',
                      background: pageNum === currentPage 
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'white',
                      color: pageNum === currentPage ? 'white' : '#667eea',
                      border: pageNum === currentPage ? '3px solid white' : 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: pageNum === currentPage ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: pageNum === currentPage 
                        ? '0 6px 20px rgba(245, 87, 108, 0.4)'
                        : '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

              {/* Última página */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span style={{ color: 'white', fontWeight: '700', padding: '0 5px' }}>...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    style={{
                      width: '45px',
                      height: '45px',
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '12px 24px',
                background: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'white',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.5)' : '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentPage === totalPages ? 'none' : '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Info adicional si todo cabe en una página */}
        {totalPages <= 1 && filteredAndSortedItems.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            marginTop: '20px',
            background: '#e8f5e9',
            borderRadius: '10px',
            color: '#2e7d32',
            fontWeight: '600'
          }}>
            ✅ Todos los {filteredAndSortedItems.length} items están en una sola página
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminPage
