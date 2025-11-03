import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

const pacienteSchema = z.object({
  nome_completo: z.string().min(1),
  cpf: z.string().optional(),
  data_nascimento: z.string(),
  telefone: z.string().min(1),
  email: z.string().email().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  convenio: z.string().optional(),
  numero_carteirinha: z.string().optional(),
  alergias: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().optional(),
  cadastrado_por_id: z.string().uuid().optional(),
});

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .is('deletado_em', null)
    .order('nome_completo', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  console.log('Dados recebidos:', req.body);
  const parse = pacienteSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('Erro de validação:', parse.error.format());
    return res.status(400).json({ error: parse.error.format() });
  }

  // Formatar CPF se fornecendo apenas dígitos (sem pontos e traço)
  const dataToInsert = { ...parse.data };
  if (dataToInsert.cpf && /^\d{11}$/.test(dataToInsert.cpf)) {
    // Formatar para XXX.XXX.XXX-XX
    dataToInsert.cpf = dataToInsert.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    console.log('CPF formatado:', dataToInsert.cpf);
  }

  const { data, error } = await supabase.from('pacientes').insert(dataToInsert).select('*').single();
  if (error) {
    console.error('Erro ao inserir no Supabase:', error);
    return res.status(500).json({ error: error.message });
  }
  console.log('Paciente criado com sucesso:', data);
  res.status(201).json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .is('deletado_em', null)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parse = pacienteSchema.partial().safeParse(req.body);
  if (!parse.success) {
    console.error('Erro de validação (PUT):', parse.error.format());
    return res.status(400).json({ error: parse.error.format() });
  }

  const { data, error } = await supabase
    .from('pacientes')
    .update(parse.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    console.error('Erro ao atualizar paciente:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  // soft delete: set deletado_em
  const { error } = await supabase
    .from('pacientes')
    .update({ deletado_em: new Date().toISOString() })
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});


