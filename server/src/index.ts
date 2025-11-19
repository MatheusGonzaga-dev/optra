import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { router as healthRouter } from './routes/health.js';
import { router as pacientesRouter } from './routes/pacientes.js';
import { router as agendamentosRouter } from './routes/agendamentos.js';
import { router as usuariosRouter } from './routes/usuarios.js';
import { router as filaRouter } from './routes/fila.js';
import { router as atendimentosRouter } from './routes/atendimentos.js';
import { router as servicosRouter } from './routes/servicos.js';
import { router as parceriasRouter } from './routes/parcerias.js';
import { router as contasPagarRouter } from './routes/contas_pagar.js';
import { router as contasReceberRouter } from './routes/contas_receber.js';
import { router as fornecedoresRouter } from './routes/fornecedores.js';
import { router as categoriasRouter } from './routes/categorias.js';
import { router as gruposRouter } from './routes/grupos.js';
import { router as dashboardRouter } from './routes/dashboard.js';
import { router as examesRouter } from './routes/exames.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(helmet());
// CORS configurado para aceitar requisições
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'https://optrasystem.vercel.app',
      /^https:\/\/.*\.vercel\.app$/, // Aceita todos os previews da Vercel
      /^https:\/\/.*\.up\.railway\.app$/, // Aceita todos os domínios do Railway
      'http://localhost:8080',
      'http://localhost:5173', // Vite dev server alternativo
    ];

// Em produção, se CORS_ORIGIN não estiver definido, aceita origens conhecidas
// Configure CORS_ORIGIN para adicionar domínios específicos
app.use(cors({ 
  origin: corsOrigins,
  credentials: false 
}));
app.use(express.json());
app.use(morgan('dev'));

// Rotas da API
app.use('/health', healthRouter);
app.use('/pacientes', pacientesRouter);
app.use('/agendamentos', agendamentosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/fila', filaRouter);
app.use('/atendimentos', atendimentosRouter);
app.use('/servicos', servicosRouter);
app.use('/parcerias', parceriasRouter);
app.use('/contas-pagar', contasPagarRouter);
app.use('/contas-receber', contasReceberRouter);
app.use('/fornecedores', fornecedoresRouter);
app.use('/categorias', categoriasRouter);
app.use('/grupos', gruposRouter);
app.use('/dashboard', dashboardRouter);
app.use('/exames', examesRouter);

// Servir arquivos estáticos do frontend (se existir)
// No Docker, o frontend-dist está na raiz do app (/app/frontend-dist)
// Em desenvolvimento local, está 2 níveis acima de server/src
const distPath = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'frontend-dist')
  : join(__dirname, '..', '..', 'dist');
if (existsSync(distPath)) {
  console.log('📁 Servindo frontend de:', distPath);
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true
  }));
  
  // SPA fallback - todas as rotas não-API vão para index.html
  app.get('*', (req, res) => {
    // Se não for uma rota de API, servir index.html
    if (!req.path.startsWith('/api') && 
        !req.path.startsWith('/health') &&
        !req.path.startsWith('/pacientes') &&
        !req.path.startsWith('/agendamentos') &&
        !req.path.startsWith('/usuarios') &&
        !req.path.startsWith('/fila') &&
        !req.path.startsWith('/atendimentos') &&
        !req.path.startsWith('/servicos') &&
        !req.path.startsWith('/parcerias') &&
        !req.path.startsWith('/contas-pagar') &&
        !req.path.startsWith('/contas-receber') &&
        !req.path.startsWith('/fornecedores') &&
        !req.path.startsWith('/categorias') &&
        !req.path.startsWith('/grupos') &&
        !req.path.startsWith('/dashboard') &&
        !req.path.startsWith('/exames')) {
      res.sendFile(join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
} else {
  console.log('⚠️  Frontend dist não encontrado em:', distPath);
  app.get('/', (_req, res) => {
    res.json({ name: 'optra-vision-backend', status: 'ok' });
  });
}

// Railway define PORT automaticamente via variável de ambiente
// Se não estiver definida, usar 4000 como fallback (para desenvolvimento local)
const PORT = Number(process.env.PORT) || 4000;

// Log da porta sendo usada para debug
console.log(`🔌 Usando porta: ${PORT} (PORT=${process.env.PORT || 'não definida, usando fallback 4000'})`);

// Só inicia o servidor se não estiver rodando como serverless function
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`📡 API disponível em http://0.0.0.0:${PORT}/health`);
    if (existsSync(distPath)) {
      console.log(`🌐 Frontend disponível em http://0.0.0.0:${PORT}`);
    }
  });
}

// Exporta o app para uso como serverless function
export default app;


