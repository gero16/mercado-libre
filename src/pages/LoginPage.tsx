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
    <main className="container" style={{ maxWidth: 400, padding: '40px 20px' }}>
      <h1 style={{ marginBottom: 20 }}>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="admin-search-input" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="admin-search-input" />
        </div>
        {error && (
          <div style={{ color: '#f85149', marginBottom: 12 }}>{error}</div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}

export default LoginPage
