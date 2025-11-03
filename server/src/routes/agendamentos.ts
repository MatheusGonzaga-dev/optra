import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

const agendamentoSchema = z.object({
  paciente_id: z.string().uuid(),
  optometrista_id: z.string().uuid(),
  data_hora: z.string(),
  duracao_minutos: z.number().int().min(15).optional(),
  tipo_consulta: z.enum([
    'PRIMEIRA_CONSULTA',
    'RETORNO',
    'URGENCIA',
    'EXAME',
  ]),
  observacoes: z.string().optional(),
  valor_consulta: z.number().optional(),
});

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*, pacientes(nome_completo, telefone), usuarios!agendamentos_optometrista_id_fkey(nome_completo)')
    .gte('data_hora', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order('data_hora', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const parse = agendamentoSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const payload = { status: 'AGENDADO', confirmado: false, ...parse.data } as const;

  const { data, error } = await supabase
    .from('agendamentos')
    .insert(payload)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});


