import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message || 'Error iniciando sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ padding: '30px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Accedé a tu cuenta</h1>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Gestioná tus compras y disfrutá de beneficios exclusivos.</p>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr', maxWidth: 1024, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr', alignItems: 'start' }}>
          {/* Card de acceso */}
          <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 20, maxWidth: 520, margin: '0 auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Iniciar sesión</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#374151' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="admin-search-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#374151' }}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="admin-search-input" />
              </div>
              {error && (
                <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>{error}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
                <button type="button" className="btn" style={{ background: 'transparent', color: '#0f62fe' }} onClick={() => navigate('/register')}>
                  ¿No tenés cuenta? Registrate
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: '#6b7280', fontSize: 13 }} onClick={() => navigate('/contacto')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </section>

      
        </div>
      </div>
    </main>
  )
}

export default LoginPage
