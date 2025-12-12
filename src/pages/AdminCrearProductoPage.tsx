import React, { useState } from 'react';

// Componente para crear productos completos
const AdminCrearProductoPage: React.FC = () => {
  // --- Estados principales ---
  const [mlId, setMlId] = useState('LOCAL-' + Math.floor(Math.random() * 99999));
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [status, setStatus] = useState('active');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');

  // Imágenes adicionales
  const [images, setImages] = useState<string[]>([]);

  // Atributos: lista de pares (nombre, valor)
  const [attributes, setAttributes] = useState([{ id: '', name: '', value_name: '' }]);

  // Variantes
  const [variantes, setVariantes] = useState<any[]>([]);

  // Tipo de venta y bloques
  const [tipoVenta, setTipoVenta] = useState<'stock_fisico' | 'dropshipping' | 'mixto'>('stock_fisico');
  const [stockFisico, setStockFisico] = useState({ cantidad_disponible: '', ubicacion: '', reorder_point: '' });
  const [ds, setDs] = useState({ dias_preparacion: '', dias_envio_estimado: '', proveedor: '', pais_origen: '', requiere_confirmacion: false, costo_importacion: '' });

  // Descuentos
  const [descuentoActivo, setDescuentoActivo] = useState(false);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState('');
  const [descuentoPrecioOriginal, setDescuentoPrecioOriginal] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estados adicionales
  const [warranty, setWarranty] = useState('');
  const [condition, setCondition] = useState('');
  const [shipping, setShipping] = useState('');
  const [tags, setTags] = useState('');

  // Feedback
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Handlers dinámicos ---
  // Añadir/remover imágenes
  const handleAddImage = () => setImages([...images, '']);
  const handleRemoveImage = idx => setImages(images.filter((_, i) => i !== idx));
  const handleImageChange = (idx, val) => setImages(images.map((img, i) => (i === idx ? val : img)));

  // Atributos
  const addAtributo = () => setAttributes([...attributes, { id: '', name: '', value_name: '' }]);
  const removeAtributo = i => setAttributes(attributes.filter((_, idx) => idx !== i));
  const changeAtributo = (i, k, v) => setAttributes(attributes.map((a, idx) => idx === i ? { ...a, [k]: v } : a));

  // Variantes
  const addVariante = () => setVariantes([...variantes, { color: '', size: '', price: '', stock: '', images: [''] }]);
  const removeVariante = i => setVariantes(variantes.filter((_, idx) => idx !== i));
  const changeVariante = (i, k, v) => setVariantes(variantes.map((variante, idx) => idx === i ? { ...variante, [k]: v } : variante));
  const addImgVariante = (i) => setVariantes(variantes.map((v, idx) => idx === i ? { ...v, images: [...v.images, ''] } : v));
  const rmImgVariante = (i, j) => setVariantes(variantes.map((v, idx) => idx === i ? { ...v, images: v.images.filter((_, idy) => idy !== j) } : v));
  const chImgVariante = (i, j, value) => setVariantes(variantes.map((v, idx) => idx === i ? { ...v, images: v.images.map((img, idy) => idy === j ? value : img) } : v));

  // --- Submit ---
  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');

    // Validaciones principales
    if (!mlId || !title || !price || !availableQuantity || !status) {
      setMensaje('Todos los campos obligatorios deben estar completos.');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setMensaje('El precio debe ser un número mayor a 0.');
      return;
    }
    if (isNaN(Number(availableQuantity)) || Number(availableQuantity) < 0) {
      setMensaje('El stock debe ser un número válido.');
      return;
    }
    if (variantes.some(v => !v.color || !v.size || !v.price || !v.stock)) {
      setMensaje('Completa todos los datos de las variantes.');
      return;
    }
    setLoading(true);

    // Construir payload
    const body = {
      ml_id: mlId,
      title,
      price: Number(price),
      available_quantity: Number(availableQuantity),
      status,
      category_id: categoryId,
      main_image: mainImage || (images[0] || ''),
      images: images.filter(Boolean).map((url, i) => ({ id: (i + 1).toString(), url, max_size: '' })),
      description,
      attributes: attributes.filter(a => a.name && a.value_name),
      variantes: variantes.map(v => ({ color: v.color, size: v.size, price: Number(v.price), stock: Number(v.stock), images: v.images.filter(Boolean).map((url, j) => ({ id: (j+1).toString(), url })) })),
      tipo_venta: tipoVenta,
      stock_fisico: tipoVenta === 'stock_fisico' ? {
        cantidad_disponible: Number(stockFisico.cantidad_disponible || 0),
        ubicacion: stockFisico.ubicacion,
        reorder_point: Number(stockFisico.reorder_point || 0)
      } : undefined,
      dropshipping: tipoVenta === 'dropshipping' ? {
        dias_preparacion: Number(ds.dias_preparacion || 0),
        dias_envio_estimado: Number(ds.dias_envio_estimado || 0),
        proveedor: ds.proveedor,
        pais_origen: ds.pais_origen,
        requiere_confirmacion: !!ds.requiere_confirmacion,
        costo_importacion: Number(ds.costo_importacion || 0),
        tiempo_configurado_en_ml: false
      } : undefined,
      warranty,
      condition,
      shipping,
      tags: tags.split(',').map(x => x.trim()).filter(Boolean),
      descuento: descuentoActivo ? {
        activo: true,
        porcentaje: Number(descuentoPorcentaje || 0),
        precio_original: Number(descuentoPrecioOriginal || 0),
        fecha_inicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fecha_fin: fechaFin ? new Date(fechaFin) : undefined
      } : undefined
    };

    try {
      // Token/jwt admin. Ajusta según tu flujo de auth.
      const token = localStorage.getItem('token');
      const res = await fetch('/ml/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.producto) {
        setMensaje('Producto creado exitosamente. Redirigiendo...');
        setTimeout(() => window.location.href = '/admin', 1500);
      } else {
        setMensaje(data?.error || 'Error al crear producto');
      }
    } catch (err) {
      setMensaje('Error de red o inesperado al crear producto.');
    }
    setLoading(false);
  };

  // --- Render ---
  return (
    <div className="admin-crear-producto" style={{maxWidth:700,margin:'0 auto',padding:'2rem'}}>
      <h1>Agregar producto (solo admin)</h1>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.8rem'}}>
        {/* Básicos */}
        <fieldset>
          <legend>Datos principales</legend>
          <label>ID interno (ml_id): <input value={mlId} onChange={e=>setMlId(e.target.value)} required maxLength={36} /></label>
          <label>Título: <input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={120} /></label>
          <label>Precio: <input value={price} onChange={e=>setPrice(e.target.value.replace(/[^\d.]/g,''))} required /></label>
          <label>Stock: <input value={availableQuantity} onChange={e=>setAvailableQuantity(e.target.value.replace(/[^\d]/g,''))} required /></label>
          <label>Estado:
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="closed">Cerrado</option>
            </select>
          </label>
          <label>Categoría (ID ML o interna): <input value={categoryId} onChange={e=>setCategoryId(e.target.value)} maxLength={32} /></label>
        </fieldset>
        {/* Imágenes */}
        <fieldset>
          <legend>Imágenes</legend>
          <label>Imagen principal: <input value={mainImage} onChange={e=>setMainImage(e.target.value)} placeholder="URL" /></label>
          <span>Imágenes adicionales:</span>
          {images.map((img, i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
              <input value={img} onChange={e=>handleImageChange(i, e.target.value)} placeholder="URL imagen" style={{width:'90%'}} />
              <button type="button" onClick={()=>handleRemoveImage(i)}>-</button>
            </div>
          ))}
          <button type="button" onClick={handleAddImage}>+ Añadir imagen</button>
        </fieldset>
        {/* Variantes */}
        <fieldset>
          <legend>Variantes</legend>
          {variantes.map((variante, vI) => (
            <div key={vI} style={{border:'1px dashed #DDD',marginBottom:8,padding:8}}>
              <strong>Variante {vI+1}</strong>
              <button type="button" style={{marginLeft:12}} onClick={()=>removeVariante(vI)}>Eliminar</button>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <input value={variante.color} onChange={e=>changeVariante(vI, 'color', e.target.value)} placeholder="Color" style={{width:90}} />
                <input value={variante.size} onChange={e=>changeVariante(vI, 'size', e.target.value)} placeholder="Talle" style={{width:90}} />
                <input value={variante.price} onChange={e=>changeVariante(vI, 'price', e.target.value.replace(/[^\d.]/g,''))} placeholder="Precio" style={{width:90}} />
                <input value={variante.stock} onChange={e=>changeVariante(vI, 'stock', e.target.value.replace(/[^\d]/g,''))} placeholder="Stock" style={{width:90}} />
              </div>
              {/* Imágenes de variante */}
              <div>
                <span>Imágenes de variante:</span>
                {variante.images && variante.images.map((img, imgI) => (
                  <div style={{display:'flex',gap:8,marginBottom:6}} key={imgI}>
                    <input value={img} onChange={e=>chImgVariante(vI,imgI,e.target.value)} placeholder="URL imagen" style={{width:'80%'}} />
                    <button type="button" onClick={()=>rmImgVariante(vI,imgI)}>-</button>
                  </div>
                ))}
                <button type="button" onClick={()=>addImgVariante(vI)}>+ Añadir imagen variante</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addVariante}>+ Añadir variante</button>
        </fieldset>
        {/* Atributos */}
        <fieldset>
          <legend>Atributos</legend>
          <div>Ejemplo: Marca: Poppy, Material: Plástico, etc.</div>
          {attributes.map((at, ai) => (
            <div key={ai} style={{display:'flex',gap:6,marginBottom:4}}>
              <input value={at.name} onChange={e=>changeAtributo(ai, 'name', e.target.value)} placeholder="Nombre atributo" style={{width:130}} />
              <input value={at.value_name} onChange={e=>changeAtributo(ai, 'value_name', e.target.value)} placeholder="Valor" style={{width:150}} />
              <button type="button" onClick={()=>removeAtributo(ai)}>-</button>
            </div>
          ))}
          <button type="button" onClick={addAtributo}>+ Añadir atributo</button>
        </fieldset>
        {/* Tipo de venta y stock/dropshipping */}
        <fieldset>
          <legend>Tipo de venta</legend>
          <div style={{display:'flex',gap:14,marginBottom:10}}>
            <label><input type="radio" checked={tipoVenta==='stock_fisico'} onChange={()=>setTipoVenta('stock_fisico')} /> Stock físico</label>
            <label><input type="radio" checked={tipoVenta==='dropshipping'} onChange={()=>setTipoVenta('dropshipping')} /> Dropshipping</label>
            <label><input type="radio" checked={tipoVenta==='mixto'} onChange={()=>setTipoVenta('mixto')} /> Mixto</label>
          </div>
          {tipoVenta === 'stock_fisico' && (
            <div style={{border:'1px solid #EEE',padding:10,marginBottom:8}}>
              <label>Cantidad stock: <input value={stockFisico.cantidad_disponible} onChange={e=>setStockFisico({...stockFisico,cantidad_disponible:e.target.value.replace(/[^\d]/g,'')})}/></label>
              <label>Ubicación: <input value={stockFisico.ubicacion} onChange={e=>setStockFisico({...stockFisico, ubicacion:e.target.value})}/></label>
              <label>Punto de reorder: <input value={stockFisico.reorder_point} onChange={e=>setStockFisico({...stockFisico, reorder_point:e.target.value.replace(/[^\d]/g,'')})}/></label>
            </div>
          )}
          {tipoVenta === 'dropshipping' && (
            <div style={{border:'1px solid #EEE',padding:10,marginBottom:8}}>
              <label>Días preparación: <input value={ds.dias_preparacion} onChange={e=>setDs({...ds, dias_preparacion:e.target.value.replace(/[^\d]/g,'')})}/></label>
              <label>Días envío estimado: <input value={ds.dias_envio_estimado} onChange={e=>setDs({...ds, dias_envio_estimado:e.target.value.replace(/[^\d]/g,'')})}/></label>
              <label>Proveedor: <input value={ds.proveedor} onChange={e=>setDs({...ds,proveedor:e.target.value})}/></label>
              <label>País origen: <input value={ds.pais_origen} onChange={e=>setDs({...ds,pais_origen:e.target.value})}/></label>
              <label>Require confirmación: <input type="checkbox" checked={!!ds.requiere_confirmacion} onChange={e=>setDs({...ds, requiere_confirmacion:e.target.checked})}/></label>
              <label>Costo de importación: <input value={ds.costo_importacion} onChange={e=>setDs({...ds,costo_importacion:e.target.value.replace(/[^\d.]/g,'')})}/></label>
            </div>
          )}
        </fieldset>
        {/* Avanzados */}
        <fieldset>
          <legend>Datos avanzados</legend>
          <label>Garantía: <input value={warranty} onChange={e=>setWarranty(e.target.value)} /></label>
          <label>Condición:
            <select value={condition} onChange={e=>setCondition(e.target.value)}>
              <option value=''>Sin especificar</option>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
              <option value="reconditioned">Reacondicionado</option>
            </select>
          </label>
          <label>Shipping info: <input value={shipping} onChange={e=>setShipping(e.target.value)} /></label>
          <label>Tags (separados por coma): <input value={tags} onChange={e=>setTags(e.target.value)} /></label>
        </fieldset>
        {/* Descuento manual */}
        <fieldset>
          <legend>Descuento manual</legend>
          <label><input type="checkbox" checked={descuentoActivo} onChange={e=>setDescuentoActivo(e.target.checked)} /> Activar descuento</label>
          {descuentoActivo && (<>
            <label>Porcentaje: <input value={descuentoPorcentaje} onChange={e=>setDescuentoPorcentaje(e.target.value.replace(/[^\d]/g,''))} /></label>
            <label>Precio original: <input value={descuentoPrecioOriginal} onChange={e=>setDescuentoPrecioOriginal(e.target.value.replace(/[^\d.]/g,''))} /></label>
            <label>Desde: <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)}/></label>
            <label>Hasta: <input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)}/></label>
          </>)}
        </fieldset>
        <button type="submit" disabled={loading} style={{fontWeight:600, padding:12,background:'#ffa500',border:0,borderRadius:8,color:'#fff',fontSize:18}}>Crear producto</button>
        {mensaje && <div style={{marginTop:10,fontWeight:600,color:mensaje.includes('exitos')?'green':'#d32f2f'}}>{mensaje}</div>}
      </form>
    </div>
  );
};

export default AdminCrearProductoPage;
