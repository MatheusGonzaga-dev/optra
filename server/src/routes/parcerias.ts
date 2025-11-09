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

router.get('/relatorio', async (_req, res) => {
  try {
    const { data: parcerias, error: parceriasError } = await supabase
      .from('parcerias')
      .select('id, nome, cnpj_cpf, telefone, data_parceria')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (parceriasError) throw parceriasError;

    const { data: ordensServico, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('id, parceria_id, paciente_id, descricao_servico, total, criado_em, fila_id')
      .not('parceria_id', 'is', null);

    if (ordensError) throw ordensError;

    const ordens = (ordensServico || []).filter((os) => os.parceria_id);

    const pacienteIds = Array.from(new Set(ordens.map((o) => o.paciente_id).filter(Boolean)));
    let pacientesMap = new Map<string, { nome_completo: string }>();

    if (pacienteIds.length > 0) {
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id, nome_completo')
        .in('id', pacienteIds);

      if (pacientesError) throw pacientesError;

      pacientesMap = new Map((pacientesData || []).map((p) => [p.id, p]));
    }

    const filaIds = Array.from(new Set(ordens.map((o) => o.fila_id).filter(Boolean)));
    let filasMap = new Map<string, { optometrista_id: string | null; tipo_atendimento: string | null; status: string | null; hora_inicio_atendimento: string | null; hora_fim_atendimento: string | null }>();
    let profissionaisMap = new Map<string, { nome_completo: string }>();

    if (filaIds.length > 0) {
      const { data: filasData, error: filasError } = await supabase
        .from('fila_atendimento')
        .select('id, optometrista_id, tipo_atendimento, status, hora_inicio_atendimento, hora_fim_atendimento')
        .in('id', filaIds);

      if (filasError) throw filasError;

      filasMap = new Map((filasData || []).map((f) => [f.id, f]));

      const profissionalIds = Array.from(new Set((filasData || []).map((f) => f.optometrista_id).filter(Boolean)));

      if (profissionalIds.length > 0) {
        const { data: profissionaisData, error: profissionaisError } = await supabase
          .from('usuarios')
          .select('id, nome_completo')
          .in('id', profissionalIds as string[]);

        if (profissionaisError) throw profissionaisError;

        profissionaisMap = new Map((profissionaisData || []).map((u) => [u.id, u]));
      }
    }

    const parceriasResumo = (parcerias || []).map((parceria) => {
      const ordensParceria = ordens
        .filter((o) => o.parceria_id === parceria.id)
        .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

      const totalAtendimentos = ordensParceria.length;
      const totalReceita = ordensParceria.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const ticketMedio = totalAtendimentos > 0 ? totalReceita / totalAtendimentos : 0;
      const ultimoAtendimento = ordensParceria[0]?.criado_em ?? null;

      const atendimentosRecentes = ordensParceria.slice(0, 5).map((o) => {
        const pacienteNome = o.paciente_id ? pacientesMap.get(o.paciente_id)?.nome_completo || 'Paciente' : 'Paciente';
        const filaInfo = o.fila_id ? filasMap.get(o.fila_id) : null;
        const profissionalNome = filaInfo?.optometrista_id ? profissionaisMap.get(filaInfo.optometrista_id)?.nome_completo || 'Profissional' : null;

        return {
          id: o.id,
          data: o.criado_em,
          total: Number(o.total || 0),
          servico: o.descricao_servico,
          paciente: pacienteNome,
          profissional: profissionalNome,
          tipo_atendimento: filaInfo?.tipo_atendimento || null,
          status: filaInfo?.status || null,
        };
      });

      return {
        id: parceria.id,
        nome: parceria.nome,
        cnpj_cpf: parceria.cnpj_cpf,
        telefone: parceria.telefone,
        data_parceria: parceria.data_parceria,
        totalAtendimentos,
        totalReceita,
        ticketMedio,
        ultimoAtendimento,
        atendimentosRecentes,
      };
    });

    const totalAtendimentos = parceriasResumo.reduce((sum, item) => sum + item.totalAtendimentos, 0);
    const totalReceita = parceriasResumo.reduce((sum, item) => sum + item.totalReceita, 0);

    res.json({
      resumo: {
        totalParceriasAtivas: parceriasResumo.length,
        totalAtendimentos,
        totalReceita,
      },
      parcerias: parceriasResumo,
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de parcerias:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de parcerias' });
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

