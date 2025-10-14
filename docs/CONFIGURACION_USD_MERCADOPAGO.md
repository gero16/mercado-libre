# 💵 Configuración de MercadoPago para USD (Dólares)

## ✅ Cambios Realizados

Tu MercadoPago ahora está completamente configurado para procesar pagos en **USD (dólares estadounidenses)** en lugar de UYU o ARS.

---

## 📋 Archivos Modificados

### 🔧 Backend (`tienda-virtual-ts-back`)

#### **Archivo: `routes/api.ts`**

**1. Endpoint `/create_preference` (Línea 288)**
```typescript
// Antes:
currency_id: item.currency_id || "UYU"

// Después:
currency_id: "USD" as const // 💵 Dólares estadounidenses
```

**2. Endpoint `/create_preference_multi` (Línea 360)**
```typescript
// Antes:
currency_id: "ARS" as const

// Después:
currency_id: "USD" as const // 💵 Dólares estadounidenses
```

**3. Endpoint `/create_preference_cart` (Línea 424)**
```typescript
// Antes:
currency_id: "ARS" as const

// Después:
currency_id: "USD" as const // 💵 Dólares estadounidenses
```

**4. Endpoint `/process_payment` (Línea 850)**
```typescript
// Antes:
const paymentData = {
  transaction_amount: Number(transaction_amount),
  token: token,
  description: description || "Pago desde tienda virtual",
  installments: Number(installments) || 1,
  payment_method_id: payment_method_id,
  payer: { ... }
}

// Después:
const paymentData = {
  transaction_amount: Number(transaction_amount),
  token: token,
  description: description || "Pago desde tienda virtual",
  installments: Number(installments) || 1,
  payment_method_id: payment_method_id,
  currency_id: "USD", // 💵 Dólares estadounidenses
  payer: { ... }
}
```

---

### 🎨 Frontend (`mercado-libre`)

#### **Archivo: `src/services/mercadopago.ts` (Línea 98)**

