import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Obtener el robots.txt del backend
    const backendUrl = 'https://poppy-shop-production.up.railway.app/api/robots.txt';
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const robotsTxt = await response.text();
    
    // Establecer headers correctos para texto plano
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    // Enviar el robots.txt
    res.status(200).send(robotsTxt);
  } catch (error: any) {
    console.error('Error fetching robots.txt from backend:', error);
    res.status(500).json({ 
      error: 'Error fetching robots.txt',
      message: error.message 
    });
  }
}

