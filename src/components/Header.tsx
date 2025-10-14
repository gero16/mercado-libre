import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()
  const navigate = useNavigate()
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const categories = [
    { id: 'mostrar-todo', name: '📋 Todos los Productos', icon: '📋' },
    { id: 'ereaders', name: '📚 E-readers y Kindle', icon: '📚' },
    { id: 'audio-parlantes', name: '🎵 Audio y Parlantes', icon: '🎵' },
    { id: 'smartwatches', name: '⌚ Smartwatches', icon: '⌚' },
    { id: 'asistentes-virtuales', name: '🏠 Asistentes Virtuales', icon: '🏠' },
    { id: 'seguridad-hogar', name: '🔔 Seguridad Hogar', icon: '🔔' },
    { id: 'memorias-storage', name: '💾 Memorias y Almacenamiento', icon: '💾' },
    { id: 'electronica', name: '📱 Electrónica', icon: '📱' },
    { id: 'gaming', name: '🎮 Gaming', icon: '🎮' },
    { id: 'camping-outdoor', name: '🏕️ Camping y Outdoor', icon: '🏕️' },
    { id: 'descanso-almohadas', name: '😴 Descanso y Almohadas', icon: '😴' },
    { id: 'hogar', name: '🏠 Hogar', icon: '🏠' },
    { id: 'cocina', name: '🍳 Cocina', icon: '🍳' },
    { id: 'bebes-ninos', name: '👶 Bebés y Niños', icon: '👶' },
    { id: 'tarjetas-coleccionables', name: '🎴 Tarjetas Coleccionables', icon: '🎴' },
    { id: 'mochilas-bolsos', name: '🎒 Mochilas y Bolsos', icon: '🎒' },
    { id: 'accesorios', name: '✏️ Accesorios', icon: '✏️' },
    { id: 'drones-foto', name: '🚁 Drones y Fotografía', icon: '🚁' },
    { id: 'deportes', name: '🏋️ Deportes y Fitness', icon: '🏋️' },
    { id: 'figuras-accion', name: '🗡️ Figuras de Acción', icon: '🗡️' },
    { id: 'harry-potter', name: '🪄 Harry Potter', icon: '🪄' },
    { id: 'mascotas', name: '🐾 Mascotas', icon: '🐾' },
    { id: 'piscina-jardin', name: '🏊 Piscina y Jardín', icon: '🏊' },
    { id: 'cuidado-personal', name: '💇 Cuidado Personal', icon: '💇' },
    { id: 'herramientas', name: '🔧 Herramientas', icon: '🔧' },
    { id: 'audio-musica', name: '🎵 Audio y Música', icon: '🎵' },
    { id: 'ciencia-educacion', name: '🔭 Ciencia y Educación', icon: '🔭' },
    { id: 'artes-marciales', name: '🥋 Artes Marciales', icon: '🥋' },
    { id: 'otros', name: '📦 Otros', icon: '📦' }
  ]

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tienda-ml', { state: { categoryFilter: categoryId } })
    setShowCategoriesDropdown(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tienda-ml?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('') // Limpiar el campo después de buscar
      setSearchOpen(false) // Cerrar el buscador después de buscar
    }
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    if (!searchOpen) {
      // Enfocar el input cuando se abre
      setTimeout(() => {
        document.getElementById('search-input')?.focus()
      }, 100)
    }
  }

  return (
    <>
      <header className="header">
        <img className="logo" src="/img/logo.png" alt="Logo-Adidas" />

        <div className="navbar">
          <ul>
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink></li>
            
            <li 
              className="dropdown-menu"
              onMouseEnter={() => setShowCategoriesDropdown(true)}
              onMouseLeave={() => setShowCategoriesDropdown(false)}
            >
              <NavLink to="/tienda-ml" className={({ isActive }) => isActive ? 'active' : ''}>
                Tienda Online ▾
              </NavLink>
              
              {showCategoriesDropdown && (
                <div className="dropdown-content">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className="dropdown-item"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span className="dropdown-icon">{category.icon}</span>
                      <span>{category.name.replace(category.icon + ' ', '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </li>
            
            <li><NavLink to="/contacto" className={({ isActive }) => isActive ? 'active' : ''}>Contacto</NavLink></li>
            <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Admin</NavLink></li>
            
            {/* Buscador colapsable */}
            <li style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {searchOpen && (
                <form 
                  onSubmit={handleSearch}
                  style={{
                    position: 'absolute',
                    right: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    animation: 'slideInRight 0.3s ease',
                    background: 'white',
                    padding: '5px',
                    borderRadius: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 10000
                  }}
                >
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 15px',
                      fontSize: '14px',
                      border: '2px solid var(--color-primary)',
                      borderRadius: '20px',
                      outline: 'none',
                      width: '250px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 15px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Buscar
                  </button>
                </form>
              )}
              <button
                onClick={toggleSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title="Buscar productos"
              >
                🔍
              </button>
            </li>
            
            <li>
              <button 
                className="cart-button" 
                onClick={() => setCartOpen(!cartOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <img className="carrito" src="/img/carrito.png" alt="Carrito" />
                <span className="numero-compras">{cartItemCount}</span>
              </button>
            </li>
          </ul>
        </div>
      </header>

      <ShoppingCart />
    </>
  )
}

export default Header
