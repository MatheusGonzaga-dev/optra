import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT;

if (!PORT) {
  console.error('❌ PORT environment variable is not set!');
  process.exit(1);
}

const distPath = join(process.cwd(), 'dist');

if (!existsSync(distPath)) {
  console.error('❌ dist directory not found at:', distPath);
  process.exit(1);
}

console.log('✅ Serving from:', distPath);
console.log('✅ Starting server on port:', PORT);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'frontend' });
});

// Servir arquivos estáticos
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: true
}));

// SPA fallback - todas as rotas vão para index.html
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// Iniciar servidor
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ Ready to serve requests!`);
});

// Tratamento de erros
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
