import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema de validação para adicionar à fila
const adicionarFilaSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente inválido'),
  tipo_atendimento: z.enum([
    'CONSULTA_COMPLETA',
    'REFRACAO',
    'RETORNO',
    'EXAME_LENTE_CONTATO',
  ]),
  prioridade: z.enum(['NORMAL', 'ALTA', 'URGENTE']).optional().default('NORMAL'),
  sintomas: z.string().optional(),
  usa_medicamentos: z.boolean().optional().default(false),
  medicamentos_lista: z.string().optional(),
  valor_consulta: z.number().optional(),
  forma_pagamento: z.enum([
    'DINHEIRO',
    'CARTAO_CREDITO',
    'CARTAO_DEBITO',
    'PIX',
    'CONVENIO',
    'PENDENTE',
  ]).optional().default('PENDENTE'),
  observacoes: z.string().optional(),
  cadastrado_por_id: z.string().uuid().optional(),
});

// Schema para atualizar status da fila
const atualizarStatusSchema = z.object({
  status: z.enum(['AGUARDANDO', 'EM_ATENDIMENTO', 'ATENDIDO', 'CANCELADO']).optional(),
  prioridade: z.enum(['NORMAL', 'ALTA', 'URGENTE']).optional(),
  optometrista_id: z.string().uuid().optional(),
  hora_chamada: z.string().optional(),
  hora_inicio_atendimento: z.string().optional(),
  hora_fim_atendimento: z.string().optional(),
  observacoes: z.string().optional(),
});

// Schema para atualizar posição
const atualizarPosicaoSchema = z.object({
  nova_posicao: z.number().int().min(1),
});

// GET /fila - Listar todos na fila (apenas ativos e aguardando/em atendimento)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('fila_atendimento')
      .select('*')
      .eq('ativo', true)
      .order('posicao', { ascending: true });

    // Filtrar por status se fornecido
    if (status && typeof status === 'string') {
      query = query.eq('status', status.toUpperCase());
    } else {
      // Por padrão, mostrar apenas quem está aguardando ou em atendimento
      query = query.in('status', ['AGUARDANDO', 'EM_ATENDIMENTO']);
    }

    const { data: filaData, error: filaError } = await query;

    if (filaError) {
      console.error('Erro ao buscar fila:', filaError);
      return res.status(500).json({ error: filaError.message });
    }

    // Buscar dados dos pacientes separadamente
    const filaComPacientes = await Promise.all(
      (filaData || []).map(async (item) => {
        const { data: paciente } = await supabase
          .from('pacientes')
          .select('id, nome_completo, cpf, data_nascimento, telefone, email, convenio')
          .eq('id', item.paciente_id)
          .single();

        return {
          ...item,
          pacientes: paciente || { 
            id: item.paciente_id, 
            nome_completo: 'Paciente não encontrado',
            cpf: null,
            data_nascimento: null,
            telefone: null,
            email: null,
            convenio: null
          }
        };
      })
    );

    res.json(filaComPacientes);
  } catch (error: any) {
    console.error('Erro no endpoint GET /fila:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /fila/:id - Obter uma entrada específica da fila
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('fila_atendimento')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar entrada da fila:', error);
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    // Buscar paciente separadamente
    const { data: paciente } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', data.paciente_id)
      .single();

    res.json({
      ...data,
      pacientes: paciente
    });
  } catch (error: any) {
    console.error('Erro no endpoint GET /fila/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /fila - Adicionar paciente à fila
router.post('/', async (req, res) => {
  try {
    const parse = adicionarFilaSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    // Verificar se o paciente já está na fila ativa
    const { data: existente } = await supabase
      .from('fila_atendimento')
      .select('id')
      .eq('paciente_id', parse.data.paciente_id)
      .eq('ativo', true)
      .in('status', ['AGUARDANDO', 'EM_ATENDIMENTO'])
      .single();

    if (existente) {
      return res.status(400).json({ 
        error: 'Paciente já está na fila de atendimento' 
      });
    }

    // Obter a próxima posição na fila
    const { data: ultimaPosicao } = await supabase
      .from('fila_atendimento')
      .select('posicao')
      .eq('ativo', true)
      .order('posicao', { ascending: false })
      .limit(1)
      .single();

    const novaPosicao = ultimaPosicao ? ultimaPosicao.posicao + 1 : 1;

    // Inserir na fila
    const { data, error } = await supabase
      .from('fila_atendimento')
      .insert({
        ...parse.data,
        posicao: novaPosicao,
        status: 'AGUARDANDO',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao adicionar à fila:', error);
      return res.status(500).json({ error: error.message });
    }

    // Buscar dados do paciente
    const { data: paciente } = await supabase
      .from('pacientes')
      .select('id, nome_completo, cpf, data_nascimento, telefone')
      .eq('id', data.paciente_id)
      .single();

    const resultado = {
      ...data,
      pacientes: paciente
    };

    console.log('Paciente adicionado à fila:', resultado);
    res.status(201).json(resultado);
  } catch (error: any) {
    console.error('Erro no endpoint POST /fila:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /fila/:id - Atualizar entrada da fila (status, optometrista, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = atualizarStatusSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('fila_atendimento')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar fila:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /fila/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /fila/:id/posicao - Alterar posição na fila
router.put('/:id/posicao', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = atualizarPosicaoSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { nova_posicao } = parse.data;

    // Obter posição atual
    const { data: atual, error: erroAtual } = await supabase
      .from('fila_atendimento')
      .select('posicao')
      .eq('id', id)
      .single();

    if (erroAtual || !atual) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    const posicaoAtual = atual.posicao;

    // Se mover para cima (diminuir posição)
    if (nova_posicao < posicaoAtual) {
      // Incrementar posição de todos entre nova_posicao e posicaoAtual-1
      await supabase
        .from('fila_atendimento')
        .update({ posicao: supabase.sql`posicao + 1` })
        .gte('posicao', nova_posicao)
        .lt('posicao', posicaoAtual);
    }
    // Se mover para baixo (aumentar posição)
    else if (nova_posicao > posicaoAtual) {
      // Decrementar posição de todos entre posicaoAtual+1 e nova_posicao
      await supabase
        .from('fila_atendimento')
        .update({ posicao: supabase.sql`posicao - 1` })
        .gt('posicao', posicaoAtual)
        .lte('posicao', nova_posicao);
    }

    // Atualizar posição do registro específico
    const { data, error } = await supabase
      .from('fila_atendimento')
      .update({ posicao: nova_posicao })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar posição:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /fila/:id/posicao:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /fila/:id - Remover da fila (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('fila_atendimento')
      .update({ ativo: false, status: 'CANCELADO' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao remover da fila:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Removido da fila com sucesso', data });
  } catch (error: any) {
    console.error('Erro no endpoint DELETE /fila/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /fila/:id/chamar - Chamar paciente (atualiza status para EM_ATENDIMENTO)
router.post('/:id/chamar', async (req, res) => {
  try {
    const { id } = req.params;
    const { optometrista_id } = req.body;

    const { data, error } = await supabase
      .from('fila_atendimento')
      .update({
        status: 'EM_ATENDIMENTO',
        hora_chamada: new Date().toISOString(),
        hora_inicio_atendimento: new Date().toISOString(),
        optometrista_id,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao chamar paciente:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /fila/:id/chamar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /fila/:id/finalizar - Finalizar atendimento
router.post('/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('fila_atendimento')
      .update({
        status: 'ATENDIDO',
        hora_fim_atendimento: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao finalizar atendimento:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /fila/:id/finalizar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

