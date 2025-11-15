import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting frontend server...');
console.log('📂 Current directory:', process.cwd());
console.log('📂 __dirname:', __dirname);

const app = express();
const PORT = process.env.PORT || 8080;

// Tentar diferentes caminhos para dist
const possibleDistPaths = [
  join(process.cwd(), 'dist'),
  join(__dirname, 'dist'),
  resolve(process.cwd(), 'dist'),
  resolve(__dirname, 'dist')
];

let distPath = null;
for (const path of possibleDistPaths) {
  console.log(`🔍 Checking path: ${path}`);
  if (existsSync(path)) {
    distPath = path;
    console.log(`✅ Found dist at: ${distPath}`);
    try {
      const files = readdirSync(distPath);
      console.log(`📁 Files in dist: ${files.slice(0, 5).join(', ')}...`);
    } catch (e) {
      console.log('⚠️ Could not read dist directory');
    }
    break;
  }
}

if (!distPath) {
  console.error('❌ Error: dist directory not found in any of these paths:');
  possibleDistPaths.forEach(p => console.error(`   - ${p}`));
  console.error('📋 Current directory contents:');
  try {
    const files = readdirSync(process.cwd());
    console.error(`   ${files.join(', ')}`);
  } catch (e) {
    console.error('   Could not read directory');
  }
  process.exit(1);
}

// Servir arquivos estáticos
app.use(express.static(distPath));

// SPA fallback - todas as rotas vão para index.html
app.get('*', (req, res) => {
  console.log(`📥 Request: ${req.method} ${req.path}`);
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('❌ Error sending file:', err);
      res.status(500).send('Error loading page');
    }
  });
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
  console.log(`🌐 Access at: http://0.0.0.0:${PORT}`);
  console.log(`🔗 Ready to serve requests!`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

