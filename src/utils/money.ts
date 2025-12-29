export const formatMoney = (value: any) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2)
}


