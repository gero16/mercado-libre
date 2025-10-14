# 🔧 Troubleshooting: Errores de MercadoPago

## 🔍 Diagnóstico

Con los logs mejorados, ahora verás el error específico de MercadoPago. Este documento te ayudará a resolver los problemas más comunes.

---

## ❌ Errores Comunes y Soluciones

### 1. Error: "currency_id not allowed" o "Invalid currency"

**Causa:** Tu cuenta de MercadoPago no soporta USD o estás en un país que no permite USD.

**Solución A: Verificar si tu cuenta soporta USD**

1. Entra a tu panel de MercadoPago
2. Ve a "Configuración" > "Monedas"
3. Verifica si USD está habilitado

**Solución B: Usar UYU en lugar de USD**

Si tu cuenta no soporta USD, cambia la moneda:

```typescript
// En routes/api.ts, línea 833:
currency_id: "UYU", // Cambiar de USD a UYU (Pesos uruguayos)
```

También en el frontend:
```typescript
// En mercado-libre/src/services/mercadopago.ts, línea 98:
currency_id: 'UYU', // Cambiar de USD a UYU
```

**Nota:** Si cambias a UYU, tus precios deben estar en pesos uruguayos, no en dólares.

---

### 2. Error: "invalid_card_data" o "card_token_error"

**Causa:** El token de la tarjeta es inválido o expiró.

**Solución:**

1. Asegúrate de que el Payment Brick está generando el token correctamente
2. Verifica que el token se envía en el campo `token`
3. El token expira rápido, asegúrate de procesarlo inmediatamente

**Debugging:**

```typescript
// En el frontend, antes de enviar el pago:
console.log('Token generado:', formData.token);
```

---

### 3. Error: "invalid payer.identification"

**Causa:** El tipo o número de identificación no es válido para Uruguay.

**Solución:**

Uruguay usa **CI (Cédula de Identidad)**, no DNI. Cambia:

```typescript
// En routes/api.ts, línea 836-839:
payer: {
  email: payer?.email || "test@example.com",
  identification: payer?.identification || {
    type: "CI",  // Cambiar de "DNI" a "CI"
    number: "12345678"
  }
}
```

**Mejor solución: Obtener datos reales del payer**

```typescript
payer: {
  email: payer?.email || customer?.email || "test@example.com",
  identification: payer?.identification ? {
    type: payer.identification.type,
    number: payer.identification.number
  } : undefined  // Si no hay identificación, no enviar
}
```

---

### 4. Error: "payment_method_not_found"

**Causa:** El método de pago no es válido para la moneda o país.

**Solución:**

Verifica que el método de pago (ej: "master", "visa") sea compatible con:
- La moneda (USD/UYU)
- Tu país (Uruguay)
- Tu cuenta de MercadoPago

**Debugging:**

```bash
# Ver métodos de pago disponibles:
curl -X GET \
  "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

### 5. Error: "amount not valid" o "Invalid amount"

**Causa:** El monto es inválido (negativo, cero, o con formato incorrecto).

**Solución:**

```typescript
// Asegúrate de que el monto es válido:
transaction_amount: Number(transaction_amount),  // Convertir a número
// Y que sea mayor a 0
if (transaction_amount <= 0) {
  throw new Error("El monto debe ser mayor a 0");
}
```

---

### 6. Error: "Access token not found" o "Invalid access token"

**Causa:** Tu Access Token de MercadoPago es inválido o no está configurado.

**Solución:**

1. Verifica tu archivo `.env`:
```bash
cat .env | grep MP_ACCESS_TOKEN
```

2. Asegúrate de usar el token correcto:
   - **TEST:** Para pruebas (empieza con `TEST-`)
   - **PROD:** Para producción (empieza con `APP-`)

3. Obtén tu token en: https://www.mercadopago.com.uy/developers/panel/credentials

4. Verifica que el token tiene permisos de **write**

---

### 7. Error: "Installments not allowed" o "Invalid installments"

**Causa:** El número de cuotas no es válido para el método de pago.

**Solución:**

```typescript
// Asegúrate de que installments sea un número válido:
installments: Number(installments) || 1,

