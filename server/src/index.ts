import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(morgan('dev'));

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

app.get('/', (_req, res) => {
  res.json({ name: 'optra-vision-backend', status: 'ok' });
});

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${PORT}`);
});


