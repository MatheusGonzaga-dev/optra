// Script para iniciar o serve escutando em 0.0.0.0
// Usa require mesmo com type: module no package.json
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const DIST_DIR = join(__dirname, 'dist');

console.log(`🚀 Iniciando serve na porta ${PORT} em 0.0.0.0`);
console.log(`📁 Servindo arquivos de: ${DIST_DIR}`);

const serve = spawn(
  'node',
  [
    join(__dirname, 'node_modules', '.bin', 'serve'),
    '-s',
    DIST_DIR,
    '-l',
    `0.0.0.0:${PORT}`
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
  }
);

serve.on('error', (err) => {
  console.error('❌ Erro ao iniciar serve:', err);
  process.exit(1);
});

serve.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Serve encerrou com código ${code}`);
  }
  process.exit(code || 0);
});

