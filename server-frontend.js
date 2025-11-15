import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const distPath = join(__dirname, 'dist');

// Verificar se dist existe
if (!existsSync(distPath)) {
  console.error('❌ Error: dist directory not found!');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Servir arquivos estáticos
app.use(express.static(distPath));

// SPA fallback - todas as rotas vão para index.html
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
  console.log(`🌐 Access at: http://0.0.0.0:${PORT}`);
});

