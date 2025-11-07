import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema para criar/atualizar grupo
const grupoSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  permissoes: z.array(z.string().uuid()).optional(), // Array de IDs de permissões
});

// GET /grupos - Listar todos os grupos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grupos_acesso')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /grupos/permissoes - Listar todas as permissões (DEVE VIR ANTES DE /:id)
router.get('/permissoes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('permissoes')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /grupos/grupo-permissoes - Adicionar permissão a um grupo (ANTES DE /:id)
router.post('/grupo-permissoes', async (req, res) => {
  try {
    const { grupo_id, permissao_id } = req.body;

    if (!grupo_id || !permissao_id) {
      return res.status(400).json({ error: 'grupo_id e permissao_id são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('grupo_permissoes')
      .insert({ grupo_id, permissao_id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro ao adicionar permissão ao grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /grupos/grupo-permissoes - Remover permissão de um grupo (ANTES DE /:id)
router.delete('/grupo-permissoes', async (req, res) => {
  try {
    const { grupo_id, permissao_id } = req.body;

    if (!grupo_id || !permissao_id) {
      return res.status(400).json({ error: 'grupo_id e permissao_id são obrigatórios' });
    }

    const { error } = await supabase
      .from('grupo_permissoes')
      .delete()
      .eq('grupo_id', grupo_id)
      .eq('permissao_id', permissao_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover permissão do grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /grupos/:id - Buscar grupo específico com permissões
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar grupo
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_acesso')
      .select('*')
      .eq('id', id)
      .single();

    if (grupoError) throw grupoError;
    if (!grupo) return res.status(404).json({ error: 'Grupo não encontrado' });

    // Buscar permissões do grupo
    const { data: permissoes, error: permissoesError } = await supabase
      .from('grupo_permissoes')
      .select('permissao_id, permissoes(*)')
      .eq('grupo_id', id);

    if (permissoesError) throw permissoesError;

    res.json({
      ...grupo,
      permissoes: permissoes?.map(p => p.permissoes) || []
    });
  } catch (error: any) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /grupos - Criar novo grupo
router.post('/', async (req, res) => {
  try {
    const parse = grupoSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { nome, descricao, permissoes } = parse.data;

    // Criar grupo
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_acesso')
      .insert({ nome, descricao })
      .select('*')
      .single();

    if (grupoError) throw grupoError;

    // Associar permissões se fornecidas
    if (permissoes && permissoes.length > 0) {
      const grupoPermissoes = permissoes.map(permissao_id => ({
        grupo_id: grupo.id,
        permissao_id
      }));

      const { error: permError } = await supabase
        .from('grupo_permissoes')
        .insert(grupoPermissoes);

      if (permError) throw permError;
    }

    res.status(201).json(grupo);
  } catch (error: any) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /grupos/:id - Atualizar grupo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = grupoSchema.partial().safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { nome, descricao, permissoes } = parse.data;

    // Atualizar dados do grupo
    if (nome || descricao !== undefined) {
      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;

      const { error: updateError } = await supabase
        .from('grupos_acesso')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // Atualizar permissões se fornecidas
    if (permissoes) {
      // Remover permissões antigas
      const { error: deleteError } = await supabase
        .from('grupo_permissoes')
        .delete()
        .eq('grupo_id', id);

      if (deleteError) throw deleteError;

      // Inserir novas permissões
      if (permissoes.length > 0) {
        const grupoPermissoes = permissoes.map(permissao_id => ({
          grupo_id: id,
          permissao_id
        }));

        const { error: insertError } = await supabase
          .from('grupo_permissoes')
          .insert(grupoPermissoes);

        if (insertError) throw insertError;
      }
    }

    // Buscar grupo atualizado
    const { data: grupo, error: fetchError } = await supabase
      .from('grupos_acesso')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    res.json(grupo);
  } catch (error: any) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /grupos/:id - Excluir grupo (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('grupos_acesso')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /grupos/:id/permissoes - Listar permissões de um grupo
router.get('/:id/permissoes', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('grupo_permissoes')
      .select('permissao_id, permissoes(*)')
      .eq('grupo_id', id);

    if (error) throw error;

    const permissoes = data?.map(p => p.permissoes) || [];
    res.json(permissoes);
  } catch (error: any) {
    console.error('Erro ao buscar permissões do grupo:', error);
    res.status(500).json({ error: error.message });
  }
});

