export const formatMoney = (value: any) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2)
}

// "Última defensa" para mostrar cualquier monto float con solo 2 decimales en textos
export function fixFloatString(str: string) {
  // Reemplaza secuencias tipo 123.456789... por su versión a 2 decimales (si tiene más de 2 decimales)
  return str.replace(/(\d+\.\d{2,})/g, (m) => {
    const asNum = Number(m);
    if (isNaN(asNum)) return m;
    return asNum.toFixed(2);
  });
}
