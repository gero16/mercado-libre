# 🚀 Quickstart - Mercado Pago

## ⚡ Configuración en 3 pasos

### 1. Configurar credenciales

**Opción A - Script automático:**
```bash
node setup-mercadopago.js
```

**Opción B - Manual:**
Edita `.env`:
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token
```

### 2. Iniciar aplicación
```bash
npm run dev
```

### 3. Probar
- Ve a: http://localhost:5173/checkout
- Completa el formulario
- Usa tarjeta de prueba: `4509 9535 6623 3704`

## 🎯 Obtener Credenciales

1. **Ir a:** https://www.mercadopago.com.uy/developers
2. **Crear aplicación** → Checkout API
3. **Copiar credenciales** TEST para pruebas

## ✅ ¿Funciona?

- ✅ Formulario validado
- ✅ Botón de MP aparece
- ✅ Redirección automática
- ✅ Carrito se limpia al pagar

## 🆘 Problemas?

- **Botón no aparece:** Verificar credenciales en `.env`
- **Error en consola:** Revisar PUBLIC_KEY y ACCESS_TOKEN
- **No redirige:** Verificar que las rutas estén configuradas

---

📖 **Documentación completa:** `IMPLEMENTACION_MERCADOPAGO.md`