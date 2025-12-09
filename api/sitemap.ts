import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Obtener el sitemap del backend
    const backendUrl = 'https://poppy-shop-production.up.railway.app/api/sitemap.xml';
    
    console.log(`[Sitemap] Fetching from backend: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      headers: {
        'User-Agent': 'Vercel-Serverless-Function/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }
    
    const sitemapXml = await response.text();
    
    // Verificar que recibimos contenido válido
    if (!sitemapXml || sitemapXml.length === 0) {
      throw new Error('Empty sitemap received from backend');
    }
    
    console.log(`[Sitemap] Successfully fetched ${sitemapXml.length} bytes from backend`);
    
    // Establecer headers correctos para XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    // Enviar el sitemap
    res.status(200).send(sitemapXml);
  } catch (error: any) {
    console.error('[Sitemap] Error fetching sitemap from backend:', error);
    
    // En caso de error, devolver un sitemap mínimo válido en lugar de JSON
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.poppyshopuy.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Error loading full sitemap: ${error.message} -->
</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(errorSitemap);
  }
}

