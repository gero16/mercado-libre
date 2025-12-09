import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Obtener el sitemap del backend
    const backendUrl = 'https://poppy-shop-production.up.railway.app/api/sitemap.xml';
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const sitemapXml = await response.text();
    
    // Establecer headers correctos para XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    // Enviar el sitemap
    res.status(200).send(sitemapXml);
  } catch (error: any) {
    console.error('Error fetching sitemap from backend:', error);
    res.status(500).json({ 
      error: 'Error fetching sitemap',
      message: error.message 
    });
  }
}

