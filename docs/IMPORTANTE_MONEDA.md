# 🚨 IMPORTANTE: Moneda en MercadoPago

## ✅ Problema Resuelto: `currency_id` Error

**Error anterior:**
```
The name of the following parameters is wrong: currency_id
```

**Causa:** 
Estábamos enviando `currency_id: "USD"` en el pago con token de tarjeta, pero la API de pagos de MercadoPago **NO acepta** este campo.

**Solución:** 
Eliminé el campo `currency_id` del objeto de pago. La moneda se determina **automáticamente** por tu cuenta de MercadoPago.

---

## 🔍 Cómo Funciona la Moneda en MercadoPago

### Pagos con Token de Tarjeta (Payment Brick)

Cuando usas el Payment Brick (pago directo con tarjeta), la moneda se determina por:

1. **Tu cuenta de MercadoPago** (país de registro)
2. **No se puede especificar** en el pago

**En Uruguay:**
- Todos los pagos con token se procesan en **UYU (Pesos Uruguayos)**
- No puedes cobrar en USD usando Payment Brick
- MercadoPago convierte automáticamente si tu cuenta bancaria es en USD

---

## ⚠️ Situación Actual de tu Tienda

### Lo que Tienes Ahora

```javascript
// Productos en tu BD:
{
  title: "Apple Pencil Tips",
  price: 38,  // ❓ ¿$38 USD o $38 UYU?
}

// MercadoPago cobrará:
$38 UYU (Pesos uruguayos)
```

### El Problema

Si tus precios están pensados en **USD** pero MercadoPago cobra en **UYU**:

- **Esperado:** Cobrar $38 USD (≈ $1,500 UYU)
- **Real:** Se cobra $38 UYU (≈ $0.95 USD) ❌

**Estás cobrando 40 veces menos de lo esperado.**

---

## 🔧 Soluciones

### Opción 1: Mantener Precios en USD (Recomendado si vendes internacional)

**Paso 1:** Actualizar todos los precios a pesos uruguayos

```javascript
// Antes:
price: 38  // USD

// Después (tipo de cambio ~40 UYU/USD):
price: 1520  // UYU
```

**Paso 2:** Actualizar la visualización en el frontend

```tsx
// En el frontend, mostrar como USD:
const precioEnUSD = precioEnUYU / tipoDeCambio;
<p>US$ {precioEnUSD.toFixed(2)}</p>
```

**Ventajas:**
- ✅ Precios correctos en MercadoPago
- ✅ Puedes mostrar precios en USD en el frontend
- ✅ Compatible con pagos en Uruguay

**Desventajas:**
- ⚠️ Necesitas actualizar todos los precios en la BD
- ⚠️ Necesitas manejar el tipo de cambio

---

### Opción 2: Precios en Pesos Uruguayos (Más Simple)

**Paso 1:** Asumir que todos tus precios ya están en UYU

```javascript
// Si $38 es realmente $38 UYU (no USD):
price: 38  // Ya está correcto
```

**Paso 2:** Cambiar la visualización en el frontend

```tsx
// En lugar de "US$ 38":
<p>$ {producto.price}</p>  // $38 (pesos uruguayos)
// O explícitamente:
<p>UYU$ {producto.price}</p>
```

**Ventajas:**
- ✅ No requiere cambios en la BD
- ✅ Más simple de mantener
- ✅ Correcto para el mercado uruguayo

**Desventajas:**
- ⚠️ No puedes mostrar precios en USD
- ⚠️ Solo para mercado uruguayo

---

### Opción 3: Dual Currency (Avanzado)

Guardar ambas monedas en la BD:

```javascript
{
  title: "Apple Pencil Tips",
  price_usd: 38,
  price_uyu: 1520,
  currency: "USD",  // Para mostrar en frontend
  mp_currency: "UYU"  // Para cobrar en MercadoPago
}
```

**Ventajas:**
- ✅ Flexibilidad total
- ✅ Preparado para expansión internacional

