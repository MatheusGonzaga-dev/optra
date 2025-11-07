import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema base sem transformação
const baseSchema = z.object({
  paciente_id: z.string().uuid(),
  consulta_id: z.string().uuid().optional().nullable().or(z.literal('')),
  descricao: z.string().min(1),
  categoria_id: z.string().uuid().optional().nullable().or(z.literal('')),
  subcategoria_id: z.string().uuid().optional().nullable().or(z.literal('')),
  especie_documento: z.enum(['NOTA_FISCAL', 'RECIBO', 'FATURA', 'DUPLICATA', 'BOLETO', 'PIX', 'OUTROS']).optional().nullable(),
  numero_documento: z.string().optional().nullable().or(z.literal('')),
  valor_original: z.number().nonnegative(),
  valor_recebido: z.number().nonnegative().optional().default(0),
  valor_desconto: z.number().nonnegative().optional().default(0),
  valor_juros: z.number().nonnegative().optional().default(0),
  data_emissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  data_recebimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  forma_pagamento: z.enum(['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'TRANSFERENCIA']).optional().nullable(),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO']).default('PENDENTE'),
  observacoes: z.string().optional().nullable().or(z.literal('')),
});

// Função de transformação para limpar strings vazias
const transformEmptyStrings = (data: any) => {
  return {
    ...data,
    consulta_id: data.consulta_id === '' ? undefined : data.consulta_id,
    categoria_id: data.categoria_id === '' ? undefined : data.categoria_id,
    subcategoria_id: data.subcategoria_id === '' ? undefined : data.subcategoria_id,
    numero_documento: data.numero_documento === '' ? undefined : data.numero_documento,
    data_emissao: data.data_emissao === '' ? undefined : data.data_emissao,
    data_recebimento: data.data_recebimento === '' ? undefined : data.data_recebimento,
    observacoes: data.observacoes === '' ? undefined : data.observacoes,
  };
};

// Schema para criação com transformação
const createSchema = baseSchema.transform(transformEmptyStrings);

// Schema para atualização (parcial) com transformação
const updateSchema = baseSchema.partial().transform(transformEmptyStrings);

