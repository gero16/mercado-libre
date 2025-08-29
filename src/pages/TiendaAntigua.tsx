import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Producto } from '../types'
import { useCart } from '../context/CartContext'
import ProductSkeleton from '../components/ProductSkeleton'

const TiendaPage: React.FC = () => {
  const navigate = useNavigate()
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
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

  // Fetch productos desde el backend
  const fetchProducts = async (): Promise<Producto[]> => {
    try {
      const response = await fetch('https://tienda-virtual-ts-back-production.up.railway.app/api/productos')
      const data = await response.json()
      return data.registros || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      const productList = await fetchProducts()
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
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    // Filtro por precio
    filtered = filtered.filter(product => product.price >= priceFilter)

    setFilteredProductos(filtered)
  }, [productos, categoryFilter, priceFilter])

  const handleProductClick = (productId: number) => {
    navigate(`/producto/${productId}`)
  }

  const handleAddToCart = (e: React.MouseEvent, product: Producto) => {
    e.stopPropagation() // Evitar que se active la navegación al producto
    addToCart(product)
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
          {filteredProductos.map(producto => {
            const imageSrc = producto.image.startsWith('img/') 
              ? `/${producto.image}` 
              : producto.image

            return (
              <div 
                key={producto.id} 
                className="producto centrar-texto"
                onClick={() => handleProductClick(producto.id)}
                style={{ cursor: 'pointer' }}
              >
                <img src={imageSrc} alt={producto.name} />
                <p>{producto.name}</p>
                <p>${producto.price}</p>
                <button 
                  className="add"
                  onClick={(e) => handleAddToCart(e, producto)}
                  disabled={producto.stock <= 0}
                >
                  {producto.stock <= 0 ? 'Sin Stock' : 'Agregar Carrito'}
                </button>
              </div>
            )
          })}
          
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

export default TiendaPage 