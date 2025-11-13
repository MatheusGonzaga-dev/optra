// Serverless function wrapper para Vercel
// Importa e exporta o app Express do backend

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Importar rotas diretamente
import { router as healthRouter } from '../server/src/routes/health.js';
import { router as pacientesRouter } from '../server/src/routes/pacientes.js';
import { router as agendamentosRouter } from '../server/src/routes/agendamentos.js';
import { router as usuariosRouter } from '../server/src/routes/usuarios.js';
import { router as filaRouter } from '../server/src/routes/fila.js';
import { router as atendimentosRouter } from '../server/src/routes/atendimentos.js';
import { router as servicosRouter } from '../server/src/routes/servicos.js';
import { router as parceriasRouter } from '../server/src/routes/parcerias.js';
import { router as contasPagarRouter } from '../server/src/routes/contas_pagar.js';
import { router as contasReceberRouter } from '../server/src/routes/contas_receber.js';
import { router as fornecedoresRouter } from '../server/src/routes/fornecedores.js';
import { router as categoriasRouter } from '../server/src/routes/categorias.js';
import { router as gruposRouter } from '../server/src/routes/grupos.js';
import { router as dashboardRouter } from '../server/src/routes/dashboard.js';
import { router as examesRouter } from '../server/src/routes/exames.js';

const app = express();

app.use(helmet());
// CORS configurado para aceitar requisições da Vercel e localhost
app.use(cors({ 
  origin: [
    'https://optrasystem.vercel.app',
    /^https:\/\/.*\.vercel\.app$/, // Aceita todos os previews da Vercel
    'http://localhost:8080',
    'http://localhost:5173', // Vite dev server alternativo
  ],
  credentials: false 
}));
app.use(express.json());
app.use(morgan('dev'));

// Registrar todas as rotas
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

app.get('/', (_req, res) => {
  res.json({ name: 'optra-vision-backend', status: 'ok', environment: 'vercel' });
});

// Exporta o app para a Vercel usar como serverless function
export default app;
