import React from 'react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { FEATURE_FLAGS } from '../config/featureFlags'

const ShoppingCart: React.FC = () => {
  const { 
    cartOpen, 
    setCartOpen, 
    cartItems, 
    cartTotal, 
    removeFromCart, 
    updateQuantity 
  } = useCart()

  if (!cartOpen) return null

  return (
    <div className="carritoHTML" style={{ display: 'block' }}>
      <div className="titulo-carrito centrar-texto">
        <span className="ocultar-carrito" onClick={() => setCartOpen(false)}>X</span>
        <p>Carrito de Compras</p>
      </div>
    
      {cartItems.length === 0 ? (
        <div className="producto-vacio centrar-texto">
          <p className="carrito-vacio">No hay productos en su Carrito</p>
        </div>
      ) : (
        <div className="productos-carrito">
          {cartItems.map(item => (
            <div key={item.id} className="producto-carrito">
              <img 
                className="img-comprar" 
                src={item.image.startsWith('img/') ? `/${item.image}` : item.image} 
                alt={item.name} 
              />
              
              <div className="div-contenido-carrito centrar-texto">
                <p>{item.name}</p>
                <p>US$ {item.price * item.cantidad}</p>
                
                <div className="stock">
                  <span 
                    className="restar"
                    onClick={() => updateQuantity(item, item.cantidad - 1)}
                  >
                    -
                  </span>
                  <input 
                    className="input-carrito centrar-texto" 
                    value={item.cantidad} 
                    readOnly
                  />
                  <span 
                    className="sumar"
                    onClick={() => updateQuantity(item, item.cantidad + 1)}
                  >
                    +
                  </span>
                </div>
              </div>
              
              <span 
                className="btn-borrar"
                onClick={() => removeFromCart(item)}
              >
                x
              </span>
            </div>
          ))}
        </div>
      )}
    
      <div className="div-sub-total">
        <h3>SubTotal:</h3> 
        <p className="sub-total">US$ {cartTotal}</p>
      </div>
    
      <div className="div-comprar">
        {FEATURE_FLAGS.DISABLE_CHECKOUT ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <button className="comprar" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              Compras deshabilitadas temporalmente
            </button>
          </div>
        ) : (
          <button className="comprar">
            <Link to="/checkout">Comprar</Link>
          </button>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart 