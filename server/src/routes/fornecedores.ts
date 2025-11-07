import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

const createSchema = z.object({
  nome: z.string().min(1),
  cnpj: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

// GET /fornecedores - Listar todos os fornecedores
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (e: any) {
    console.error('Erro ao listar fornecedores:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /fornecedores/:id - Obter fornecedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar fornecedor:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    
    res.json(data);
  } catch (e: any) {
    console.error('Erro ao buscar fornecedor:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /fornecedores - Criar novo fornecedor
router.post('/', async (req, res) => {
  try {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const payload: any = {
      nome: parse.data.nome,
      cnpj: parse.data.cnpj || null,
      telefone: parse.data.telefone || null,
      email: parse.data.email || null,
      endereco: parse.data.endereco || null,
      cidade: parse.data.cidade || null,
      estado: parse.data.estado || null,
      cep: parse.data.cep || null,
      observacoes: parse.data.observacoes || null,
      ativo: parse.data.ativo !== false,
    };

    const { data, error } = await supabase
      .from('fornecedores')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (e: any) {
    console.error('Erro ao criar fornecedor:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /fornecedores/:id - Atualizar fornecedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = updateSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const updateData: any = {};
    if (parse.data.nome !== undefined) updateData.nome = parse.data.nome;
    if (parse.data.cnpj !== undefined) updateData.cnpj = parse.data.cnpj || null;
    if (parse.data.telefone !== undefined) updateData.telefone = parse.data.telefone || null;
    if (parse.data.email !== undefined) updateData.email = parse.data.email || null;
    if (parse.data.endereco !== undefined) updateData.endereco = parse.data.endereco || null;
    if (parse.data.cidade !== undefined) updateData.cidade = parse.data.cidade || null;
    if (parse.data.estado !== undefined) updateData.estado = parse.data.estado || null;
    if (parse.data.cep !== undefined) updateData.cep = parse.data.cep || null;
    if (parse.data.observacoes !== undefined) updateData.observacoes = parse.data.observacoes || null;
    if (parse.data.ativo !== undefined) updateData.ativo = parse.data.ativo;

    const { data, error } = await supabase
      .from('fornecedores')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    
    res.json(data);
  } catch (e: any) {
    console.error('Erro ao atualizar fornecedor:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /fornecedores/:id - Excluir fornecedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir fornecedor:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(204).send();
  } catch (e: any) {
    console.error('Erro ao excluir fornecedor:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});





