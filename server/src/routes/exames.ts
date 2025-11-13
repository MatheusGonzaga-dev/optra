import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema de validação para criar exame
const exameSchema = z.object({
  nome_exame: z.string().min(1, 'Nome do exame é obrigatório'),
  resultado: z.string().min(1, 'Resultado é obrigatório'),
  observacoes: z.string().optional(),
  data_realizacao: z.string().optional(),
});

// GET /exames?fila_id=xxx - Buscar exames por fila_id ou prontuario_id
router.get('/', async (req, res) => {
  try {
    const { fila_id, prontuario_id, paciente_id } = req.query;
    
    let query = supabase.from('exames_atendimento').select('*').order('data_realizacao', { ascending: false });
    
    if (fila_id && typeof fila_id === 'string') {
      query = query.eq('fila_id', fila_id);
    }
    if (prontuario_id && typeof prontuario_id === 'string') {
      query = query.eq('prontuario_id', prontuario_id);
    }
    if (paciente_id && typeof paciente_id === 'string') {
      query = query.eq('paciente_id', paciente_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar exames:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (e: any) {
    console.error('Erro no endpoint GET /exames:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /exames/:filaId - Criar exame para um atendimento
router.post('/:filaId', async (req, res) => {
  try {
    const { filaId } = req.params;
    const parse = exameSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }
    
    // Buscar dados da fila
    const { data: fila, error: filaError } = await supabase
      .from('fila_atendimento')
      .select('id, paciente_id')
      .eq('id', filaId)
      .single();
    
    if (filaError || !fila) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    // Buscar prontuário associado (se existir)
    const { data: prontuario } = await supabase
      .from('prontuarios')
      .select('id')
      .eq('fila_id', filaId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Inserir exame
    const { data, error } = await supabase
      .from('exames_atendimento')
      .insert({
        fila_id: fila.id,
        prontuario_id: prontuario?.id || null,
        paciente_id: fila.paciente_id,
        nome_exame: parse.data.nome_exame,
        resultado: parse.data.resultado,
        observacoes: parse.data.observacoes || null,
        data_realizacao: parse.data.data_realizacao || new Date().toISOString(),
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Erro ao criar exame:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (e: any) {
    console.error('Erro no endpoint POST /exames/:filaId:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /exames/:id - Atualizar exame
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = exameSchema.partial().safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }
    
    const { data, error } = await supabase
      .from('exames_atendimento')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Erro ao atualizar exame:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (e: any) {
    console.error('Erro no endpoint PUT /exames/:id:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /exames/:id - Deletar exame
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('exames_atendimento')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar exame:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ message: 'Exame deletado com sucesso' });
  } catch (e: any) {
    console.error('Erro no endpoint DELETE /exames/:id:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



