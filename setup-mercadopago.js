#!/usr/bin/env node
/**
 * Script de configuración rápida para Mercado Pago
 * Ejecuta: node setup-mercadopago.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 Configuración de Mercado Pago para tu tienda virtual\n')

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function setupMercadoPago() {
  try {
    console.log('Para configurar Mercado Pago necesitas tus credenciales de la cuenta de desarrollador.')
    console.log('Visita: https://www.mercadopago.com.uy/developers/panel\n')

    const publicKey = await askQuestion('Ingresa tu PUBLIC KEY (TEST-...): ')
    const accessToken = await askQuestion('Ingresa tu ACCESS TOKEN (TEST-...): ')
    
    if (!publicKey || !accessToken) {
      console.log('❌ Credenciales requeridas. Configuración cancelada.')
      process.exit(1)
    }

    // Validar formato de credenciales
    if (!publicKey.startsWith('TEST-') && !publicKey.startsWith('APP_USR-')) {
      console.log('⚠️  Advertencia: El PUBLIC KEY no tiene el formato esperado.')
    }

    if (!accessToken.startsWith('TEST-') && !accessToken.startsWith('APP_USR-')) {
      console.log('⚠️  Advertencia: El ACCESS TOKEN no tiene el formato esperado.')
    }

    // Crear archivo .env
    const envContent = `# Mercado Pago Configuration
# Reemplaza con tus credenciales de prueba/producción
VITE_MERCADOPAGO_PUBLIC_KEY=${publicKey}
VITE_MERCADOPAGO_ACCESS_TOKEN=${accessToken}

# Environment
VITE_NODE_ENV=development`

    fs.writeFileSync('.env', envContent)

    console.log('\n✅ Configuración completada!')
    console.log('📁 Archivo .env creado con tus credenciales.')
    console.log('🚀 Puedes ejecutar "npm run dev" para probar la integración.')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Ejecuta: npm run dev')
    console.log('   2. Ve a: http://localhost:5173/checkout')
    console.log('   3. Completa el formulario y prueba el pago')
    console.log('\n💳 Tarjetas de prueba disponibles en MERCADOPAGO_SETUP.md')

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

setupMercadoPago()