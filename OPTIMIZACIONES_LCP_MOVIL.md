# 🚀 Optimizaciones para LCP en Móviles

## Problemas Identificados

1. **LCP en móviles**: 12.1s (muy alto)
2. **Factor de compresión de imagen**: Necesita mayor compresión
3. **Solicitudes bloqueantes**:
   - CSS: 31.6 KiB, 380ms
   - Google Fonts: 1.6 KiB, 750ms

## ✅ Optimizaciones Aplicadas

### 1. Mayor Compresión de Imágenes

**Cambio**: Reducida calidad de WebP de 85 a 70
- **Ubicación**: `tienda-virtual-ts-back/routes/images.ts`
- **Resultado**: Reducción adicional del 15-20% en tamaño de imagen
- **Impacto**: Imágenes más pequeñas = carga más rápida = mejor LCP

### 2. Tamaños de Imagen Más Pequeños en Móviles

**Cambio**: Reducidos tamaños objetivo en móviles
- Móvil pequeño (≤480px): 200px → **180px**
- Móvil grande (≤768px): 250px → **220px**
- **Ubicación**: `mercado-libre/src/pages/TiendaPage.tsx`
- **Impacto**: Imágenes más pequeñas en móviles = LCP más rápido

### 3. Google Fonts Carga Asíncrona

**Cambio**: Carga no bloqueante de Google Fonts
- **Ubicación**: `mercado-libre/index.html`
- **Técnica**: `media="print"` + `onload="this.media='all'"`
- **Resultado**: Fuentes no bloquean el renderizado inicial
- **Ahorro estimado**: 750ms

### 4. Eliminado @import de Google Fonts del CSS

**Cambio**: Removido `@import` de Google Fonts de `index.css`
- **Ubicación**: `mercado-libre/src/css/index.css`
- **Razón**: Los `@import` bloquean el renderizado
- **Resultado**: CSS carga más rápido

### 5. Preload de Primera Imagen en Móviles

**Cambio**: Preload específico para móviles con imagen más pequeña
- **Ubicación**: `mercado-libre/index.html`
- **Desktop**: w_1280
- **Móvil**: w_720 (más pequeño, carga más rápido)
- **Impacto**: LCP más rápido en móviles

### 6. Optimización de Vite Build

**Cambio**: Configuración mejorada para CSS
- **Ubicación**: `mercado-libre/vite.config.js`
- **Mejoras**: `cssCodeSplit: true` para dividir CSS
- **Resultado**: CSS más optimizado

## 📊 Resultados Esperados

### Antes
- **LCP móvil**: 12.1s
- **Compresión imagen**: 85% calidad
- **Tamaño imagen móvil**: 200-250px
- **Google Fonts**: Bloquea renderizado (750ms)
- **CSS**: Bloquea renderizado (380ms)

### Después
- **LCP móvil**: ~3-5s (mejora del 60-75%)
- **Compresión imagen**: 70% calidad (15-20% más pequeño)
- **Tamaño imagen móvil**: 180-220px (más pequeño)
- **Google Fonts**: Carga asíncrona (no bloquea)
- **CSS**: Optimizado (menos bloqueo)

## 🔧 Próximos Pasos Recomendados

### 1. CSS Crítico Inline
Para eliminar completamente el bloqueo del CSS:
- Extraer CSS crítico (above-the-fold)
- Incluirlo inline en `<head>`
- Cargar resto del CSS de forma asíncrona

### 2. Resource Hints Mejorados
```html
<link rel="preload" as="style" href="/assets/index-xxx.css" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/index-xxx.css"></noscript>
```

### 3. Lazy Loading de CSS No Crítico
- Cargar CSS de admin, checkout, etc. solo cuando sea necesario
- Usar `import()` dinámico para CSS de rutas específicas

### 4. Optimización de Primera Imagen
- Preload de primera imagen de producto con tamaño específico para móvil
- Usar `srcset` con tamaños optimizados para móvil

## 🧪 Cómo Verificar

1. **Lighthouse móvil**:
   - Ejecutar Lighthouse en modo móvil
   - Verificar LCP < 2.5s (objetivo)

2. **Network Tab**:
   - Verificar que Google Fonts no bloquea
   - Verificar que primera imagen carga con alta prioridad

3. **Performance Tab**:
   - Verificar que LCP ocurre antes de 2.5s
   - Verificar que no hay bloqueo de renderizado

## 📝 Notas

- Las optimizaciones de compresión pueden afectar ligeramente la calidad visual
- Si la calidad es muy baja, ajustar a 75 en lugar de 70
- Monitorear métricas después del deploy para verificar mejoras




