import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML, Variante } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'

// Mapeo de categorías de ML a tus categorías
const mapeoCategorias: Record<string, string> = {
  'MLU158376': 'remeras',
  'MLU163646': 'electronica',
  'MLU6344': 'consolas',
  "MLU190994": 'mochilas',
}

// Función para obtener categoría segura
const obtenerCategoria = (categoryId: string | undefined): string => {
  if (!categoryId) return 'otros'
  return mapeoCategorias[categoryId] || 'otros'
}

// Interfaz para items a mostrar
interface ItemTienda {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  esVariante: boolean;
  variante?: Variante;
  productoPadre?: ProductoML;
  categoria?: string;
}

const TiendaMLPage: React.FC = () => {
  const navigate = useNavigate()
  const [itemsTienda, setItemsTienda] = useState<ItemTienda[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemTienda[]>([])
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('mostrar-todo')
  const [loading, setLoading] = useState(true)
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([
    { id: 'mostrar-todo', name: 'Mostrar Todo' }
  ])
  const { addToCart } = useCart()

  // Fetch productos de Mercado Libre desde el backend
  const fetchProducts = async (): Promise<ProductoML[]> => {
    try {
      const response = await fetch('https://tienda-virtual-ts-back-production.up.railway.app/ml/productos')
      const data = await response.json()
      console.log(data)
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
            
            items.push({
              id: `${producto._id}_${variante.color}`,
              title: `${producto.title} - ${variante.color || ''}`.trim(),
              price: variante.price || producto.price,
              image: imagenVariante,
              stock: producto.variantes.reduce((total, v) => total + v.stock, 0),
              esVariante: true,
              variante: variante,
              productoPadre: producto,
              categoria: categoria
            })
          })
        } else {
          // Si no tiene variantes, mostramos el producto principal
          items.push({
            id: producto._id,
            title: producto.title,
            price: producto.price,
            image: producto.images[0]?.url || producto.main_image,
            stock: producto.available_quantity,
            esVariante: false,
            productoPadre: producto,
            categoria: categoria
          })
        }
      })
      
      setItemsTienda(items)
      setFilteredItems(items)
      
      // Extraer categorías únicas de los items
      const categoriasUnicas = [...new Set(items.map(item => item.categoria))].filter(Boolean) as string[]
      
      // Crear array de categorías para el filtro
      const categoriasFiltro = categoriasUnicas.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
      
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
              <button 
                className="add"
                onClick={(e) => handleAddToCart(e, item)}
                disabled={item.stock <= 0}
              >
                {item.stock <= 0 ? 'Sin Stock' : 'Agregar Carrito'}
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