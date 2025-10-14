# 🔍 Diagnóstico del Checkout

## 🚨 Problema Actual

No puedes completar pagos, incluso con tu tarjeta real. 

---

## 📋 Pasos para Diagnosticar

### 1. Verificar Logs de Railway

Cuando intentas hacer un pago, **copia TODOS los logs** que aparecen en Railway después de:

```
🛒 Iniciando proceso de Checkout Pro...
```

Especialmente busca:
- ✅ `✅ Preferencia creada exitosamente`
- ❌ `❌ Error creando preferencia: ...`
- 💱 `💱 Moneda REAL en respuesta de MP: ...`

---

### 2. Verificar Error en el Navegador

Abre la consola del navegador (F12) y busca:

```
Error creating Checkout Pro preference: ...
```

---

### 3. ¿A Qué Página te Redirige?

Cuando haces click en "Pagar":

**A) ¿Te redirige a MercadoPago?**
- ✅ La preferencia se creó
- El problema está en MercadoPago rechazando el pago

**B) ¿NO te redirige (te quedas en tu página)?**
- ❌ La preferencia NO se creó
- El problema está en tu backend

---

## 🧪 Test Manual de Verificación de USD

### Intenta Crear Preferencia Manualmente

```bash
# En tu terminal:
curl -X POST https://poppy-shop-production.up.railway.app/api/checkout-pro/create-preference-checkout-pro \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [{
      "id": "MLU644321979",
      "name": "Producto de Prueba",
      "cantidad": 1,
      "price": 10
    }],
    "customerData": {
      "name": "Test User",
      "email": "test@test.com",
      "phone": "099123456",
      "address": "Test Address"
    }
  }'
```

**¿Qué devuelve?**

**Si ves:**
```json
{
  "preferenceId": "...",
  "init_point": "https://...",
  "currency": "USD",
  "currency_real": "UYU"  👈 ¡AQUÍ ESTÁ LA CLAVE!
}
```

Si `currency_real` es **"UYU"**, tu cuenta **NO soporta USD**.

---

## 💡 Solución Rápida: Cambiar a UYU

Mientras verificamos todo, déjame darte una **solución que funcionará inmediatamente**:

Voy a cambiar **TODO** a UYU (pesos uruguayos) para que puedas probar YA:

