import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService, ClientePerfil } from '../services/auth'
import { useAuth } from '../context/AuthContext'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [perfil, setPerfil] = useState<ClientePerfil | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [apartamento, setApartamento] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [pais, setPais] = useState('Uruguay')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadProfile()
  }, [isAuthenticated, navigate])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await AuthService.getProfile()
      if (data) {
        setPerfil(data)
        setNombre(data.nombre)
        setApellido(data.apellido)
        setTelefono(data.telefono)
        setCalle(data.direccion.calle)
        setNumero(data.direccion.numero)
        setApartamento(data.direccion.apartamento || '')
        setCodigoPostal(data.direccion.codigo_postal)
        setCiudad(data.direccion.ciudad)
        setDepartamento(data.direccion.departamento)
        setPais(data.direccion.pais)
      } else {
        // Si no hay perfil, activar modo edición para crear uno
        setEditMode(true)
      }
    } catch (err: any) {
      setError(err?.message || 'Error cargando perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const perfilData = {
        nombre,
        apellido,
        telefono,
        direccion: {
          calle,
          numero,
          apartamento: apartamento || undefined,
          codigo_postal: codigoPostal,
          ciudad,
          departamento,
          pais
        }
      }

      const updated = await AuthService.updateProfile(perfilData)
      setPerfil(updated)
      setEditMode(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || 'Error guardando perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 700, padding: '40px 20px' }}>
      <h2 style={{ marginBottom: 30 }}>Mi Perfil</h2>

      {success && (
        <div style={{ 
          background: '#10b981', 
          color: 'white', 
          padding: '12px', 
          borderRadius: '5px', 
          marginBottom: 20 
        }}>
          Perfil actualizado exitosamente
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#ef4444', 
          color: 'white', 
          padding: '12px', 
          borderRadius: '5px', 
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}

      {!editMode && perfil ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h3 style={{ margin: 0 }}>Información Personal</h3>
            <button 
              onClick={() => setEditMode(true)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Editar
            </button>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}
            </div>
            <div>
              <strong>Email:</strong> {perfil.email}
            </div>
            <div>
              <strong>Teléfono:</strong> {perfil.telefono}
            </div>
            <div>
              <strong>Dirección:</strong> {perfil.direccion.calle} {perfil.direccion.numero}
              {perfil.direccion.apartamento && `, Apt. ${perfil.direccion.apartamento}`}
            </div>
            <div>
              <strong>Código Postal:</strong> {perfil.direccion.codigo_postal}
            </div>
            <div>
              <strong>Ciudad:</strong> {perfil.direccion.ciudad}
            </div>
            <div>
              <strong>Departamento:</strong> {perfil.direccion.departamento}
            </div>
            <div>
              <strong>País:</strong> {perfil.direccion.pais}
            </div>
            {perfil.fecha_registro && (
              <div>
                <strong>Miembro desde:</strong> {new Date(perfil.fecha_registro).toLocaleDateString('es-UY')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 15 }}>
          <h3 style={{ marginBottom: 10 }}>Información Personal</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              type="text"
              placeholder="Nombre *"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Apellido *"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={perfil?.email || ''}
            disabled
            style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
          />

          <input
            type="tel"
            placeholder="Teléfono *"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            required
          />

          <h3 style={{ marginTop: 20, marginBottom: 10 }}>Dirección</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <input
              type="text"
              placeholder="Calle *"
              value={calle}
              onChange={e => setCalle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Número *"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              required
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
            placeholder="Código postal *"
            value={codigoPostal}
            onChange={e => setCodigoPostal(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              type="text"
              placeholder="Ciudad *"
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Departamento *"
              value={departamento}
              onChange={e => setDepartamento(e.target.value)}
              required
            />
          </div>

          <input
            type="text"
            placeholder="País"
            value={pais}
            onChange={e => setPais(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {perfil && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false)
                  loadProfile()
                }}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default ProfilePage

