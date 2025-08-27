import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TiendaMLPage from './pages/TiendaMLPage'
import DetalleProductoPage from './pages/DetalleProductoPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactoPage from './pages/ContactoPage'
import './css/style.css'
import './css/index.css'
import './css/tienda.css'
import './css/checkout.css'
import './css/contacto.css'
import './css/cart.css'
import './css/detalleProducto.css'
import './css/react-styles.css'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Route path="/tienda" element={<TiendaPage />} />} */ }
            <Route path="/tienda-ml" element={<TiendaMLPage />} />
            <Route path="/producto/:id" element={<DetalleProductoPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
          </Routes>
          
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App 