import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML } from '../types'
import { useCart } from '../context/CartContext'

const TiendaMLPage: React.FC = () => {
  const navigate = useNavigate()
  const [productos, setProductos] = useState<ProductoML[]>([])
  const [filteredProductos, setFilteredProductos] = useState<ProductoML[]>([])
  const [priceFilter, setPriceFilter] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('mostrar-todo')
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const categories = [
    { id: 'mostrar-todo', name: 'Mostrar Todo' },
    { id: 'championes', name: 'Championes' },
    { id: 'bermudas', name: 'Bermudas' },
    { id: 'gorros', name: 'Gorros' },
    { id: 'medias', name: 'Medias' },
    { id: 'remeras', name: 'Remeras' },
    { id: 'mochilas', name: 'Mochilas' },
    { id: 'pantalones', name: 'Pantalones' }
  ]

  // Fetch productos de Mercado Libre desde el backend
  const fetchProducts = async (): Promise<ProductoML[]> => {
    try {
      // Usar el endpoint correcto para productos de ML
      const response = await fetch('https://tienda-virtual-ts-back-production.up.railway.app/ml/productos')
      const data = await response.json()
      console.log('Productos ML recibidos:', data) // Debug
      return data || [] // Los productos ML vienen directamente, no en .registros
    } catch (error) {
      console.error('Error fetching ML products:', error)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      const productList = await fetchProducts()
      console.log('Productos cargados:', productList) // Debug
      setProductos(productList)
      setFilteredProductos(productList)
      setLoading(false)
    }
    loadProducts()
  }, [])

  // Filtrar productos
  useEffect(() => {
    let filtered = productos

    // Filtro por categoría
    if (categoryFilter !== 'mostrar-todo') {
      filtered = filtered.filter(product => product.categoria === categoryFilter)
    }

    // Filtro por precio
    filtered = filtered.filter(product => product.price >= priceFilter)

    console.log('Productos filtrados:', filtered) // Debug
    setFilteredProductos(filtered)
  }, [productos, categoryFilter, priceFilter])

  const handleProductClick = (productId: string) => {
    navigate(`/producto/${productId}`)
  }

  const handleAddToCart = (e: React.MouseEvent, product: ProductoML) => {
    e.stopPropagation() // Evitar que se active la navegación al producto
    // Convertir ProductoML a formato compatible con el carrito
    const cartProduct = {
      id: parseInt(product._id) || 0,
      name: product.title,
      image: product.images[0].url,
      category: product.categoria || 'general',
      price: product.price,
      stock: product.available_quantity,
      cantidad: 1
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
        <div className="preloader">Cargando productos de Mercado Libre...</div>
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
                      id="precio"
                      onChange={(e) => handlePriceFilter(Number(e.target.value))}
                    />
                    <span id="mostrar-precio">${priceFilter}</span>
                  </div>
                </div>
              </section>

              <section className="filtro-categorias centrar-texto">
                {categories.map(category => (
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

        {/* Productos */}
        <div className="productos">
          {filteredProductos.map(producto => (
            <div 
              key={producto._id} 
              className="producto centrar-texto"
              onClick={() => handleProductClick(producto._id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={producto.main_image} alt={producto.title} />
              <p>{producto.title}</p>
              <p>${producto.price}</p>
              <button 
                className="add"
                onClick={(e) => handleAddToCart(e, producto)}
                disabled={producto.available_quantity <= 0}
              >
                {producto.available_quantity <= 0 ? 'Sin Stock' : 'Agregar Carrito'}
              </button>
            </div>
          ))}
          
          {filteredProductos.length === 0 && (
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