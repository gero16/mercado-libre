// Endpoint API REST para sincronización individual de producto ML
// Compatible con Vercel/Next.js API routes

//
const REAL_BACKEND_URL = 'https://poppy-shop-production.up.railway.app';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { publication_id } = req.body;
  if (!publication_id) {
    return res.status(400).json({ error: 'Falta publication_id en el body' });
  }
  try {
    // Llama al backend real para sincronizar individualmente el producto
    const syncRes = await fetch(`${REAL_BACKEND_URL}/api/ml/sync-uno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ml_id: publication_id })
    });
    if (!syncRes.ok) {
      const err = await syncRes.json().catch(() => ({}));
      throw new Error(err?.error || `No se pudo sincronizar el producto (${syncRes.status})`);
    }
    const data = await syncRes.json();
    return res.status(200).json({ message: 'Producto sincronizado correctamente', data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error sincronizando producto ML', detalles: error.message });
  }
}
