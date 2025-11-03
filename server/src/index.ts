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

app.get('/', (_req, res) => {
  res.json({ name: 'optra-vision-backend', status: 'ok' });
});

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${PORT}`);
});


