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
          'MLU6344': 'gaming', 'MLU443628': 'gaming', 'MLU448172': 'gaming',
          'MLU12201': 'hogar', 'MLU7969': 'hogar', 'MLU40398': 'hogar',
          'MLU165701': 'deportes', 'MLU165785': 'deportes', 'MLU413593': 'deportes'
        }
        
        // Obtener imagen representativa de cada categoría
        const categoriasConImagenes = mainCategories.map(cat => {
          const productoCategoria = productos.find(p => {
            const categoriaGeneral = mapeoCategorias[p.category_id || '']
            return categoriaGeneral === cat.id && p.images && p.images.length > 0
          })
          
          return {
            ...cat,
            image: productoCategoria?.images[0]?.url || productoCategoria?.main_image || '/img/portada4.jpg'
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

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tienda-ml', { state: { categoryFilter: categoryId } })
  }

  if (loading) {
    return (
      <section className="product-categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🛍️ Explora por Categorías</h2>
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
          <h2 className="section-title">🛍️ Explora por Categorías</h2>
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