import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthService } from '../services/auth'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Campos de dirección
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [apartamento, setApartamento] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [departamento, setDepartamento] = useState('')

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
      // Preparar datos adicionales si se proporcionaron
      const datosAdicionales: any = {}
      
      if (apellido) datosAdicionales.apellido = apellido
      if (telefono) datosAdicionales.telefono = telefono
      
      // Si hay al menos un campo de dirección, incluir todos
      if (calle || ciudad || departamento) {
        datosAdicionales.direccion = {
          ...(calle && { calle }),
          ...(numero && { numero }),
          ...(apartamento && { apartamento }),
          ...(codigoPostal && { codigo_postal: codigoPostal }),
          ...(ciudad && { ciudad }),
          ...(departamento && { departamento }),
          pais: 'Uruguay'
        }
      }
      
      await AuthService.register(
        nombre, 
        email, 
        password,
        Object.keys(datosAdicionales).length > 0 ? datosAdicionales : undefined
      )
      // Si venía desde checkout con cupón, redirigir de vuelta
      const state = location.state as { returnTo?: string; cupon?: string } | null
      if (state?.returnTo === '/checkout' && state?.cupon) {
        navigate('/checkout', { state: { cupon: state.cupon } })
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setError(err?.message || 'Error registrando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container div-register" style={{ maxWidth: 600 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Crear cuenta</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: '10px 0', fontSize: 16, fontWeight: 600 }}>Información básica</h3>
        <input 
          type="text" 
          placeholder="Nombre *" 
          value={nombre} 
          onChange={e => setNombre(e.target.value)} 
          required
        />
        <input 
          type="text" 
          placeholder="Apellido" 
          value={apellido} 
          onChange={e => setApellido(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Email *" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <input 
          type="tel" 
          placeholder="Teléfono" 
          value={telefono} 
          onChange={e => setTelefono(e.target.value)} 
        />
        
        <h3 style={{ margin: '20px 0 10px 0', fontSize: 16, fontWeight: 600 }}>Dirección</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <input 
            type="text" 
            placeholder="Calle" 
            value={calle} 
            onChange={e => setCalle(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Número" 
            value={numero} 
            onChange={e => setNumero(e.target.value)} 
          />
        </div>
        <input 
          type="text" 
          placeholder="Apartamento (opcional)" 
          value={apartamento} 
          onChange={e => setApartamento(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Código postal" 
          value={codigoPostal} 
          onChange={e => setCodigoPostal(e.target.value)} 
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input 
            type="text" 
            placeholder="Ciudad" 
            value={ciudad} 
            onChange={e => setCiudad(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Departamento" 
            value={departamento} 
            onChange={e => setDepartamento(e.target.value)} 
          />
        </div>
        
        <h3 style={{ margin: '20px 0 10px 0', fontSize: 16, fontWeight: 600 }}>Contraseña</h3>
        <input 
          type="password" 
          placeholder="Contraseña *" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Repetir contraseña *" 
          value={password2} 
          onChange={e => setPassword2(e.target.value)} 
          required
        />
        
        {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        <button 
          className='btn-register' 
          style={{
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            border: 'none', 
            cursor: 'pointer',
            marginTop: 10
          }} 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Registrarse'}
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/login')} 
          style={{ background: '#eee', color: '#111' }}
        >
          Ir a Iniciar sesión
        </button>
      </form>
    </div>
  )
}

export default RegisterPage


