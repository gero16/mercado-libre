import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML } from '../types'
import '../css/product-categories.css'

interface Category {
  id: string
  name: string
  icon: string
  image: string
  description: string
}

const ProductCategories: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [productosPorCategoria, setProductosPorCategoria] = useState<Record<string, ProductoML[]>>({})
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({})
  
  // Función para obtener URL de imagen grande
  const getLargeImageUrl = (url: string) => {
    // Mercado Libre usa diferentes sufijos para diferentes tamaños:
    // -I.jpg = Original (muy grande)
    // -O.jpg = 500x500px (grande)
    // -V.jpg = 250x250px (mediano)
    // -S.jpg = 150x150px (pequeño)
    if (!url) return url
    return url.replace(/-[IOSV]\.jpg$/, '-O.jpg')
  }
  
  // Categorías principales a mostrar
  const mainCategories = [
    { 
      id: 'electronica', 
      name: 'Electrónica', 
      icon: '📱',
      description: 'Tecnología y dispositivos'
    },
    { 
      id: 'gaming', 
      name: 'Gaming', 
      icon: '🎮',
      description: 'Consolas y juegos'
    },
    { 
      id: 'hogar', 
      name: 'Hogar', 
      icon: '🏠',
      description: 'Decoración y muebles'
    },
    { 
      id: 'deportes', 
      name: 'Deportes', 
      icon: '🏋️',
      description: 'Ropa y equipos deportivos'
    }
  ]

  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        const response = await fetch('https://poppy-shop-production.up.railway.app/ml/productos')
        const productos: ProductoML[] = await response.json()
        
        // Mapeo de categorías ML a categorías generales
        const mapeoCategorias: Record<string, string> = {
          'MLU163646': 'electronica', 'MLU163764': 'electronica', 'MLU163765': 'electronica',
          'MLU163771': 'electronica', 'MLU168248': 'electronica', 'MLU3697': 'electronica',
          'MLU6344': 'gaming', 'MLU443628': 'gaming', 'MLU448172': 'gaming',
          'MLU443741': 'gaming', 'MLU10858': 'gaming',
          'MLU12201': 'hogar', 'MLU7969': 'hogar', 'MLU40398': 'hogar',
          'MLU205198': 'hogar', 'MLU43687': 'hogar',
          'MLU165701': 'deportes', 'MLU165785': 'deportes', 'MLU413593': 'deportes'
        }
        
        // Agrupar productos por categoría
        const productosPorCat: Record<string, ProductoML[]> = {}
        mainCategories.forEach(cat => {
          productosPorCat[cat.id] = productos.filter(p => {
            const categoriaGeneral = mapeoCategorias[p.category_id || '']
            return categoriaGeneral === cat.id && p.images && p.images.length > 0
          })
        })
        
        setProductosPorCategoria(productosPorCat)
        
        // Inicializar índices de imágenes
        const initialIndexes: Record<string, number> = {}
        mainCategories.forEach(cat => {
          initialIndexes[cat.id] = 0
        })
        setImageIndexes(initialIndexes)
        
        // Obtener imagen inicial de cada categoría
        const categoriasConImagenes = mainCategories.map(cat => {
          const productosDeCategoria = productosPorCat[cat.id]
          const productoInicial = productosDeCategoria && productosDeCategoria.length > 0 
            ? productosDeCategoria[0] 
            : null
          
          const imageUrl = productoInicial?.images[0]?.url || productoInicial?.main_image || '/img/portada4.jpg'
          
          return {
            ...cat,
            image: getLargeImageUrl(imageUrl)
          }
        })
        
        setCategories(categoriasConImagenes)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando imágenes de categorías:', error)
        // Fallback con imágenes locales
        setCategories(mainCategories.map(cat => ({
          ...cat,
          image: '/img/portada4.jpg'
        })))
        setLoading(false)
      }
    }
    
    fetchCategoryImages()
  }, [])
  
  // Efecto para rotar las imágenes cada 5 segundos
  useEffect(() => {
    if (Object.keys(productosPorCategoria).length === 0) return
    
    const interval = setInterval(() => {
      setImageIndexes(prevIndexes => {
        const newIndexes = { ...prevIndexes }
        
        // Actualizar índice para cada categoría
        mainCategories.forEach(cat => {
          const productosDeCategoria = productosPorCategoria[cat.id]
          if (productosDeCategoria && productosDeCategoria.length > 1) {
            newIndexes[cat.id] = (prevIndexes[cat.id] + 1) % productosDeCategoria.length
          }
        })
        
        return newIndexes
      })
      
      // Actualizar las imágenes de las categorías
      setCategories(prevCategories => {
        return prevCategories.map(cat => {
          const productosDeCategoria = productosPorCategoria[cat.id]
          if (!productosDeCategoria || productosDeCategoria.length === 0) return cat
          
          const currentIndex = imageIndexes[cat.id] || 0
          const nextIndex = (currentIndex + 1) % productosDeCategoria.length
          const producto = productosDeCategoria[nextIndex]
          
          const imageUrl = producto?.images[0]?.url || producto?.main_image || cat.image
          
          return {
            ...cat,
            image: getLargeImageUrl(imageUrl)
          }
        })
      })
    }, 5000) // Cambiar cada 5 segundos
    
    return () => clearInterval(interval)
  }, [productosPorCategoria, imageIndexes])

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tienda-ml', { state: { categoryFilter: categoryId } })
  }

  if (loading) {
    return (
      <section className="product-categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🛍️ Explora nuestros productos</h2>
            <p className="section-subtitle">Cargando categorías...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="product-categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">🛍️ Explora nuestros productos </h2>
          <p className="section-subtitle">Encuentra lo que buscas fácilmente</p>
        </div>
        
        <div className="categories-grid-visual">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="category-card-visual"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-image-wrapper">
                <img 
                  key={`${category.id}-${category.image}`}
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                />
                <div className="category-overlay">
                  <span className="category-icon">{category.icon}</span>
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategories 