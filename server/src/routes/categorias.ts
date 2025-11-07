import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema para categoria
const categoriaSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['RECEITA', 'DESPESA']).default('DESPESA'),
  cor: z.string().optional(),
  icone: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

const categoriaUpdateSchema = categoriaSchema.partial();

// Schema para subcategoria
const subcategoriaSchema = z.object({
  categoria_id: z.string().uuid(),
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

const subcategoriaUpdateSchema = subcategoriaSchema.partial();

// GET /categorias - Listar todas as categorias (filtradas por tipo opcional)
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let query = supabase
      .from('categorias_financeiras')
      .select('*')
      .eq('ativo', true)
      .is('deletado_em', null)
      .order('nome', { ascending: true });

    if (tipo === 'RECEITA' || tipo === 'DESPESA') {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Erro no endpoint GET /categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /categorias/:id - Obter categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('categorias_financeiras')
      .select('*')
      .eq('id', id)
      .is('deletado_em', null)
      .single();

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint GET /categorias/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /categorias/:id/subcategorias - Listar subcategorias de uma categoria
router.get('/:id/subcategorias', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('subcategorias_financeiras')
      .select('*')
      .eq('categoria_id', id)
      .eq('ativo', true)
      .is('deletado_em', null)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar subcategorias:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Erro no endpoint GET /categorias/:id/subcategorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /categorias - Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const parse = categoriaSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('categorias_financeiras')
      .insert(parse.data)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /categorias/:id - Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = categoriaUpdateSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('categorias_financeiras')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /categorias/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /categorias/:id - Soft delete da categoria
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categorias_financeiras')
      .update({ deletado_em: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro no endpoint DELETE /categorias/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== SUBcategorias ====================

// GET /subcategorias - Listar todas as subcategorias
router.get('/subcategorias/all', async (req, res) => {
  try {
    const { categoria_id } = req.query;
    
    let query = supabase
      .from('subcategorias_financeiras')
      .select('*')
      .eq('ativo', true)
      .is('deletado_em', null)
      .order('nome', { ascending: true });

    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar subcategorias:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Erro no endpoint GET /subcategorias/all:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /subcategorias - Criar nova subcategoria
router.post('/subcategorias', async (req, res) => {
  try {
    const parse = subcategoriaSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('subcategorias_financeiras')
      .insert(parse.data)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar subcategoria:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /subcategorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /subcategorias/:id - Atualizar subcategoria
router.put('/subcategorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = subcategoriaUpdateSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('subcategorias_financeiras')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar subcategoria:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Subcategoria não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /subcategorias/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /subcategorias/:id - Soft delete da subcategoria
router.delete('/subcategorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('subcategorias_financeiras')
      .update({ deletado_em: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir subcategoria:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro no endpoint DELETE /subcategorias/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
