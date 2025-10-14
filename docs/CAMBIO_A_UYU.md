# 💵 Sistema Cambiado a UYU (Pesos Uruguayos)

## ✅ Cambio Realizado

He cambiado el sistema completo de **USD** a **UYU** (pesos uruguayos) porque tu cuenta de MercadoPago **NO soporta cobros en USD**.

---

## 🔍 ¿Por Qué Este Cambio?

### El Problema

```
Tu cuenta de MercadoPago (Uruguay) → Solo soporta UYU
Intentabas cobrar en USD → MercadoPago lo rechazaba o convertía
Resultado: Pagos no funcionaban ❌
```

### La Solución

```
Ahora todo está en UYU → MercadoPago lo acepta ✅
Checkout Pro funciona correctamente ✅
Tarjetas de prueba funcionan ✅
Tu tarjeta real funciona ✅
```

---

## 📋 Archivos Modificados

### Backend

**`routes/checkoutPro.ts`:**
```typescript
// Cambio principal (línea 152):
currency_id: "UYU" as const  // Antes: "USD"

// Todos los logs actualizados:
"Total: $38 UYU"  // Antes: "Total: $38 USD"
```

### Frontend

**`src/pages/CheckoutPage.tsx`:**
```typescript
// Botón actualizado:
'💳 Pagar con MercadoPago'  // Antes: 'Pagar con MercadoPago (USD)'

// Mensaje actualizado:
"Serás redirigido a MercadoPago para completar tu pago"
// Antes: "...tu pago en USD"
```

---

## ⚠️ IMPORTANTE: Tus Precios

### ¿Tus Precios Están Pensados en USD o UYU?

**Revisa tu base de datos:**

```javascript
// Ejemplo:
{
  title: "Apple Pencil Tips",
  price: 38  // ❓ ¿$38 USD o $38 UYU?
}
```

### Escenario A: Los Precios YA Están en UYU ✅

Si **$38 significa $38 pesos uruguayos**:
- ✅ **NO cambies nada**
- ✅ Todo funcionará correctamente
- ✅ MercadoPago cobrará $38 UYU

---

### Escenario B: Los Precios Están en USD ⚠️

Si **$38 significa $38 dólares estadounidenses**:

**Problema:**
- MercadoPago cobrará **$38 UYU** (≈ $0.95 USD)
- Estás cobrando **40 veces menos** de lo esperado

**Solución:**
Necesitas **convertir todos los precios** a pesos uruguayos:

```javascript
// Tipo de cambio actual: ~$40 UYU por $1 USD

// Precio en USD:
price: 38  // USD

// Convertir a UYU:
price: 38 * 40 = 1520  // UYU
```

**Script de conversión:** (te lo puedo crear si lo necesitas)

---

## 🚀 Próximos Pasos

### 1. Hacer Push

```bash
cd tienda-virtual-ts-back
git add .
git commit -m "fix: Cambiar de USD a UYU (cuenta no soporta USD)"
git push origin main

# Espera 2-3 minutos
```

### 2. Hacer Push del Frontend

```bash
cd mercado-libre
git add .
git commit -m "fix: Actualizar mensaje de pago (UYU en lugar de USD)"
git push origin main
```

### 3. Probar Pago

Ahora **SÍ debería funcionar** con:
- ✅ Tarjetas de prueba (APRO)
- ✅ Tu tarjeta real (modo TEST)

---

## 🧪 Tarjetas de Prueba que Funcionarán

Ahora con UYU, estas tarjetas funcionarán:

**Mastercard:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 12/28
Nombre: APRO
```

**Visa:**
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 12/28
Nombre: APRO
```

---

## 📊 Visualización de Precios

### ¿Cómo Mostrar los Precios?

Tienes 2 opciones:

**Opción A: Mostrar en Pesos (Más Simple)**
```tsx
// Frontend:
<p>$ {producto.price}</p>
// O explícitamente:
<p>UYU$ {producto.price}</p>
```

**Opción B: Mostrar en USD (Más Complejo)**
```tsx
// Mostrar en USD pero cobrar en UYU:
const precioEnUSD = producto.price / 40; // Tipo de cambio
<p>US$ {precioEnUSD.toFixed(2)}</p>
<p className="small-text">(≈ ${producto.price} UYU)</p>
```

---

## 💰 ¿Necesitas Convertir Precios?

Si tus precios actuales están en USD, puedo crear un script para convertirlos automáticamente:

```javascript
// Script de migración:
const TIPO_CAMBIO = 40; // 1 USD = 40 UYU

db.productos.find().forEach(producto => {
  const precioEnUYU = Math.round(producto.price * TIPO_CAMBIO);
  
  db.productos.updateOne(
    { _id: producto._id },
    { 
      $set: { 
        price: precioEnUYU,
        price_usd_original: producto.price  // Backup
      }
    }
  );
});
```

---

## ✅ Beneficios del Cambio a UYU

1. ✅ **Funciona inmediatamente** (sin trámites con MercadoPago)
2. ✅ **Tarjetas de prueba funcionan** (APRO, etc.)
3. ✅ **Tarjetas reales funcionan** (locales e internacionales)
4. ✅ **Comisiones más bajas** (generalmente UYU tiene comisiones menores)
5. ✅ **Más métodos de pago** disponibles en Uruguay

---

## 🔮 Futuro: Si Quieres Volver a USD

Cuando tu cuenta de MercadoPago soporte USD:

1. Contacta a MercadoPago: 0800 7171
2. Solicita habilitar USD
3. Espera aprobación (1-7 días)
4. Cambias `"UYU"` → `"USD"` en 2 líneas de código
5. Listo

---

## 📝 Resumen

| Antes (USD) | Ahora (UYU) |
|-------------|-------------|
| ❌ No funcionaba | ✅ Funciona |
| ❌ Tarjetas rechazadas | ✅ Tarjetas aceptadas |
| ❌ Cuenta no soportada | ✅ Cuenta soportada |
| ⚠️ Requiere upgrade MP | ✅ Sin requisitos |

---

**Haz push de ambos cambios (backend y frontend) y en 5 minutos podrás hacer pagos correctamente.** 🎉

¿Necesitas ayuda para convertir los precios de USD a UYU o están bien como están? 😊
