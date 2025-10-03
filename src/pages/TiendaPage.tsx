import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'
import CategoryFilter from '../components/CategoryFilter'
import '../styles/categoryFilter.css'

// Mapeo de categorías de ML a tus categorías (basado en datos reales)
const mapeoCategorias: Record<string, string> = {
  // Figuras y coleccionables
  'MLU176854': 'figuras-coleccionables',
  'MLU455859': 'varitas-magia',
  'MLU412670': 'juegos-mesa',
  
  // Electrónica y tecnología
  'MLU163646': 'e-readers',
  'MLU163764': 'fundas-tablets',
  'MLU163765': 'protectores-pantalla',
  'MLU163771': 'apple-pencil',
  'MLU168248': 'altavoces',
  'MLU3697': 'auriculares',
  'MLU409415': 'asistentes-virtuales',
  'MLU5072': 'airpods',
  'MLU1055': 'iphones',
  'MLU1442': 'relojes-casio',
  'MLU117113': 'smartwatches',
  'MLU36566': 'camaras-seguridad',
  'MLU71938': 'timbres-video',
  'MLU10553': 'camaras-seguridad',
  'MLU116559': 'auriculares-gaming',
  'MLU4075': 'microfonos',
  'MLU12953': 'protectores-iphone',
  'MLU14407': 'monitores',
  'MLU1676': 'impresoras',
  'MLU431680': 'protectores-apple-watch',
  'MLU434342': 'linternas',
  'MLU5549': 'airtags',
  'MLU1915': 'soportes-airtag',
  'MLU443772': 'llaveros-airtag',
  'MLU1155': 'tablets-infantiles',
  'MLU116559': 'auriculares-gaming',
  'MLU1658': 'tarjetas-video',
  'MLU1717': 'cables',
  'MLU195437': 'meta-quest',
  'MLU372999': 'desarrollo',
  'MLU188198': 'adaptadores-camara',
  'MLU32605': 'papel-fotografico',
  'MLU413515': 'docking-stations',
  'MLU413564': 'controles-remotos',
  'MLU429735': 'accesorios-apple',
  'MLU455057': 'cables-convertidores',
  'MLU455839': 'protectores-asus',
  'MLU9914': 'hubs-carga',
  
  // Gaming y simulación
  'MLU6344': 'consolas',
  'MLU443628': 'sim-racing',
  'MLU448172': 'accesorios-sim-racing',
  'MLU443741': 'auriculares-gaming',
  'MLU10858': 'volantes-sim-racing',
  'MLU11898': 'lapices-opticos',
  'MLU443583': 'sillas-gaming',
  'MLU439534': 'volantes-sim-racing',
  'MLU448173': 'volantes-sim-racing',
  'MLU10858': 'volantes-sim-racing',
  
  // Drones y cámaras
  'MLU178089': 'drones',
  'MLU413447': 'fundas-drones',
  'MLU413635': 'hubs-carga-drones',
  'MLU430406': 'baterias-drones',
  'MLU413444': 'baterias-drones',
  'MLU414123': 'sistemas-airdrop',
  'MLU1042': 'lentes-camara',
  'MLU188198': 'adaptadores-camara',
  
  // Hogar y decoración
  'MLU190994': 'mochilas',
  'MLU12201': 'colchonetas',
  'MLU7969': 'almohadas',
  'MLU40398': 'maquinas-ruido-blanco',
  'MLU205198': 'cepillos-dientes',
  'MLU43687': 'audifonos',
  'MLU442888': 'tocadiscos',
  'MLU442952': 'purificadores-aire',
  'MLU416658': 'reposapies',
  'MLU436268': 'edredones',
  'MLU456110': 'fundas-edredon',
  'MLU186068': 'almohadas-cuña',
  'MLU438004': 'almohadas-rodilla',
  'MLU177716': 'ventiladores-torre',
  'MLU457532': 'ventiladores-portatiles',
  'MLU457852': 'maquinas-sonidos-bebes',
  'MLU388628': 'luces-nocturnas',
  'MLU387931': 'limpiadores-cepillos',
  'MLU400173': 'duchas-portatiles',
  'MLU412348': 'luncheras-electricas',
  'MLU413493': 'mosquiteros',
  'MLU414208': 'toallas-bano',
  'MLU429242': 'portones-bebes',
  'MLU434789': 'cintas-antiarañazos',
  'MLU435781': 'comederos-automaticos',
  
  // Cocina y hogar
  'MLU442710': 'cafeteras-moka',
  'MLU196263': 'capsulas-cafe',
  'MLU416585': 'molinillos-cafe',
  'MLU414038': 'tazas-medidoras',
  'MLU442747': 'rebanadoras-mandolina',
  'MLU442751': 'utensilios-cocina',
  'MLU455144': 'filtros-cafe',
  'MLU74887': 'cuchillos-chef',
  'MLU74925': 'molinillos-sal-pimienta',
  
  // Deportes y fitness
  'MLU165701': 'botellas-gatorade',
  'MLU165785': 'equipos-ejercicio',
  'MLU413593': 'simuladores-boxeo',
  'MLU159067': 'cortapelos-mascotas',
  'MLU457091': 'tijeras-electricas',
  
  // Bebés y niños
  'MLU178390': 'aspiradores-nasales',
  'MLU443005': 'juguetes-vtech',
  'MLU412585': 'juguetes-ahorro',
  'MLU187852': 'productos-bebes',
  'MLU443022': 'telefonos-juguete',
  'MLU443133': 'guitarras-juguete',
  'MLU1889': 'juguetes-bebes',
  'MLU443331': 'katanas-kendo',
  'MLU443332': 'equipos-entrenamiento',
  'MLU443444': 'bolsas-mascotas',
  
  // Accesorios y organizadores
  'MLU442981': 'estuches-pokemon',
  'MLU187975': 'estuches-lapices',
  'MLU26538': 'mochilas-anime',
  'MLU5824': 'walkie-talkies',
  'MLU70061': 'recortadoras-corporales',
  'MLU178391': 'tablets',
  'MLU172030': 'limpiadores-piscina',
  'MLU1152': 'fundas-asus',
  'MLU163765': 'fundas-ipad',
  'MLU165337': 'estaciones-carga',
  'MLU206537': 'botellas-deportivas',
  'MLU168223': 'cajas-seguridad',
  'MLU202844': 'sierras-agujero',
  'MLU414123': 'sistemas-airdrop',
  'MLU413564': 'controles-remotos',
  'MLU413515': 'docking-stations',
  'MLU429735': 'accesorios-apple',
  'MLU455057': 'cables-convertidores',
  'MLU455839': 'protectores-asus',
  'MLU9914': 'hubs-carga',
  
  // Memoria y almacenamiento
  'MLU70969': 'memorias-microsd',
  'MLU6336': 'tarjetas-memoria',
  'MLU1152': 'fundas-asus',
  'MLU163765': 'fundas-ipad',
  'MLU165337': 'estaciones-carga',
  'MLU206537': 'botellas-deportivas',
  'MLU168223': 'cajas-seguridad',
  'MLU202844': 'sierras-agujero',
  'MLU414123': 'sistemas-airdrop',
  'MLU413564': 'controles-remotos',
  'MLU413515': 'docking-stations',
  'MLU429735': 'accesorios-apple',
  'MLU455057': 'cables-convertidores',
  'MLU455839': 'protectores-asus',
  'MLU9914': 'hubs-carga',
  
  // Otros
  'MLU40629': 'monitores-bebes',
  'MLU176997': 'chromecast',
  'MLU158838': 'billeteras',
  'MLU379647': 'intercomunicadores-moto',
  'MLU4702': 'telescopios',
  'MLU52047': 'tocadiscos-victrola',
  'MLU10553': 'camaras-seguridad',
  'MLU1155': 'tablets-infantiles',
  'MLU116559': 'auriculares-gaming',
  'MLU1658': 'tarjetas-video',
  'MLU1717': 'cables',
  'MLU195437': 'meta-quest',
  'MLU372999': 'desarrollo',
  'MLU188198': 'adaptadores-camara',
  'MLU32605': 'papel-fotografico',
  'MLU413515': 'docking-stations',
  'MLU413564': 'controles-remotos',
  'MLU429735': 'accesorios-apple',
  'MLU455057': 'cables-convertidores',
  'MLU455839': 'protectores-asus',
  'MLU9914': 'hubs-carga',
}

