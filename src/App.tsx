import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { CartProvider } from './context/CartContext'
import { MERCADOPAGO_CONFIG } from './config/mercadopago'
import Header from './components/Header'
import Footer from './components/Footer'
import PromotionalBanner from './components/PromotionalBanner'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import TiendaPage from './pages/TiendaPage'
import DetalleProductoPage from './pages/DetalleProductoPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactoPage from './pages/ContactoPage'
import FAQPage from './pages/FAQPage'
import TerminosYCondicionesPage from './pages/TerminosYCondicionesPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailurePage from './pages/PaymentFailurePage'
import PaymentPendingPage from './pages/PaymentPendingPage'
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AdminDropshippingPage = lazy(() => import('./pages/AdminDropshippingPage'))
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'))
const AdminClientesPage = lazy(() => import('./pages/AdminClientesPage')) // 🆕 Importar página de clientes
const AdminDescuentos = lazy(() => import('./pages/AdminDescuentos')) // 🆕 Importar página de descuentos
const AdminCupones = lazy(() => import('./pages/AdminCupones')) // 🆕 Importar página de cupones
const AdminEventos = lazy(() => import('./pages/AdminEventos'))
const AdminDuplicadosPage = lazy(() => import('./pages/AdminDuplicadosPage'))
import EventPage from './pages/EventPage'
import './css/style.css'
import './css/index.css'
import './css/tienda.css'
import './css/checkout.css'
import './css/contacto.css'
import './css/cart.css'
import './css/detalleProducto.css'
import './css/react-styles.css'
import './css/admin.css'
import './css/admin-clean.css' // 🆕 Importar estilos limpios
import './css/image-carousel.css' // 🆕 Importar estilos del carrusel
import './css/special-promotion.css' // 🆕 Importar estilos de promoción especial
import './css/featured-products.css' // 🆕 Importar estilos de productos destacados
import './css/discounted-products.css' // 🆕 Importar estilos de productos con descuento
import './css/best-selling-products.css' // 🆕 Importar estilos de productos más vendidos
import './css/customer-reviews.css' // 🆕 Importar estilos de reseñas
import './css/customer-reviews-new.css' // 🆕 Importar nuevos estilos de reseñas estilo imagen
import './css/admin-descuentos.css' // 🆕 Importar estilos de administración de descuentos
import './css/admin-cupones.css' // 🆕 Importar estilos de administración de cupones
import './css/promotional-banner.css' // 🆕 ÚLTIMO - Importar estilos del banner promocional con máxima prioridad
import './css/whatsapp-button.css' // 🆕 Importar estilos del botón de WhatsApp
import './css/welcome-section.css' // 🆕 Importar estilos de la sección de bienvenida
import './css/faq.css' // 🆕 Importar estilos de preguntas frecuentes
import './css/header-dropdown.css' // 🆕 Importar estilos del dropdown del header
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Inicializar MercadoPago con la public key y configuración en español
initMercadoPago(MERCADOPAGO_CONFIG.PUBLIC_KEY, { locale: 'es-AR' })

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            
            <Header />
            <PromotionalBanner />
            <WhatsAppButton />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
              {/* Tienda antigua desde BD - Route path="/tienda" element={<TiendaPage />} />} */ }
              <Route path="/tienda-ml" element={<TiendaPage />} />
              <Route path="/producto/:id" element={<DetalleProductoPage />} />
              <Route path="/eventos/:slug" element={<EventPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/preguntas-frecuentes" element={<FAQPage />} />
              <Route path="/terminos-y-condiciones" element={<TerminosYCondicionesPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Rutas de administración protegidas */}
              <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminPage /></Suspense></ProtectedRoute>} />
              <Route path="/admin/dropshipping" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminDropshippingPage /></Suspense></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminOrdersPage /></Suspense></ProtectedRoute>} />
              <Route path="/admin/clientes" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminClientesPage /></Suspense></ProtectedRoute>} /> {/* 🆕 Ruta de clientes */}
              <Route path="/admin/descuentos" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminDescuentos /></Suspense></ProtectedRoute>} /> {/* 🆕 Ruta de descuentos */}
              <Route path="/admin/cupones" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminCupones /></Suspense></ProtectedRoute>} /> {/* 🆕 Ruta de cupones */}
              <Route path="/admin/eventos" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminEventos /></Suspense></ProtectedRoute>} /> {/* 🆕 Ruta de eventos */}
              <Route path="/admin/duplicados" element={<ProtectedRoute><Suspense fallback={<div style={{padding:20}}>Cargando admin…</div>}><AdminDuplicadosPage /></Suspense></ProtectedRoute>} /> {/* 🆕 Ruta de duplicados */}
              
              {/* Rutas de resultado de pago */}
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/payment-failure" element={<PaymentFailurePage />} />
              <Route path="/payment-pending" element={<PaymentPendingPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
