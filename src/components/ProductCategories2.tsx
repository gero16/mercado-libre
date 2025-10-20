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

const ProductCategories2: React.FC = () => {
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
  
  // Categorías secundarias a mostrar
  const mainCategories = [
    { 
      id: 'cocina', 
      name: 'Cocina', 
      icon: '🍳',
      description: 'Electrodomésticos y utensilios'
    },
    { 
      id: 'bebes-ninos', 
      name: 'Bebés y Niños', 
      icon: '👶',
      description: 'Todo para los más pequeños'
    },
    { 
      id: 'accesorios', 
      name: 'Accesorios', 
      icon: '🎒',
      description: 'Mochilas y complementos'
    },
    { 
      id: 'drones-foto', 
      name: 'Drones y Fotografía', 
      icon: '🚁',
      description: 'Tecnología audiovisual'
    }
  ]

  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        const response = await fetch('/ml/productos')
        const productos: ProductoML[] = await response.json()
        
        // Mapeo de categorías ML a categorías generales
        const mapeoCategorias: Record<string, string> = {
          'MLU442710': 'cocina', 'MLU196263': 'cocina', 'MLU416585': 'cocina',
          'MLU414038': 'cocina', 'MLU442747': 'cocina', 'MLU442751': 'cocina',
          'MLU455144': 'cocina', 'MLU74887': 'cocina', 'MLU74925': 'cocina',
          'MLU412348': 'cocina',
          'MLU178390': 'bebes-ninos', 'MLU443005': 'bebes-ninos', 'MLU412585': 'bebes-ninos',
          'MLU187852': 'bebes-ninos', 'MLU443022': 'bebes-ninos', 'MLU443133': 'bebes-ninos',
          'MLU1889': 'bebes-ninos', 'MLU40629': 'bebes-ninos', 'MLU457852': 'bebes-ninos',
          'MLU429242': 'bebes-ninos',
          'MLU190994': 'accesorios', 'MLU442981': 'accesorios', 'MLU187975': 'accesorios',
          'MLU26538': 'accesorios', 'MLU158838': 'accesorios', 'MLU434789': 'accesorios',
          'MLU178089': 'drones-foto', 'MLU413447': 'drones-foto', 'MLU413635': 'drones-foto',
          'MLU430406': 'drones-foto', 'MLU413444': 'drones-foto', 'MLU414123': 'drones-foto',
          'MLU1042': 'drones-foto'
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
            <h2 className="section-title">🎨 Más Categorías</h2>
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
          <h2 className="section-title">🎨 Más Categorías</h2>
          <p className="section-subtitle">Descubre más productos increíbles</p>
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

export default ProductCategories2

