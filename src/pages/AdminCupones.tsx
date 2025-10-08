import React, { useState, useEffect } from 'react'
import { Cupon } from '../types'
import '../css/admin-cupones.css'

const AdminCupones: React.FC = () => {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null)
  
  // Estados para crear/editar cupón
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    tipo_descuento: 'porcentaje' as 'porcentaje' | 'monto_fijo',
    valor_descuento: 10,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    usos_maximos: '',
    monto_minimo_compra: '',
    limite_por_usuario: 1
  })

  // Cargar cupones
  useEffect(() => {
    fetchCupones()
  }, [])

  const fetchCupones = async () => {
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/cupones/listar')
      const data = await response.json()
      if (data.success) {
        setCupones(data.cupones)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error cargando cupones:', error)
      mostrarMensaje('error', 'Error al cargar cupones')
      setLoading(false)
    }
  }

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 5000)
  }

  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      descripcion: '',
      tipo_descuento: 'porcentaje',
      valor_descuento: 10,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      usos_maximos: '',
      monto_minimo_compra: '',
      limite_por_usuario: 1
    })
    setMostrarFormulario(false)
  }

  const handleCrearCupon = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('https://poppy-shop-production.up.railway.app/api/cupones/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          usos_maximos: formData.usos_maximos ? Number(formData.usos_maximos) : undefined,
          monto_minimo_compra: formData.monto_minimo_compra ? Number(formData.monto_minimo_compra) : undefined,
          fecha_fin: formData.fecha_fin || undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        mostrarMensaje('success', 'Cupón creado exitosamente')
        fetchCupones()
        limpiarFormulario()
      } else {
        mostrarMensaje('error', data.error || 'Error al crear cupón')
      }
    } catch (error) {
      console.error('Error creando cupón:', error)
      mostrarMensaje('error', 'Error al crear cupón')
    }
  }

  const handleToggleCupon = async (id: string) => {
    try {
      const response = await fetch(`https://poppy-shop-production.up.railway.app/api/cupones/toggle/${id}`, {
        method: 'PATCH'
      })

      const data = await response.json()
      
      if (data.success) {
        mostrarMensaje('success', `Cupón ${data.activo ? 'activado' : 'desactivado'} exitosamente`)
        fetchCupones()
      } else {
        mostrarMensaje('error', 'Error al cambiar estado del cupón')
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      mostrarMensaje('error', 'Error al cambiar estado del cupón')
    }
  }

  const handleEliminarCupon = async (id: string, codigo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el cupón "${codigo}"?`)) return

    try {
      const response = await fetch(`https://poppy-shop-production.up.railway.app/api/cupones/eliminar/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        mostrarMensaje('success', 'Cupón eliminado exitosamente')
        fetchCupones()
      } else {
        mostrarMensaje('error', 'Error al eliminar cupón')
      }
    } catch (error) {
      console.error('Error eliminando cupón:', error)
      mostrarMensaje('error', 'Error al eliminar cupón')
    }
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'Sin límite'
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  if (loading) {
    return (
      <div className="admin-cupones">
        <div className="container">
          <h1>Cargando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-cupones">
      <div className="container">
        <div className="admin-header-cupones">
          <h1 className="admin-title">🎟️ Gestión de Cupones</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Crear Nuevo Cupón'}
          </button>
        </div>

        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario de creación */}
        {mostrarFormulario && (
          <section className="seccion-formulario">
            <h2 className="seccion-titulo">✨ Crear Nuevo Cupón</h2>
            
            <form onSubmit={handleCrearCupon} className="formulario-cupon">
              <div className="form-row">
                <div className="form-group">
                  <label>Código del Cupón *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="VERANO2026"
                    required
                    maxLength={20}
                  />
                  <small>Será convertido a mayúsculas automáticamente</small>
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descuento de verano"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Descuento *</label>
                  <select
                    value={formData.tipo_descuento}
                    onChange={(e) => setFormData({ ...formData, tipo_descuento: e.target.value as 'porcentaje' | 'monto_fijo' })}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto Fijo (UYU)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Valor del Descuento * 
                    ({formData.tipo_descuento === 'porcentaje' ? '%' : 'UYU'})
                  </label>
                  <input
                    type="number"
                    value={formData.valor_descuento}
                    onChange={(e) => setFormData({ ...formData, valor_descuento: Number(e.target.value) })}
                    min="1"
                    max={formData.tipo_descuento === 'porcentaje' ? '100' : undefined}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin (Opcional)</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    min={formData.fecha_inicio}
                  />
                  <small>Dejar vacío para sin límite</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Usos Máximos (Opcional)</label>
                  <input
                    type="number"
                    value={formData.usos_maximos}
                    onChange={(e) => setFormData({ ...formData, usos_maximos: e.target.value })}
                    min="1"
                    placeholder="Sin límite"
                  />
                  <small>Cantidad total de veces que se puede usar</small>
                </div>

                <div className="form-group">
                  <label>Usos por Usuario</label>
                  <input
                    type="number"
                    value={formData.limite_por_usuario}
                    onChange={(e) => setFormData({ ...formData, limite_por_usuario: Number(e.target.value) })}
                    min="1"
                    required
                  />
                  <small>Cuántas veces puede usarlo el mismo usuario</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Monto Mínimo de Compra (Opcional)</label>
                  <input
                    type="number"
                    value={formData.monto_minimo_compra}
                    onChange={(e) => setFormData({ ...formData, monto_minimo_compra: e.target.value })}
                    min="0"
                    placeholder="Sin mínimo"
                  />
                  <small>Monto mínimo para aplicar el cupón (UYU)</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Cupón
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Lista de cupones */}
        <section className="seccion-cupones">
          <h2 className="seccion-titulo">
            📋 Cupones Existentes
            <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '10px', color: '#7f8c8d' }}>
              ({cupones.length} cupón{cupones.length !== 1 ? 'es' : ''})
            </span>
          </h2>

          {cupones.length === 0 ? (
            <p className="texto-vacio">No hay cupones creados aún</p>
          ) : (
            <div className="cupones-grid">
              {cupones.map((cupon) => (
                <div key={cupon._id} className={`cupon-card ${!cupon.activo ? 'inactivo' : ''}`}>
                  <div className="cupon-header">
                    <div className="cupon-codigo">
                      <span className="icono">🎟️</span>
                      <h3>{cupon.codigo}</h3>
                    </div>
                    <div className="cupon-estado">
                      <span className={`badge ${cupon.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {cupon.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <p className="cupon-descripcion">{cupon.descripcion}</p>

                  <div className="cupon-detalles">
                    <div className="detalle">
                      <span className="label">Descuento:</span>
                      <span className="value descuento-valor">
                        {cupon.tipo_descuento === 'porcentaje' 
                          ? `${cupon.valor_descuento}%` 
                          : `$${cupon.valor_descuento}`
                        }
                      </span>
                    </div>

                    <div className="detalle">
                      <span className="label">Válido hasta:</span>
                      <span className="value">{formatFecha(cupon.fecha_fin)}</span>
                    </div>

                    <div className="detalle">
                      <span className="label">Usos:</span>
                      <span className="value">
                        {cupon.usos_actuales} / {cupon.usos_maximos || '∞'}
                      </span>
                    </div>

                    {cupon.monto_minimo_compra && (
                      <div className="detalle">
                        <span className="label">Mínimo:</span>
                        <span className="value">${cupon.monto_minimo_compra}</span>
                      </div>
                    )}
                  </div>

                  <div className="cupon-acciones">
                    <button
                      className={`btn ${cupon.activo ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleCupon(cupon._id)}
                    >
                      {cupon.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleEliminarCupon(cupon._id, cupon.codigo)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminCupones

