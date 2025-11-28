# 🚀 Optimización de Imágenes sin Cloudinary

## Solución Implementada

Se ha creado un endpoint propio en el backend que optimiza las imágenes de MercadoLibre sin depender de servicios externos como Cloudinary.

## ✅ Ventajas

1. **Control total**: No dependes de servicios externos
2. **Sin límites**: No hay restricciones de ancho de banda
3. **Caché propio**: Las imágenes se cachean en el servidor
4. **Formato moderno**: Conversión automática a WebP
5. **Redimensionamiento**: Ajuste automático según viewport

## 📦 Dependencias Necesarias

### Backend

Instala `sharp` en el backend:

```bash
cd tienda-virtual-ts-back
npm install sharp
npm install --save-dev @types/sharp
```

## 🔧 Configuración

### Backend

El endpoint ya está configurado en:
- **Ruta**: `/api/images/optimize`
- **Archivo**: `tienda-virtual-ts-back/routes/images.ts`
- **Registrado en**: `tienda-virtual-ts-back/app.ts`

### Frontend

El frontend ya está actualizado para usar el endpoint propio en:
- **Archivo**: `mercado-libre/src/pages/TiendaPage.tsx`
- **Función**: `getOptimizedImageUrl()`

## 🎯 Cómo Funciona

1. **Frontend**: Cuando se necesita una imagen, se llama a `getOptimizedImageUrl(url)`
2. **URL generada**: Se crea una URL como `/api/images/optimize?url=...&width=250`
3. **Backend**: 
   - Verifica si la imagen está en caché
   - Si no, descarga la imagen de MercadoLibre
   - La redimensiona con Sharp
   - La convierte a WebP
   - La guarda en caché (memoria y disco)
   - La devuelve al frontend
4. **Frontend**: Muestra la imagen optimizada

## 📊 Beneficios

### Antes (sin optimización)
- **Formato**: JPG
- **Tamaño**: ~66.8 KiB
- **Dimensiones**: 500x477px (más grande de lo necesario)

### Después (con optimización)
- **Formato**: WebP
- **Tamaño**: ~15-25 KiB (reducción del 60-75%)
- **Dimensiones**: Ajustadas según viewport (200-350px)

## 🧪 Probar el Endpoint

### Opción 1: Desde el navegador

```
https://poppy-shop-production.up.railway.app/api/images/optimize?url=https://http2.mlstatic.com/D_744498-MLU78998991920_092024-O.jpg&width=250
```

### Opción 2: Desde curl

```bash
curl "https://poppy-shop-production.up.railway.app/api/images/optimize?url=https://http2.mlstatic.com/D_744498-MLU78998991920_092024-O.jpg&width=250" -o test-image.webp
```

### Opción 3: Ver información de la imagen

```
https://poppy-shop-production.up.railway.app/api/images/info?url=https://http2.mlstatic.com/D_744498-MLU78998991920_092024-O.jpg
```

## 💾 Caché

El sistema implementa dos niveles de caché:

1. **Caché en memoria**: Para acceso rápido
2. **Caché en disco**: Para persistencia entre reinicios

**Ubicación del caché**: `tienda-virtual-ts-back/cache/images/`

**TTL del caché**: 24 horas

## 🔄 Fallback

Si el endpoint falla por cualquier razón, el código actualmente:
- Intentará cargar la imagen optimizada
- Si falla, el navegador mostrará un error

**Mejora futura**: Se puede agregar un fallback que detecte el error y use la URL original de MercadoLibre.

## 📝 Notas Importantes

1. **Primera carga**: La primera vez que se solicita una imagen, puede tardar un poco más (descarga + procesamiento)
2. **Caché**: Las siguientes solicitudes serán instantáneas
3. **Espacio en disco**: El caché puede crecer, considera implementar limpieza periódica
4. **Memoria**: El caché en memoria se limpia automáticamente cada hora

## 🚀 Próximos Pasos

1. **Instalar dependencias**:
   ```bash
   cd tienda-virtual-ts-back
   npm install
   ```

2. **Reiniciar el servidor backend**

3. **Probar en el frontend**: Las imágenes deberían cargarse automáticamente optimizadas

4. **Verificar en Lighthouse**: Deberías ver mejoras en:
   - Formato de imagen moderno ✅
   - Tamaño de imagen vs visualización ✅
   - LCP mejorado ✅

## 🆘 Troubleshooting

### Error: "sharp is not installed"
```bash
cd tienda-virtual-ts-back
npm install sharp
```

### Error: "Cannot find module 'sharp'"
Asegúrate de haber instalado sharp y reiniciado el servidor.

### Las imágenes no se optimizan
1. Verifica que el endpoint esté funcionando: `/api/images/info?url=...`
2. Revisa los logs del backend
3. Verifica que la URL de MercadoLibre sea válida

### Caché ocupando mucho espacio
El caché se limpia automáticamente después de 24 horas. Si necesitas limpiarlo manualmente:
```bash
rm -rf tienda-virtual-ts-back/cache/images/*
```

