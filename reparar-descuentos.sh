#!/bin/bash

# Script para reparar descuentos mal configurados
# Uso: bash reparar-descuentos.sh

echo "🔧 Reparando descuentos en la base de datos..."
echo ""

# Llamar al endpoint de reparación
response=$(curl -s -X POST \
  "https://poppy-shop-production.up.railway.app/api/descuentos/reparar" \
  -H "Content-Type: application/json")

# Mostrar respuesta
echo "📊 Respuesta del servidor:"
echo "$response" | jq . 2>/dev/null || echo "$response"

echo ""
echo "✅ Proceso completado!"
echo ""
echo "🔍 Ahora recarga tu tienda (Ctrl + Shift + R) para ver los cambios"

