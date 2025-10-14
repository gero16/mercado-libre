# 🔧 Reparar Descuentos - Guía de Uso

## 🐛 Problema que se Soluciona

Si tus productos con descuento muestran el **mismo precio** antes y después del descuento (por ejemplo: ~~$100~~ → **$100**), este tool arregla ese problema automáticamente.

### ¿Por qué pasa esto?

Cuando Mercado Libre sincroniza productos (cambios de stock, actualizaciones), puede sobrescribir el precio sin considerar los descuentos locales, causando que:
- `precio_original` = `precio_actual` (ambos $100)
- En lugar de: `precio_original` = $100, `precio_actual` = $90 (con 10% descuento)

---

## ✅ Solución Implementada

He creado dos sistemas para solucionar esto:

### 1. **Prevención Automática** (Ya activo)
- El backend ahora preserva automáticamente los descuentos cuando ML sincroniza productos
- Los nuevos descuentos funcionarán correctamente

### 2. **Reparación de Descuentos Existentes** (Requiere acción manual)
- Un botón en el Admin para reparar productos que ya tienen el problema
- Recalcula automáticamente los precios correctos basándose en el porcentaje de descuento

---

## 📋 Cómo Usar la Herramienta de Reparación

### Paso 1: Acceder al Panel de Admin
1. Inicia sesión en tu sitio
2. Ve a la página: **Admin → Descuentos**
3. URL directa: `https://tu-sitio.vercel.app/admin-descuentos`

### Paso 2: Reparar los Descuentos
1. En la sección "🔥 Productos con Descuento Activo"
2. Verás un botón naranja: **🔧 Reparar Descuentos**
3. Haz clic en el botón
4. Confirma la acción en el diálogo que aparece

### Paso 3: Verificar los Resultados
El sistema te mostrará:
- ✅ Cuántos productos fueron reparados
- ✅ Cuántos ya estaban correctos
- ✅ Total de productos procesados

---

## 🔍 Cómo Funciona la Reparación

La herramienta:

1. **Detecta productos con problema**: Encuentra productos donde `precio_original` = `precio_actual`

2. **Recalcula el precio original correcto**:
   ```
   Si un producto cuesta $90 con 10% descuento
   → Precio original debe ser: $90 / (1 - 0.10) = $100
   ```

3. **Actualiza automáticamente**:
   - `precio_original`: $100
   - `precio_actual` (con descuento): $90

4. **Muestra correctamente**:
   - En la tienda: ~~$100~~ → **$90**
   - Badge de descuento: -10%

---

## 📊 Ejemplo de Reparación

### Antes (Problema):
```
Producto: Zapatillas Nike
- Precio Original: $50
- Precio Con Descuento: $50  ❌ (Mismo precio!)
- Porcentaje: 20%
```

### Después (Reparado):
```
Producto: Zapatillas Nike
- Precio Original: $62.50
- Precio Con Descuento: $50  ✅ (Ahorro de $12.50)
- Porcentaje: 20%
```

---

## ⚠️ Consideraciones Importantes

1. **Seguridad**: 
   - La herramienta solo afecta productos que tienen el problema
   - Los productos con descuentos correctos NO se modifican

2. **Reversibilidad**: 
   - Si no estás satisfecho, puedes quitar el descuento y reaplicarlo manualmente
   - O puedes actualizar el porcentaje desde el admin

3. **Cuándo Usar**: 
   - Úsalo UNA VEZ después de instalar la actualización
   - Después, los descuentos se mantendrán correctamente automáticamente

4. **Productos que se Reparan**:
   - Solo productos con descuento activo
   - Solo productos donde precio_original = precio_actual

---

## 🚀 Mejoras Futuras Automáticas

A partir de ahora, el sistema:
- ✅ Preserva descuentos automáticamente cuando ML sincroniza
- ✅ Actualiza el precio_original si el precio en ML cambia
- ✅ Recalcula el precio con descuento automáticamente
- ✅ Mantiene la consistencia entre ML y tu base de datos local

---

## 🆘 Solución de Problemas

### El botón no aparece
- Verifica que tengas productos con descuento activo
- Refresca la página

### Los precios siguen iguales después de reparar
1. Limpia la caché del navegador (Ctrl + Shift + R)
2. Verifica que el descuento esté activo en el admin
3. Revisa los logs del backend para más detalles

### Algunos productos no se repararon
- Verifica que esos productos tengan un porcentaje de descuento válido (1-100%)
- Revisa los resultados detallados en la respuesta del servidor

---

## 📞 Soporte

Si tienes problemas o dudas:
1. Revisa los logs del backend en Railway
2. Verifica los datos en la base de datos MongoDB
3. Contacta al desarrollador con los detalles del problema

---

## ✅ Checklist de Verificación Post-Reparación

- [ ] Visitar la tienda y ver productos con descuento
- [ ] Verificar que muestren precio original tachado diferente al precio actual
- [ ] Verificar que el badge de descuento (-X%) sea correcto
- [ ] Probar agregar un producto con descuento al carrito
- [ ] Verificar que el precio en el carrito sea el correcto (con descuento)

---

**Fecha de Implementación**: Octubre 2025  
**Versión**: 1.0  
**Estado**: ✅ Producción