// GET /contas-receber - Listar todas as contas a receber
router.get('/', async (req, res) => {
  try {
    const { status, data_inicio, data_fim } = req.query;
    
    let query = supabase
      .from('contas_receber')
      .select('*')
      .is('deletado_em', null)
      .order('data_vencimento', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (data_inicio) {
      query = query.gte('data_vencimento', data_inicio);
    }

    if (data_fim) {
      query = query.lte('data_vencimento', data_fim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar contas a receber:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Erro no endpoint GET /contas-receber:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /contas-receber/proximo-numero - Buscar próximo número sequencial por espécie
router.get('/proximo-numero', async (req, res) => {
  try {
    const { especie_documento } = req.query;

    if (!especie_documento || typeof especie_documento !== 'string') {
      return res.status(400).json({ error: 'especie_documento é obrigatório' });
    }

    // Buscar TODOS os números de documentos para a espécie (incluindo deletados)
    // para garantir sequência contínua sem reutilizar números
    const { data, error } = await supabase
      .from('contas_receber')
      .select('numero_documento')
      .eq('especie_documento', especie_documento)
      .not('numero_documento', 'is', null);

    if (error) {
      console.error('Erro ao buscar próximo número:', error);
      return res.status(500).json({ error: error.message });
    }

    // Se não encontrar nenhum documento, começar do 1
    let proximoNumero = 1;
    
    if (data && data.length > 0) {
      // Ordenar os números em JavaScript e pegar o maior
      // Considera TODOS os registros (incluindo deletados) para manter sequência
      const numeros = data
        .map(item => {
          const num = parseInt(item.numero_documento || '0', 10);
          return isNaN(num) ? 0 : num;
        })
        .filter(num => num > 0)
        .sort((a, b) => b - a); // Ordenar em ordem decrescente
      
      if (numeros.length > 0) {
        proximoNumero = numeros[0] + 1;
      }
    }

    res.json({ proximo_numero: proximoNumero.toString() });
  } catch (error: any) {
    console.error('Erro no endpoint GET /contas-receber/proximo-numero:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /contas-receber/:id - Buscar uma conta específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .eq('id', id)
      .is('deletado_em', null)
      .single();

    if (error) {
      console.error('Erro ao buscar conta a receber:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint GET /contas-receber/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /contas-receber - Criar nova conta a receber
router.post('/', async (req, res) => {
  try {
    // Log do que está sendo recebido para debug
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const parse = createSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', JSON.stringify(parse.error.format(), null, 2));
      // Retornar mensagem de erro mais amigável
      const errors = parse.error.errors.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message
      }));
      return res.status(400).json({ 
        error: 'Erro de validação',
        detalhes: errors,
        formato_esperado: {
          paciente_id: 'UUID (obrigatório)',
          descricao: 'string (obrigatório)',
          valor_original: 'number >= 0 (obrigatório)',
          data_vencimento: 'string no formato YYYY-MM-DD (obrigatório)',
          consulta_id: 'UUID ou null (opcional)',
          categoria_id: 'UUID ou null (opcional)',
          subcategoria_id: 'UUID ou null (opcional)',
          especie_documento: 'enum ou null (opcional)',
          numero_documento: 'string ou null (opcional)',
          valor_recebido: 'number >= 0 (opcional, padrão: 0)',
          valor_desconto: 'number >= 0 (opcional, padrão: 0)',
          valor_juros: 'number >= 0 (opcional, padrão: 0)',
          data_emissao: 'string no formato YYYY-MM-DD (opcional)',
          data_recebimento: 'string no formato YYYY-MM-DD (opcional)',
          forma_pagamento: 'enum ou null (opcional)',
          status: 'enum (opcional, padrão: PENDENTE)',
          observacoes: 'string ou null (opcional)'
        }
      });
    }

    const payload: any = { ...parse.data };

    // Se especie_documento foi fornecido mas numero_documento não, gerar automaticamente
    if (payload.especie_documento && !payload.numero_documento) {
      // Buscar TODOS os números de documentos para a espécie (incluindo deletados)
      // para garantir sequência contínua sem reutilizar números
      const { data: numeroData, error: numeroError } = await supabase
        .from('contas_receber')
        .select('numero_documento')
        .eq('especie_documento', payload.especie_documento)
        .not('numero_documento', 'is', null);

      if (numeroError) {
        console.error('Erro ao buscar próximo número:', numeroError);
        // Continuar mesmo com erro, tentar inserir sem número
      } else {
        // Se não encontrar nenhum documento, começar do 1
        let proximoNumero = 1;
        
        if (numeroData && numeroData.length > 0) {
          // Ordenar os números em JavaScript e pegar o maior
          // Considera TODOS os registros (incluindo deletados) para manter sequência
          const numeros = numeroData
            .map(item => {
              const num = parseInt(item.numero_documento || '0', 10);
              return isNaN(num) ? 0 : num;
            })
            .filter(num => num > 0)
            .sort((a, b) => b - a); // Ordenar em ordem decrescente
          
          if (numeros.length > 0) {
            proximoNumero = numeros[0] + 1;
          }
        }
        payload.numero_documento = proximoNumero.toString();
      }
    }

    const { data, error } = await supabase
      .from('contas_receber')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar conta a receber:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /contas-receber:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /contas-receber/:id - Atualizar conta a receber
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = updateSchema.safeParse(req.body);

    if (!parse.success) {
      console.error('Erro de validação:', parse.error.format());
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('contas_receber')
      .update(parse.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar conta a receber:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /contas-receber/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /contas-receber/:id - Soft delete da conta a receber
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('contas_receber')
      .update({ deletado_em: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir conta a receber:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro no endpoint DELETE /contas-receber/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /contas-receber/:id/receber - Marcar como recebido
router.post('/:id/receber', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_recebido, data_recebimento } = req.body;

    const updateData: any = {
      status: 'PAGO',
      data_recebimento: data_recebimento || new Date().toISOString().split('T')[0],
    };

    if (valor_recebido !== undefined && valor_recebido !== null) {
      updateData.valor_recebido = valor_recebido;
    }

    const { data, error } = await supabase
      .from('contas_receber')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao marcar conta como recebida:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /contas-receber/:id/receber:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