```typescript
// Antes:
static formatCartItemsForMP(cartItems: any[]): PreferenceItem[] {
  return cartItems.map((item, index) => ({
    id: item.ml_id?.toString() || item.id?.toString() || index.toString(),
    title: item.name || item.title,
    quantity: item.cantidad || item.quantity || 1,
    currency_id: 'UYU', // Pesos uruguayos
    unit_price: item.price
  }))
}

// Después:
static formatCartItemsForMP(cartItems: any[]): PreferenceItem[] {
  return cartItems.map((item, index) => ({
    id: item.ml_id?.toString() || item.id?.toString() || index.toString(),
    title: item.name || item.title,
    quantity: item.cantidad || item.quantity || 1,
    currency_id: 'USD', // 💵 Dólares estadounidenses
    unit_price: item.price
  }))
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Cuenta de MercadoPago**
Para procesar pagos en USD, tu cuenta de MercadoPago debe:
- ✅ Estar habilitada para recibir pagos en dólares
- ✅ Tener una cuenta bancaria en USD o que acepte conversiones
- ✅ Estar en un país que soporte USD (Uruguay soporta USD)

### 2. **Métodos de Pago**
Con USD, tus clientes podrán pagar con:
- 💳 Tarjetas de crédito internacionales (Visa, Mastercard, etc.)
- 💰 MercadoPago balance
- 🏦 Transferencias bancarias (según disponibilidad)

**Nota:** Algunos métodos de pago locales (como Rapipago, PagoFácil en Argentina) podrían no estar disponibles con USD.

### 3. **Comisiones**
- Las comisiones de MercadoPago pueden variar según la moneda
- Generalmente, las transacciones en USD tienen comisiones similares
- Verifica en tu panel de MercadoPago las comisiones aplicables

### 4. **Conversión de Moneda**
Si tu cuenta bancaria es en UYU pero recibes pagos en USD:
- MercadoPago hará la conversión automática al tipo de cambio del día
- Puede haber una comisión adicional por conversión
- El comprador siempre paga en USD

---

## 🧪 Cómo Probar

### En Modo Sandbox (Pruebas)
1. Asegúrate de usar tu **Access Token de TEST** en `.env`:
   ```env
   MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxx
   ```

2. Usa tarjetas de prueba de MercadoPago:
   - **Visa:** 4509 9535 6623 3704
   - **Mastercard:** 5031 7557 3453 0604
   - **CVV:** 123
   - **Fecha de vencimiento:** cualquier fecha futura
   - **Nombre:** cualquier nombre

3. Realiza una compra de prueba y verifica que el monto aparezca en USD

### En Modo Producción
1. Usa tu **Access Token de PRODUCCIÓN** en `.env`:
   ```env
   MP_ACCESS_TOKEN=APP-xxxxxxxxxxxxxxxx
   ```

2. Realiza una compra real pequeña para probar

3. Verifica en tu panel de MercadoPago que el pago aparezca en USD

---

## 🔍 Verificación

### Backend
```bash
# Reinicia tu servidor backend
cd tienda-virtual-ts-back
npm run start
```

### Frontend
```bash
# Reconstruye el frontend
cd mercado-libre
npm run build
vercel --prod
```

### Logs
Al procesar un pago, deberías ver en los logs del backend:
```
💳 Procesando pago con MercadoPago...
💰 Monto: $XX.XX
💳 Método: credit_card (o el método usado)
```

Y en la respuesta de MercadoPago deberías ver:
```json
{
  "currency_id": "USD",
  "transaction_amount": XX.XX
}
```

---

## 📊 Visualización en MercadoPago

Cuando los pagos se procesen, en tu dashboard de MercadoPago verás:
- Montos en **USD $XX.XX**
- Conversión automática si tu cuenta es en UYU
- Detalles de cada transacción en dólares

---

## 🚨 Solución de Problemas

### Error: "Currency not supported"
**Causa:** Tu cuenta de MercadoPago no soporta USD
**Solución:** Contacta a MercadoPago para habilitar USD en tu cuenta

### Error: "Payment method not available"
**Causa:** Algunos métodos de pago no aceptan USD
**Solución:** Verifica qué métodos de pago están disponibles en tu país para USD

### Los precios siguen apareciendo en UYU/ARS
**Causa:** El frontend no se actualizó o hay caché
**Solución:**
```bash
# Limpiar caché y reconstruir
cd mercado-libre
rm -rf node_modules/.vite
npm run build
```

### Diferencia en el monto del pago
**Causa:** Conversión de tipos de dato o redondeo
**Solución:** Ya implementado - el backend valida con tolerancia de $0.10

---

## ✅ Checklist de Verificación

Antes de poner en producción, verifica:

- [ ] Access Token de MercadoPago es de producción
- [ ] Cuenta de MercadoPago habilitada para USD
- [ ] Probaste un pago de prueba exitoso
- [ ] Los logs muestran "USD" como currency_id
- [ ] El dashboard de MercadoPago muestra USD
- [ ] Los precios de tus productos están en USD
- [ ] Los emails de confirmación muestran USD
- [ ] La factura/orden muestra USD

---

## 🔗 Recursos Útiles

- [Documentación de MercadoPago - Monedas](https://www.mercadopago.com.uy/developers/es/docs/checkout-api/integration-configuration/currency)
- [Panel de MercadoPago](https://www.mercadopago.com.uy/)
- [Credenciales de MercadoPago](https://www.mercadopago.com.uy/developers/panel)
- [Tarjetas de Prueba](https://www.mercadopago.com.uy/developers/es/docs/checkout-api/testing/test-cards)

---

## 📞 Soporte

Si tienes problemas con la configuración de USD:
1. Verifica que tu cuenta de MercadoPago soporte USD
2. Contacta al soporte de MercadoPago: soporte@mercadopago.com
3. Revisa los logs del backend para ver errores específicos

---

**¡Tu tienda ahora está configurada para procesar pagos en USD!** 💵✨