// Función para obtener categoría segura
const obtenerCategoria = (categoryId: string | undefined): string => {
  if (!categoryId) return 'otros'
  return mapeoCategorias[categoryId] || 'otros'
}

// Función para obtener nombre legible de categoría
const obtenerNombreCategoria = (categoryId: string | undefined): string => {
  if (!categoryId) return 'Otros'
  
  const nombresLegibles: Record<string, string> = {
    'MLU176854': 'Figuras y Coleccionables',
    'MLU163764': 'Fundas para Tablets',
    'MLU442981': 'Estuches Pokémon',
    'MLU190994': 'Mochilas',
    'MLU178089': 'Drones',
    'MLU455859': 'Varitas de Magia',
    'MLU12201': 'Colchonetas',
    'MLU163646': 'E-readers Kindle',
    'MLU165701': 'Botellas Deportivas',
    'MLU168248': 'Altavoces Bluetooth',
    'MLU443628': 'Sim Racing',
    'MLU409415': 'Asistentes Virtuales',
    'MLU3697': 'Auriculares',
    'MLU7969': 'Almohadas',
    'MLU448172': 'Accesorios Sim Racing',
    'MLU1042': 'Lentes de Cámara',
    'MLU443005': 'Juguetes VTech',
    'MLU6344': 'Consolas de Videojuegos',
    'MLU117113': 'Smartwatches',
    'MLU40629': 'Monitores para Bebés',
    'MLU176997': 'Chromecast',
    'MLU158838': 'Billeteras',
    'MLU379647': 'Intercomunicadores Moto',
    'MLU4702': 'Telescopios',
    'MLU52047': 'Tocadiscos Victrola',
    'MLU10553': 'Cámaras de Seguridad',
    'MLU1155': 'Tablets Infantiles',
    'MLU116559': 'Auriculares Gaming',
    'MLU1658': 'Tarjetas de Video',
    'MLU1717': 'Cables',
    'MLU195437': 'Meta Quest',
    'MLU372999': 'Desarrollo',
    'MLU188198': 'Adaptadores Cámara',
    'MLU32605': 'Papel Fotográfico',
    'MLU413515': 'Docking Stations',
    'MLU413564': 'Controles Remotos',
    'MLU429735': 'Accesorios Apple',
    'MLU455057': 'Cables Convertidores',
    'MLU455839': 'Protectores Asus',
    'MLU9914': 'Hubs de Carga',
  }
  
  return nombresLegibles[categoryId] || `Categoría ${categoryId}`
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
  const [itemsTienda, setItemsTienda] = useState<ItemTienda[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemTienda[]>([])
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('mostrar-todo')
  const [loading, setLoading] = useState(true)
  const [categorias, setCategorias] = useState<{id: string, name: string, count?: number}[]>([
    { id: 'mostrar-todo', name: 'Mostrar Todo' }
  ])
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
        ...categoriasFiltro
      ])
      
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Filtrar items
  useEffect(() => {
    let filtered = itemsTienda

    // Filtro por categoría
    if (categoryFilter !== 'mostrar-todo') {
      filtered = filtered.filter(item => item.categoria === categoryFilter)
    }

    // Filtro por precio
    filtered = filtered.filter(item => item.price >= priceFilter)

    setFilteredItems(filtered)
  }, [itemsTienda, categoryFilter, priceFilter])

  const handleProductClick = (item: ItemTienda) => {
    navigate(`/producto/${item.productoPadre?._id || item.id}`)
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
                  {categorias.map(category => (
                    <p 
                      key={category.id}
                      className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {category.name}
                    </p>
                  ))}
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
                <h3 className="precios-titulo">Filtrar por Categoría</h3>
                <div className="categorias-grid">
                  {categorias.map(category => (
                    <div 
                      key={category.id}
                      className={`categoria-filtro ${categoryFilter === category.id ? 'seleccionado' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="categoria-nombre">{category.name}</span>
                      {category.count && (
                        <span className="categoria-contador">({category.count})</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Items de la tienda */}
        <div className="productos">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="producto centrar-texto"
              onClick={() => handleProductClick(item)}
              style={{ cursor: 'pointer' }}
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
          
          {filteredItems.length === 0 && (
            <div className="centrar-texto">
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default TiendaMLPage
