import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductoML } from '../types'
import '../css/product-categories.css'

const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || PROD_BACKEND

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
  const [productosPorCategoria] = useState<Record<string, ProductoML[]>>({})
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
      let isMounted = true
      let resolved = false

      const url = `${API_BASE_URL}/ml/home/categories?kind=main&_ts=${Date.now()}`

      // Timeout no bloqueante: si supera 2s, mostramos fallback; el fetch sigue en segundo plano
      const fallbackTimer = setTimeout(() => {
        if (!isMounted || resolved) return
        setCategories(mainCategories.map(cat => ({
          ...cat,
          image: '/img/portada4.jpg'
        })))
        setLoading(false)
      }, 2000)

      const doFetch = async () => {
        try {
          const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const data = await response.json()
          const categoriesResp = (data && data.categories) || []
          if (!isMounted) return

          // Inicializar índices de imágenes
          const initialIndexes: Record<string, number> = {}
          mainCategories.forEach(cat => {
            initialIndexes[cat.id] = 0
          })
          setImageIndexes(initialIndexes)

          // Obtener imagen inicial de cada categoría desde backend
          const categoriasConImagenes = mainCategories.map(cat => {
            const found = categoriesResp.find((c: any) => c.id === cat.id)
            const imageUrl = found?.image || '/img/portada4.jpg'

            return {
              ...cat,
              image: getLargeImageUrl(imageUrl)
            }
          })

          setCategories(categoriasConImagenes)
          setLoading(false)
          resolved = true
          clearTimeout(fallbackTimer)
        } catch (error: any) {
          if (!isMounted) return
          // No loggear Timeout/Abort como error ruidoso
          if (error?.name !== 'AbortError') {
            console.error('Error cargando imágenes de categorías:', error)
          }
          if (!resolved) {
            setCategories(mainCategories.map(cat => ({
              ...cat,
              image: '/img/portada4.jpg'
            })))
            setLoading(false)
            resolved = true
          }
          clearTimeout(fallbackTimer)
        }
      }

      doFetch()

      return () => {
        isMounted = false
        clearTimeout(fallbackTimer)
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