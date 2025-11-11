import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'
import { MAPEO_CATEGORIAS, NOMBRES_CATEGORIAS, ICONOS_CATEGORIAS } from '../utils/categories'
import { parseNotificationSegments } from '../utils/notifications'
const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || PROD_BACKEND

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user, token } = useAuth() as any
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })
  const bodyOverflowRef = useRef<string | null>(null)
  const location = useLocation()

  const [categoryCounts, setCategoryCounts] = useState<{ id: string, count: number }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Notificaciones admin
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<any>>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false)

  const HEADER_NOTIFICATIONS_PAGE_SIZE = 10

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifs(true)
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications?page=1&pageSize=${HEADER_NOTIFICATIONS_PAGE_SIZE}&_ts=${Date.now()}`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error('Error cargando notificaciones')
      const data = await res.json()
      const items = Array.isArray(data?.items) ? data.items : []
      setNotifications(items)
      setUnreadCount(items.filter((n: any) => n.status === 'unread').length)
    } catch (e) {
      // silencioso
    } finally {
      setIsLoadingNotifs(false)
    }
  }

  const markNotificationRead = async (id: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/${id}/read`, { method: 'PATCH', headers })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  useEffect(() => {
    if (location.pathname === '/login') {
      setLoadingCategories(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ml/categories/distinct?onlyActive=true&requireImage=true&onlyInStock=true&_ts=${Date.now()}` , { cache: 'no-store', headers: { Accept: 'application/json' } })
        const json = await res.json()
        if (!mounted) return
        let cats = (json?.categories || []).map((c: any) => {
          const slug = (MAPEO_CATEGORIAS[c.category_id] || 'otros') as string
          return { id: slug, count: c.count as number }
        })

        // Fallback: si no hay categorías activas, incluir también pausadas
        if (!cats.length) {
          const resAll = await fetch(`${API_BASE_URL}/ml/categories/distinct?onlyActive=false&requireImage=true&onlyInStock=false&_ts=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } })
          const jsonAll = await resAll.json()
          cats = (jsonAll?.categories || []).map((c: any) => {
            const slug = (MAPEO_CATEGORIAS[c.category_id] || 'otros') as string
            return { id: slug, count: c.count as number }
          })
        }

        // Fallback 2: si aún no hay categorías, construir desde categorias-simples
        if (!cats.length) {
          try {
            const resSimple = await fetch(`${API_BASE_URL}/ml/categorias-simples?_ts=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } })
            const jsonSimple = await resSimple.json()
            const arr = (jsonSimple?.categories || []) as Array<{ id?: string, category_id?: string, count?: number }>
            cats = arr.map((c: any) => {
              const raw = c.id || c.category_id
              const slug = (MAPEO_CATEGORIAS[raw] || 'otros') as string
              return { id: slug, count: Number(c.count || 0) }
            })
          } catch (e) {
            // ignorar
          }
        }
        // Consolidar por slug
        const map = new Map<string, number>()
        for (const c of cats) map.set(c.id, (map.get(c.id) || 0) + c.count)
        const consolidated = Array.from(map.entries()).map(([id, count]) => ({ id, count }))
        setCategoryCounts(consolidated)
      } catch (e) {
        setCategoryCounts([])
      } finally {
        if (mounted) setLoadingCategories(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [location.pathname])

  // Cargar notificaciones periódicamente solo para admin autenticado
  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'admin') return
    let mounted = true
    fetchNotifications()
    const id = setInterval(() => { if (mounted) fetchNotifications() }, 60000)
    return () => { mounted = false; clearInterval(id) }
  }, [isAuthenticated, user?.rol])

  // Construir categorías dinámicas con conteo > 0
  const dynamicCategories = useMemo(() => {
    const entries = (categoryCounts || [])
      .filter(c => c.id && c.count > 0)
      .map(c => ({
        id: c.id,
        name: `${ICONOS_CATEGORIAS[c.id] || ''} ${NOMBRES_CATEGORIAS[c.id] || c.id}`.trim(),
        icon: ICONOS_CATEGORIAS[c.id] || '',
        count: c.count,
      }))

    entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    return [
      { id: 'mostrar-todo', name: '📋 Todos los Productos', icon: '📋', count: entries.reduce((s, e) => s + e.count, 0) },
      ...entries,
    ]
  }, [categoryCounts])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setShowCategoriesDropdown(false)
    setNotifyOpen(false)
    setCategoriesExpanded(false)
  }
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => {
      const next = !prev
      if (!next) {
        setShowCategoriesDropdown(false)
        setNotifyOpen(false)
        setCategoriesExpanded(false)
      }
      return next
    })
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate('/tienda-ml', { state: { categoryFilter: categoryId } })
    setShowCategoriesDropdown(false)
    setCategoriesExpanded(false)
    closeMobileMenu()
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

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
        setShowCategoriesDropdown(false)
        setNotifyOpen(false)
        setCategoriesExpanded(false)
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (bodyOverflowRef.current === null) {
      bodyOverflowRef.current = document.body.style.overflow || ''
    }
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = bodyOverflowRef.current || ''
    }
    return () => {
      document.body.style.overflow = bodyOverflowRef.current || ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="header">
        <img className="logo" src="/img/logo.png" alt="Logo-Adidas" />

        {isMobile && (
          <div className="mobile-quick-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `mobile-quick-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/tienda-ml"
              className={({ isActive }) => `mobile-quick-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Tienda
            </NavLink>
            <NavLink
              to="/contacto"
              className={({ isActive }) => `mobile-quick-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Contacto
            </NavLink>
            <button
              className="mobile-cart-button"
              onClick={() => { setCartOpen(!cartOpen); closeMobileMenu() }}
              aria-label="Ver carrito"
            >
              <img className="carrito" src="/img/carrito.png" alt="Carrito" />
              {cartItemCount > 0 && <span className="mobile-cart-count">{cartItemCount}</span>}
            </button>
          </div>
        )}

        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            {!isMobile && (
              <li>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                  Inicio
                </NavLink>
              </li>
            )}

            <li 
              className={`dropdown-menu ${isMobile ? 'mobile' : ''}`}
              onMouseEnter={!isMobile ? () => setShowCategoriesDropdown(true) : undefined}
              onMouseLeave={!isMobile ? () => setShowCategoriesDropdown(false) : undefined}
            >
              <div className="category-trigger">
                <NavLink
                  to="/tienda-ml"
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={closeMobileMenu}
                >
                  Tienda Online
                </NavLink>
                {isMobile ? (
                  <button
                    type="button"
                    className="category-toggle"
                    onClick={() => setCategoriesExpanded(prev => !prev)}
                    aria-expanded={categoriesExpanded}
                  >
                    {categoriesExpanded ? '▲' : '▼'}
                  </button>
                ) : (
                  <span className="category-caret">▾</span>
                )}
              </div>
              
              {(isMobile ? categoriesExpanded : showCategoriesDropdown) && (
                <div className="dropdown-content">
                  {(loadingCategories ? [] : dynamicCategories).map(category => (
                    <button
                      key={category.id}
                      className="dropdown-item"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span className="dropdown-icon">{category.icon}</span>
                      <span>{category.name.replace((category.icon || '') + ' ', '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </li>
            
            {!isMobile && (
              <li>
                <NavLink to="/contacto" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                  Contacto
                </NavLink>
              </li>
            )}

            {/* Link directo a panel Admin */}
            {isAuthenticated && user?.rol === 'admin' && (
              <li className={isMobile ? 'admin-link-mobile' : undefined}>
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Admin</NavLink>
              </li>
            )}

            {/* Notificaciones admin */}
            {!isMobile && isAuthenticated && user?.rol === 'admin' && (
              <li style={{ position: 'relative' }}
                  onMouseEnter={() => { setNotifyOpen(true); if (!notifications.length) fetchNotifications() }}
                  onMouseLeave={() => setNotifyOpen(false)}>
                <button
                  className="notify-bell"
                  onClick={() => { setNotifyOpen(o => !o); if (!notifications.length) fetchNotifications() }}
                  title="Notificaciones"
                  style={{ position: 'relative', background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
                >
                  🔔
                  {unreadCount > 0 && <span className="notify-badge">{unreadCount}</span>}
                </button>
                {notifyOpen && (
                  <div className="notify-dropdown">
                    <div className="notify-header">Notificaciones</div>
                    <div className="notify-list">
                      {isLoadingNotifs && <div className="notify-empty">Cargando…</div>}
                      {!isLoadingNotifs && notifications.length === 0 && (
                        <div className="notify-empty">Sin notificaciones</div>
                      )}
                      {notifications.map((n) => {
                        const segments = parseNotificationSegments(n?.message)

                        return (
                          <div key={n._id} className={`notify-item ${n.status === 'unread' ? 'unread' : ''}`}>
                            <div className="notify-main">
                              <div className="notify-body">
                                {segments.length === 0 ? (
                                  <div className="notify-line primary">
                                    <span className="notify-value">{n.message || 'Notificación'}</span>
                                  </div>
                                ) : (
                                  segments.map((segment, idx) => (
                                    <div key={idx} className={`notify-line ${segment.isPrimary ? 'primary' : ''}`}>
                                      {segment.label ? (
                                        <>
                                          <span className="notify-label">{segment.label}</span>
                                          <span className="notify-value">{segment.value}</span>
                                        </>
                                      ) : (
                                        <span className="notify-value">{segment.value}</span>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="notify-meta">
                                {n.type && (
                                  <span className="notify-chip">
                                    {(n.type || '').toString().toUpperCase()}
                                  </span>
                                )}
                                {n.total ? <span className="notify-amount">${n.total} {n.currency || ''}</span> : null}
                                {n.customer_email ? <span className="notify-email">{n.customer_email}</span> : null}
                              </div>
                            </div>
                            {n.status === 'unread' && (
                              <button className="notify-read" onClick={() => markNotificationRead(n._id)}>Marcar leída</button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="notify-footer" style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                      <button className="notify-refresh" onClick={fetchNotifications}>Actualizar</button>
                      <button className="notify-refresh" onClick={() => navigate('/admin/notificaciones')}>Ver todas</button>
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* Autenticación */}
            {!isAuthenticated ? (
              <li><NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Ingresar</NavLink></li>
            ) : (
              <>
                <li className="auth-action">
                  <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                    Mi Perfil
                  </NavLink>
                </li>
                <li className="auth-action">
                  <button
                    onClick={() => { logout(); navigate('/'); closeMobileMenu(); }}
                    className="btn-orden logout-button"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            )}
            
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
            
            {!isMobile && (
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
            )}
          </ul>
        </nav>
      </header>

      <ShoppingCart />
    </>
  )
}

export default Header
