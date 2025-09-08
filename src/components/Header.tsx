import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()

  return (
    <>
      <header className="header">
        <img className="logo" src="/img/adidas-logo.png" alt="Logo-Adidas" />

        <div className="navbar">
          <ul>
            <li><Link to="/">Inicio</Link></li>
           { /*<li><Link to="/tienda">Tienda</Link></li> */ }
            <li><Link to="/tienda-ml">Productos </Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/admin" className="admin-link">Admin</Link></li>
            
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
