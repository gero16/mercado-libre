# 🔧 Solución Rápida: Limpiar Caché de Productos

## Si no cargan los productos:

### Opción 1: Desde la Consola del Navegador (Más Rápido)

1. Abre la consola del navegador (F12 o Click Derecho → Inspeccionar → Console)
2. Pega este código y presiona Enter:

```javascript
localStorage.removeItem('ml_productos_cache');
localStorage.removeItem('ml_productos_cache_time');
location.reload();
```

### Opción 2: Desde las Herramientas de Desarrollo

1. F12 para abrir DevTools
2. Ve a la pestaña "Application" (o "Aplicación")
3. En el menú lateral, ve a "Local Storage"
4. Selecciona tu dominio (localhost:5173)
5. Elimina las claves:
   - `ml_productos_cache`
   - `ml_productos_cache_time`
6. Recarga la página (F5)

### Opción 3: Borrar todo el localStorage

```javascript
localStorage.clear();
location.reload();
```

---

## Verificar qué está pasando:

En la consola del navegador deberías ver estos mensajes:

### ✅ Funcionando correctamente:
```
📡 Fetching productos desde API...
📡 Productos recibidos de API: 150
💾 Productos guardados en caché: 150
🔍 Total productos recibidos para procesar: 150
```

### ❌ Si hay problemas:
```
❌ Error fetching ML products: [error]
❌ La respuesta no es un array: object
❌ Caché corrupto, eliminando...
```

---

## Si el problema persiste:

Significa que el API no está respondiendo correctamente. Verifica:

1. **¿El servidor backend está funcionando?**
   - URL: https://poppy-shop-production.up.railway.app/ml/productos
   - Prueba abrirlo en el navegador directamente

2. **¿Hay errores de CORS?**
   - Revisa la consola para errores de CORS

3. **¿Timeout del API?**
   - El servidor puede estar lento, espera 10-15 segundos

---

**Autor:** AI Assistant  
**Fecha:** Octubre 2025

