// Serverless function principal - roteia todas as requisições
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.replace('/api', '') || '/';

  // Health check
  if (path === '/health' || path === '/api/health') {
    return res.status(200).json({ 
      status: 'ok',
      message: 'API funcionando!',
      timestamp: new Date().toISOString()
    });
  }

  // Rota raiz
  if (path === '/' || path === '') {
    return res.status(200).json({ 
      name: 'optra-vision-backend', 
      status: 'ok', 
      environment: 'vercel',
      message: 'API está funcionando!',
      endpoints: ['/api/health', '/api']
    });
  }

  // Para outras rotas, retornar 404 por enquanto
  // (vamos implementar as rotas do backend depois)
  return res.status(404).json({ 
    error: 'Not found',
    path: path,
    message: 'Endpoint não implementado ainda'
  });
}
