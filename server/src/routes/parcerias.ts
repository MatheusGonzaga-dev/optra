import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

const createSchema = z.object({
  nome: z.string().min(1),
  cnpj_cpf: z.string().min(1),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  data_parceria: z.string().optional(), // ISO date string
});

const updateSchema = createSchema.partial();

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('parcerias')
      .select('*')
      .eq('ativo', true)
      .order('data_parceria', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e: any) {
    console.error('Erro ao listar parcerias:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.format() });

    const payload: any = {
      nome: parse.data.nome,
      cnpj_cpf: parse.data.cnpj_cpf,
      telefone: parse.data.telefone || null,
      endereco: parse.data.endereco || null,
    };

    if (parse.data.data_parceria) {
      payload.data_parceria = parse.data.data_parceria;
    }

    const { data, error } = await supabase
      .from('parcerias')
      .insert(payload)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    console.error('Erro ao criar parceria:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.format() });

    const { data, error } = await supabase
      .from('parcerias')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    console.error('Erro ao atualizar parceria:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('parcerias')
      .update({ ativo: false })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e: any) {
    console.error('Erro ao deletar parceria:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /parcerias/:id/servicos - Listar serviços com desconto/acréscimo da parceria
router.get('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar vínculos
    const { data: parceriasServicos, error } = await supabase
      .from('parcerias_servicos')
      .select('*')
      .eq('parceria_id', id)
      .eq('ativo', true);
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Buscar serviços separadamente
    const result = await Promise.all((parceriasServicos || []).map(async (ps) => {
      const { data: servico } = await supabase
        .from('servicos')
        .select('id, nome, valor')
        .eq('id', ps.servico_id)
        .single();
      return { ...ps, servicos: servico || null };
    }));
    
    res.json(result);
  } catch (e: any) {
    console.error('Erro ao buscar serviços da parceria:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /parcerias/:id/servicos - Vincular serviço com desconto/acréscimo
router.post('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      servico_id: z.string().uuid(),
      desconto_percentual: z.number().min(0).max(100).optional().default(0),
      desconto_valor: z.number().min(0).optional().default(0),
      acrescimo_percentual: z.number().min(0).max(100).optional().default(0),
      acrescimo_valor: z.number().min(0).optional().default(0),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.format() });

    const { data, error } = await supabase
      .from('parcerias_servicos')
      .upsert({
        parceria_id: id,
        servico_id: parse.data.servico_id,
        desconto_percentual: parse.data.desconto_percentual,
        desconto_valor: parse.data.desconto_valor,
        acrescimo_percentual: parse.data.acrescimo_percentual,
        acrescimo_valor: parse.data.acrescimo_valor,
        ativo: true,
      }, {
        onConflict: 'parceria_id,servico_id',
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    console.error('Erro ao vincular serviço:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /parcerias/:id/servicos/:servicoId - Remover vínculo
router.delete('/:id/servicos/:servicoId', async (req, res) => {
  try {
    const { id, servicoId } = req.params;
    const { error } = await supabase
      .from('parcerias_servicos')
      .update({ ativo: false })
      .eq('parceria_id', id)
      .eq('servico_id', servicoId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e: any) {
    console.error('Erro ao remover vínculo:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

