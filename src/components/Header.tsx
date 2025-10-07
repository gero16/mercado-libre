import React from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()

  return (
    <>
      <header className="header">
        <img className="logo" src="/img/logo.png" alt="Logo-Adidas" />

        <div className="navbar">
          <ul>
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink></li>
           { /*<li><NavLink to="/tienda">Tienda</NavLink></li> */ }
            <li><NavLink to="/tienda-ml" className={({ isActive }) => isActive ? 'active' : ''}>Productos </NavLink></li>
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
