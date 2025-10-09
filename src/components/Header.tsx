import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()
  const navigate = useNavigate()
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)

  const categories = [
    { id: 'mostrar-todo', name: '📋 Todos los Productos', icon: '📋' },
    { id: 'electronica', name: '📱 Electrónica', icon: '📱' },
    { id: 'gaming', name: '🎮 Gaming', icon: '🎮' },
    { id: 'hogar', name: '🏠 Hogar', icon: '🏠' },
    { id: 'deportes', name: '🏋️ Deportes', icon: '🏋️' },
    { id: 'mas-vendidos', name: '🏆 Más Vendidos', icon: '🏆' },
    { id: 'destacados', name: '⭐ Destacados', icon: '⭐' },
    { id: 'con-descuento', name: '🔥 Con Descuento', icon: '🔥' }
  ]

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tienda-ml', { state: { categoryFilter: categoryId } })
    setShowCategoriesDropdown(false)
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
