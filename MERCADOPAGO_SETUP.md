# Configuración de Mercado Pago

## 🚀 Guía de Configuración

### 1. Obtener Credenciales de Mercado Pago

Para integrar Mercado Pago en tu aplicación necesitas:

1. **Crear cuenta en Mercado Pago Developers**
   - Visita: https://www.mercadopago.com.uy/developers
   - Inicia sesión con tu cuenta de Mercado Libre o crea una nueva

2. **Crear una aplicación**
   - Ve a "Mis aplicaciones" → "Crear aplicación"
   - Selecciona "Checkout API" como producto
   - Completa la información solicitada

3. **Obtener credenciales**
   - **Modo Sandbox (Pruebas):**
     - Public Key: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
     - Access Token: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx-xxxxxxxx`
   
   - **Modo Producción:**
     - Public Key: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
     - Access Token: `APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx-xxxxxxxx`

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```bash
# Mercado Pago Configuration
# Para PRUEBAS usar credenciales TEST
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui

# Para PRODUCCIÓN usar credenciales APP_USR
# VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
# VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token-aqui

# Environment
VITE_NODE_ENV=development
```

### 3. Configurar Webhook (Opcional)

Para recibir notificaciones de estado de pago:

1. En tu aplicación de Mercado Pago, configura la URL de webhook:
   ```
   https://tu-dominio.com/webhook/mercadopago
   ```

2. Implementa el endpoint para manejar las notificaciones IPN.

### 4. Métodos de Pago Soportados

La integración soporta:
- ✅ Tarjetas de crédito y débito
- ✅ Efectivo (RedPagos, Abitab)
- ✅ Transferencia bancaria
- ✅ Dinero en cuenta de Mercado Pago

### 5. Flujo de Pago

1. **Usuario completa formulario** → Datos del cliente
2. **Clic en "Continuar al Pago"** → Se crea preferencia en Mercado Pago
3. **Aparece botón de MP** → Usuario selecciona método de pago
4. **Procesamiento** → Mercado Pago procesa el pago
5. **Redirección** → Success/Failure/Pending según resultado

### 6. URLs de Retorno

Las URLs están configuradas automáticamente:
- **Éxito:** `/checkout/success`
- **Error:** `/checkout/failure`
- **Pendiente:** `/checkout/pending`

### 7. Entorno de Pruebas

Para probar puedes usar estas tarjetas de prueba:

**Visa (Aprobada):**
- Número: 4509 9535 6623 3704
- Código: 123
- Fecha: 11/25

**Mastercard (Rechazada):**
- Número: 5031 7557 3453 0604
- Código: 123
- Fecha: 11/25

### 8. Moneda

La aplicación está configurada para **Peso Uruguayo (UYU)**.

### 9. Logs y Debugging

Los errores se muestran en:
- Console del navegador
- Mensajes de error en la UI
- Alerts informativos para el usuario

### 10. Checklist de Verificación

- [ ] Credenciales configuradas en `.env`
- [ ] Aplicación funcionando en desarrollo (`npm run dev`)
- [ ] Formulario de checkout completo
- [ ] Botón de Mercado Pago aparece después del formulario
- [ ] Redirecciones funcionando correctamente
- [ ] Páginas de resultado mostrando información correcta

## 🔧 Desarrollo

Para iniciar el proyecto:
```bash
npm install
npm run dev
```

## 📧 Soporte

Si necesitas ayuda con la configuración, contacta al equipo de desarrollo.