**Desventajas:**
- ⚠️ Más complejo de implementar
- ⚠️ Necesitas actualizar el tipo de cambio periódicamente

---

## 📊 ¿Cuál es tu Caso?

### Escenario A: "Mis precios YA están en UYU"

Si $38 es realmente **$38 pesos uruguayos**, entonces:

✅ **No necesitas hacer nada**, los pagos ya funcionarán correctamente.

Solo cambia la visualización en el frontend:
```tsx
// Cambiar "US$" a "$" o "UYU$"
<p>$ {producto.price}</p>
```

---

### Escenario B: "Mis precios están en USD"

Si $38 significa **$38 dólares estadounidenses**, entonces:

⚠️ **Necesitas actualizar los precios** a pesos uruguayos:

**Script de migración:**

```javascript
// Tipo de cambio actual (ajustar según la fecha)
const TIPO_CAMBIO = 40; // 1 USD = 40 UYU (aproximado)

// Actualizar todos los productos:
db.productos.find().forEach(producto => {
  db.productos.updateOne(
    { _id: producto._id },
    { 
      $set: { 
        price: producto.price * TIPO_CAMBIO,
        currency: 'UYU',
        price_original_usd: producto.price  // Backup
      }
    }
  );
});
```

---

## 🧮 Calculadora de Conversión

Tipo de cambio aproximado (Uruguay, 2025):

| USD | UYU |
|-----|-----|
| $1 | $40 |
| $10 | $400 |
| $38 | $1,520 |
| $100 | $4,000 |

**Nota:** El tipo de cambio varía. Verifica el tipo actual en:
- https://www.bcu.gub.uy/ (Banco Central del Uruguay)
- Google: "USD to UYU"

---

## 🚀 Recomendación

### Para Mercado Local (Uruguay):

**Opción 2 (Precios en UYU)** es la más simple:

1. Mantén tus precios actuales en la BD
2. Cambia la visualización en el frontend de "US$" a "$"
3. Los pagos funcionarán correctamente

### Para Mercado Internacional:

**Opción 3 (Dual Currency)** es la mejor:

1. Agrega campo `price_uyu` a tus productos
2. Calcula `price_uyu = price_usd * tipo_cambio`
3. Muestra USD en el frontend
4. Envía UYU a MercadoPago

---

## 📝 Resumen del Cambio Actual

### Lo que Se Corrigió

```typescript
// ❌ ANTES (INCORRECTO):
const paymentData = {
  transaction_amount: 38,
  currency_id: "USD",  // ← Este campo causaba el error
  // ...
};

// ✅ DESPUÉS (CORRECTO):
const paymentData = {
  transaction_amount: 38,  // Se cobra en UYU (moneda de tu cuenta)
  // No se incluye currency_id
  // ...
};
```

### Ahora los Pagos Funcionarán

Pero **verifica tus precios**:
- ¿$38 es USD o UYU?
- Si es USD, multiplica por 40 para tener el precio correcto
- Si ya es UYU, ¡está perfecto!

---

## ✅ Checklist

Para confirmar que todo está bien:

- [ ] Backend reiniciado con los cambios
- [ ] Prueba de pago exitosa
- [ ] Verificar en MercadoPago el monto cobrado
- [ ] Decidir si precios son USD o UYU
- [ ] Si es USD, planificar migración de precios
- [ ] Actualizar visualización en frontend (US$ vs $)

---

## 🤔 ¿Necesitas Ayuda para Actualizar Precios?

Si tus precios están en USD y necesitas convertirlos a UYU, puedo ayudarte a:

1. Crear un script de migración
2. Actualizar el frontend para mostrar USD
3. Configurar el tipo de cambio dinámico
4. Implementar dual currency

Solo dime qué opción prefieres. 😊

---

**Con este cambio, los pagos ya deberían funcionar correctamente.** 🎉

Reinicia el backend y prueba de nuevo.