// Para pagos sin cuotas, usa 1:
installments: 1,
```

---

### 8. Error 401: "Unauthorized"

**Causa:** Tu Access Token es incorrecto o no tiene permisos.

**Solución:**

1. Regenera tu Access Token en el panel de MercadoPago
2. Actualiza tu `.env`
3. Reinicia el servidor backend

```bash
# Reiniciar backend:
cd tienda-virtual-ts-back
npm run start
```

---

### 9. Error 500: "Internal Server Error"

**Causa:** Error en los servidores de MercadoPago.

**Solución:**

1. Verifica el status de MercadoPago: https://status.mercadopago.com/
2. Espera unos minutos y vuelve a intentar
3. Si persiste, contacta al soporte de MercadoPago

---

## 🧪 Testing con Tarjetas de Prueba

Para probar pagos en **modo TEST**, usa estas tarjetas:

### Tarjetas Aprobadas

**Mastercard:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: `APRO` (importante para aprobación)

**Visa:**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: `APRO`

### Tarjetas Rechazadas (para testing)

**Fondos insuficientes:**
- Número: `5031 7557 3453 0604`
- Nombre: `OTHE` (other error)

**Tarjeta inválida:**
- Número: `5031 7557 3453 0604`
- Nombre: `ERRO` (error)

---

## 🔍 Debugging Paso a Paso

### 1. Verificar Configuración

```bash
# Backend:
cd tienda-virtual-ts-back
cat .env | grep MP_ACCESS_TOKEN
cat .env | grep MONGODB_CNN

# ¿Está el servidor corriendo?
curl http://localhost:3000/
```

### 2. Ver Logs Completos

Con el logging mejorado, ahora verás:

```
📤 Datos del pago a enviar:
   Monto: 38
   Moneda: USD
   Token: card_token_xyz...
   Método de pago: master
   Email: test@test.com

❌ Error procesando pago:
❌ Error completo de MercadoPago:
{
  "message": "Invalid currency",
  "error": "bad_request",
  "status": 400,
  "cause": [...]
}
```

### 3. Verificar Moneda Soportada

```bash
# Consultar monedas disponibles:
curl -X GET \
  "https://api.mercadopago.com/sites/MLU/payment_methods" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 🛠️ Solución Rápida: Cambiar de USD a UYU

Si el error es de moneda, la solución más rápida:

### Backend (3 lugares):

```bash
# Buscar todas las ocurrencias de USD:
cd tienda-virtual-ts-back
grep -n "USD" routes/api.ts

# Cambiar las 4 ocurrencias de "USD" a "UYU"
```

**Líneas a cambiar en `routes/api.ts`:**
- Línea 288: `currency_id: "UYU" as const,`
- Línea 360: `currency_id: "UYU" as const,`
- Línea 424: `currency_id: "UYU" as const,`
- Línea 833: `currency_id: "UYU",`
- Línea 735: `' USD'` → `' UYU'` (en logs)

### Frontend:

```bash
# En mercado-libre/src/services/mercadopago.ts, línea 98:
currency_id: 'UYU',
```

### ⚠️ Importante

Si cambias a UYU:
- Tus **precios deben estar en pesos uruguayos**
- Ejemplo: $38 UYU, no $38 USD
- Tipo de cambio actual: ~$40 UYU = $1 USD

---

## 📞 Soporte de MercadoPago

Si ninguna solución funciona:

1. **Documentación oficial:** https://www.mercadopago.com.uy/developers/es/docs
2. **Soporte:** soporte@mercadopago.com
3. **Status del servicio:** https://status.mercadopago.com/
4. **Foro de desarrolladores:** https://www.mercadopago.com.uy/developers/es/community

---

## ✅ Checklist de Verificación

Antes de contactar soporte:

- [ ] Access Token configurado en `.env`
- [ ] Token es de PRODUCCIÓN (no TEST)
- [ ] Moneda soportada por tu cuenta (USD o UYU)
- [ ] Método de pago compatible con la moneda
- [ ] Monto válido (mayor a 0)
- [ ] Payer identification correcto (CI para Uruguay)
- [ ] Logs completos del error guardados
- [ ] Backend corriendo sin errores de compilación
- [ ] Frontend puede conectarse al backend (sin CORS)

---

## 📝 Template para Reportar Error

Si necesitas ayuda, incluye esta información:

```
**Ambiente:**
- País: Uruguay
- Moneda intentada: USD
- Monto: $38
- Método de pago: Mastercard

**Error de MercadoPago:**
[Pegar el JSON completo del error]

**Configuración:**
- Access Token: TEST-... o APP-...
- SDK de MercadoPago: v1.5.17
- Node.js: v20.x

**Logs del backend:**
[Pegar logs relevantes]
```

---

**¡Con estos logs mejorados podrás identificar exactamente qué está fallando!** 🔍

