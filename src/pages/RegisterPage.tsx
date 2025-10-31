import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/auth'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!nombre || !email || !password) {
      setError('Completa nombre, email y contraseña')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, letras y números')
      return
    }
    setLoading(true)
    try {
      await AuthService.register(nombre, email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Error registrando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Crear cuenta</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        <input type="password" placeholder="Repetir contraseña" value={password2} onChange={e => setPassword2(e.target.value)} />
        {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        <button className='btn-register' style={{color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer'}} type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrarse'}</button>
        <button type="button" onClick={() => navigate('/login')} style={{ background: '#eee', color: '#111' }}>Ir a Iniciar sesión</button>
      </form>
    </div>
  )
}

export default RegisterPage


