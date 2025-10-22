import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ShoppingCart from './ShoppingCart'
import { MAPEO_CATEGORIAS, NOMBRES_CATEGORIAS, ICONOS_CATEGORIAS } from '../utils/categories'
const PROD_BACKEND = 'https://poppy-shop-production.up.railway.app'
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || PROD_BACKEND

const Header: React.FC = () => {
  const { cartItemCount, setCartOpen, cartOpen } = useCart()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  const [categoryCounts, setCategoryCounts] = useState<{ id: string, count: number }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

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
            
            <li><NavLink to="/contacto" className={({ isActive }) => isActive ? 'active' : ''}>Contacto</NavLink></li>

            {/* Autenticación */}
            {!isAuthenticated ? (
              <li><NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Ingresar</NavLink></li>
            ) : (
              <li>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="btn-orden"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  Cerrar sesión
                </button>
              </li>
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
