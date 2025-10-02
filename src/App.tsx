import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { CartProvider } from './context/CartContext'
import { MERCADOPAGO_CONFIG } from './config/mercadopago'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TiendaPage from './pages/TiendaPage'
import DetalleProductoPage from './pages/DetalleProductoPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactoPage from './pages/ContactoPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailurePage from './pages/PaymentFailurePage'
import PaymentPendingPage from './pages/PaymentPendingPage'
import AdminPage from './pages/AdminPage'
import AdminDropshippingPage from './pages/AdminDropshippingPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminClientesPage from './pages/AdminClientesPage' // 🆕 Importar página de clientes
import './css/style.css'
import './css/index.css'
import './css/tienda.css'
import './css/checkout.css'
import './css/contacto.css'
import './css/cart.css'
import './css/detalleProducto.css'
import './css/react-styles.css'
import './css/admin.css'
import './css/admin-clientes.css' // 🆕 Importar estilos de clientes

// Inicializar MercadoPago con la public key y configuración en español
initMercadoPago(MERCADOPAGO_CONFIG.PUBLIC_KEY, { locale: 'es-AR' })

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Tienda antigua desde BD - Route path="/tienda" element={<TiendaPage />} />} */ }
            <Route path="/tienda-ml" element={<TiendaPage />} />
            <Route path="/producto/:id" element={<DetalleProductoPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            
            {/* Rutas de administración */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/dropshipping" element={<AdminDropshippingPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/clientes" element={<AdminClientesPage />} /> {/* 🆕 Ruta de clientes */}
            
            {/* Rutas de resultado de pago */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failure" element={<PaymentFailurePage />} />
            <Route path="/payment-pending" element={<PaymentPendingPage />} />
          </Routes>
          
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
