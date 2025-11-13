// Serverless function para Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.url?.includes('/health') || req.query.path === 'health') {
    return res.status(200).json({ 
      status: 'ok',
      message: 'API funcionando!',
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }

  // Rota raiz da API
  return res.status(200).json({ 
    name: 'optra-vision-backend', 
    status: 'ok', 
    environment: 'vercel',
    message: 'API está funcionando!',
    endpoints: {
      health: '/api/health',
      root: '/api'
    },
    url: req.url,
    method: req.method
  });
}
