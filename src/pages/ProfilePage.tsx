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
  const [activeTab, setActiveTab] = useState<'info' | 'direccion'>('info')

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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 10000 }}>
      <div style={{ width: 'min(760px, 96vw)', borderRadius: 12, background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#111827', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: success ? '#10b981' : '#60a5fa' }} />
            <h3 style={{ margin: 0, fontSize: 18 }}>Mi Perfil</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Editar</button>
            )}
            <button onClick={() => navigate(-1)} style={{ padding: 6, width: 34, height: 34, borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', color: '#111', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Alertas */}
        {success && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 14px', fontSize: 14 }}>Perfil actualizado exitosamente</div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', fontSize: 14 }}>{error}</div>
        )}

        {/* Body modal sin scroll: usar pestañas para comprimir */}
        <div style={{ padding: 16 }}>
          {/* Tabs sólo en modo edición */}
          {editMode && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: activeTab === 'info' ? '#3b82f6' : '#e5e7eb',
                  background: activeTab === 'info' ? '#eff6ff' : 'white',
                  color: '#111827',
                  cursor: 'pointer'
                }}
              >
                Información
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('direccion')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: activeTab === 'direccion' ? '#3b82f6' : '#e5e7eb',
                  background: activeTab === 'direccion' ? '#eff6ff' : 'white',
                  color: '#111827',
                  cursor: 'pointer'
                }}
              >
                Dirección
              </button>
            </div>
          )}

          {/* Contenido: vista compacta si no edita */}
          {!editMode && perfil && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ fontSize: 14 }}><strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}</div>
              <div style={{ fontSize: 14 }}><strong>Email:</strong> {perfil.email}</div>
              <div style={{ fontSize: 14 }}><strong>Teléfono:</strong> {perfil.telefono}</div>
              <div style={{ fontSize: 14 }}>
                <strong>Dirección:</strong> {perfil.direccion.calle} {perfil.direccion.numero}{perfil.direccion.apartamento ? `, Apt. ${perfil.direccion.apartamento}` : ''}
              </div>
              <div style={{ fontSize: 14 }}><strong>CP:</strong> {perfil.direccion.codigo_postal}</div>
              <div style={{ fontSize: 14 }}><strong>Ciudad:</strong> {perfil.direccion.ciudad}</div>
              <div style={{ fontSize: 14 }}><strong>Departamento:</strong> {perfil.direccion.departamento}</div>
              <div style={{ fontSize: 14 }}><strong>País:</strong> {perfil.direccion.pais}</div>
            </div>
          )}

          {/* Formulario por pestañas en modo edición */}
          {editMode && (
            <form onSubmit={handleSubmit}>
              {activeTab === 'info' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="text" placeholder="Nombre *" value={nombre} onChange={e => setNombre(e.target.value)} required />
                  <input type="text" placeholder="Apellido *" value={apellido} onChange={e => setApellido(e.target.value)} required />
                  <input type="email" placeholder="Email" value={perfil?.email || ''} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
                  <input type="tel" placeholder="Teléfono *" value={telefono} onChange={e => setTelefono(e.target.value)} required />
                </div>
              )}

              {activeTab === 'direccion' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <input type="text" placeholder="Calle *" value={calle} onChange={e => setCalle(e.target.value)} required />
                  <input type="text" placeholder="Número *" value={numero} onChange={e => setNumero(e.target.value)} required />
                  <input type="text" placeholder="Apartamento (opcional)" value={apartamento} onChange={e => setApartamento(e.target.value)} />
                  <input type="text" placeholder="Código postal *" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} required />
                  <input type="text" placeholder="Ciudad *" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
                  <input type="text" placeholder="Departamento *" value={departamento} onChange={e => setDepartamento(e.target.value)} required />
                  <input type="text" placeholder="País" value={pais} onChange={e => setPais(e.target.value)} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                {perfil && (
                  <button type="button" onClick={() => { setEditMode(false); setActiveTab('info'); loadProfile() }} style={{ padding: '10px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
                )}
                <button type="submit" disabled={saving} style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Footer compacto con acciones rápidas */}
        {!editMode && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 12, borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
            <button onClick={() => setEditMode(true)} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Editar</button>
            <button onClick={() => navigate(-1)} style={{ padding: '8px 12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Cerrar</button>
          </div>
        )}
      </div>

      {/* Loader superpuesto si está cargando */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>Cargando…</div>
      )}
    </div>
  )
}

export default ProfilePage

