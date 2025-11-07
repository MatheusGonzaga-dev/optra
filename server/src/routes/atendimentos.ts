import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schemas
const prontuarioSchema = z.object({
  prescription: z.any(), // armazena JSON com a prescrição
  observations: z.string().optional(),
  recommendations: z.string().optional(),
  returnDate: z.string().optional(), // ISO
});

const ordemServicoSchema = z.object({
  serviceName: z.string().min(1),
  basePrice: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  addition: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  parceria_id: z.string().uuid().optional().nullable(),
  createReceivable: z.boolean().optional().default(false),
});

async function getFila(id: string) {
  const { data, error } = await supabase
    .from('fila_atendimento')
    .select('id, paciente_id, optometrista_id')
    .eq('id', id)
    .single();
  if (error || !data) throw new Error('Fila não encontrada');
  return data;
}

// Salvar prontuário
router.post('/:filaId/prontuario', async (req, res) => {
  try {
    const { filaId } = req.params;
    const parse = prontuarioSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.format() });

    const fila = await getFila(filaId);

    const { data, error } = await supabase
      .from('prontuarios')
      .insert({
        fila_id: fila.id,
        paciente_id: fila.paciente_id,
        optometrista_id: fila.optometrista_id,
        prescricao_json: parse.data.prescription,
        observacoes: parse.data.observations ?? null,
        recomendacoes: parse.data.recommendations ?? null,
        data_retorno: parse.data.returnDate ?? null,
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    console.error('Erro ao salvar prontuário:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar ordem de serviço
router.post('/:filaId/os', async (req, res) => {
  try {
    const { filaId } = req.params;
    const parse = ordemServicoSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.format() });

    const fila = await getFila(filaId);
    const payload: any = parse.data;
    const total = payload.total || Math.max(0, (payload.basePrice - payload.discount + payload.addition));

    const insertPayload: any = {
      fila_id: fila.id,
      paciente_id: fila.paciente_id,
      descricao_servico: payload.serviceName,
      valor_base: payload.basePrice,
      desconto: payload.discount,
      acrescimo: payload.addition,
      total,
    };

    if (payload.parceria_id) {
      insertPayload.parceria_id = payload.parceria_id;
    }

    const { data, error } = await supabase
      .from('ordens_servico')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    // Se createReceivable estiver true, criar conta a receber automaticamente
    if (payload.createReceivable && total > 0) {
      const dataHoje = new Date().toISOString().split('T')[0];
      
      const contaReceberPayload = {
        paciente_id: fila.paciente_id,
        descricao: `Atendimento - ${payload.serviceName} (Prontuário)`,
        valor_original: total,
        valor_recebido: 0,
        valor_desconto: 0,
        valor_juros: 0,
        data_emissao: dataHoje,
        data_vencimento: dataHoje,
        status: 'PENDENTE',
        especie_documento: 'RECIBO',
        observacoes: `Título gerado automaticamente do atendimento. Fila ID: ${filaId}`,
      };

      const { error: contaError } = await supabase
        .from('contas_receber')
        .insert(contaReceberPayload);

      if (contaError) {
        console.error('Erro ao criar conta a receber:', contaError);
        // Não falha a OS, apenas loga o erro
      }
    }
    
    res.json(data);
  } catch (e: any) {
    console.error('Erro ao salvar OS:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /prontuarios - buscar prontuários por fila_id ou paciente_id
router.get('/prontuarios', async (req, res) => {
  try {
    const { fila_id, paciente_id } = req.query;
    let query = supabase.from('prontuarios').select('*');
    
    if (fila_id && typeof fila_id === 'string') {
      query = query.eq('fila_id', fila_id);
    }
    if (paciente_id && typeof paciente_id === 'string') {
      query = query.eq('paciente_id', paciente_id);
    }
    
    query = query.order('criado_em', { ascending: false });
    
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e: any) {
    console.error('Erro ao buscar prontuários:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /atendimentos/historico - lista atendimentos concluídos com dados essenciais
router.get('/historico', async (_req, res) => {
  try {
    // Buscar fila concluída
    const { data: filas, error } = await supabase
      .from('fila_atendimento')
      .select('*')
      .eq('status', 'ATENDIDO')
      .eq('ativo', true)
      .order('hora_fim_atendimento', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const resultado = await Promise.all((filas || []).map(async (f) => {
      const [{ data: paciente }, { data: profissional }] = await Promise.all([
        supabase.from('pacientes').select('id, nome_completo, cpf, telefone').eq('id', f.paciente_id).single(),
        supabase.from('usuarios').select('id, nome_completo').eq('id', f.optometrista_id).single(),
      ]);

      // Ordem de serviço (mais recente deste atendimento)
      const { data: os } = await supabase
        .from('ordens_servico')
        .select('id, total, criado_em')
        .eq('fila_id', f.id)
        .order('criado_em', { ascending: false })
        .limit(1)
        .single();

      return {
        id: f.id,
        paciente: paciente || { id: f.paciente_id, nome_completo: 'Paciente' },
        profissional: profissional || null,
        tipo_atendimento: f.tipo_atendimento,
        status: f.status,
        hora_inicio_atendimento: f.hora_inicio_atendimento,
        hora_fim_atendimento: f.hora_fim_atendimento,
        valor_consulta: f.valor_consulta,
        sintomas: f.sintomas,
        medicamentos_lista: f.medicamentos_lista,
        observacoes: f.observacoes,
        ordem_servico: os || null,
      };
    }));

    res.json(resultado);
  } catch (e: any) {
    console.error('Erro ao listar histórico:', e);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


