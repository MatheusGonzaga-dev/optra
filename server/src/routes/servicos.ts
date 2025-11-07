import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

const createSchema = z.object({
  nome: z.string().min(1),
  valor: z.number().nonnegative(),
  custo: z.number().nonnegative(),
  valor_retorno: z.number().nonnegative().optional(),
  descricao: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('servicos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.format() });
  const { data, error } = await supabase
    .from('servicos')
    .insert(parse.data)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.format() });
  const { data, error } = await supabase
    .from('servicos')
    .update(parse.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('servicos')
    .update({ ativo: false })
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});




