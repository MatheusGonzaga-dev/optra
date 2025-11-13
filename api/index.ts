// Wrapper para adaptar Express ao formato serverless da Vercel
// @ts-ignore - Importação dinâmica para evitar problemas de build
import app from '../server/src/index.js';

// Exporta o app Express para a Vercel
// A Vercel vai usar isso como serverless function
export default app;

