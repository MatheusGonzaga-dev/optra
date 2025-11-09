import { Router } from 'express';
import { supabase } from '../supabase.js';

export const router = Router();

// GET /dashboard/stats - Buscar estatísticas do dashboard administrativo
router.get('/stats', async (_req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeISO = hoje.toISOString();
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    const inicioMesISO = inicioMes.toISOString();
    
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999);
    const fimMesISO = fimMes.toISOString();

    const mesAnteriorInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    mesAnteriorInicio.setHours(0, 0, 0, 0);
    const mesAnteriorInicioISO = mesAnteriorInicio.toISOString();
    
    const mesAnteriorFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    mesAnteriorFim.setHours(23, 59, 59, 999);
    const mesAnteriorFimISO = mesAnteriorFim.toISOString();

    // 1. Total de pacientes ativos
    const { count: totalPacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .is('deletado_em', null);

    if (pacientesError) throw pacientesError;

    // Total de pacientes no mês anterior
    const { count: totalPacientesMesAnterior, error: pacientesAnteriorError } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .is('deletado_em', null)
      .lte('criado_em', mesAnteriorFimISO);

    if (pacientesAnteriorError) throw pacientesAnteriorError;

    const variacaoPacientes = totalPacientesMesAnterior 
      ? Math.round(((totalPacientes! - totalPacientesMesAnterior) / totalPacientesMesAnterior) * 100)
      : 0;

    // 2. Consultas hoje (agendamentos do dia)
    const { data: agendamentosHoje, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('*')
      .gte('data_hora', hojeISO)
      .lt('data_hora', new Date(hoje.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (agendamentosError) throw agendamentosError;

    const totalAgendamentosHoje = agendamentosHoje?.length || 0;
    const emAndamentoHoje = agendamentosHoje?.filter(a => a.status === 'CONFIRMADO' || a.status === 'EM_ANDAMENTO').length || 0;

    // Agendamentos do mesmo dia no mês anterior (para comparação)
    const diaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    const diaMesAnteriorISO = diaMesAnterior.toISOString();
    const diaMesAnteriorFimISO = new Date(diaMesAnterior.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { count: agendamentosMesAnterior, error: agendamentosAnteriorError } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .gte('data_hora', diaMesAnteriorISO)
      .lt('data_hora', diaMesAnteriorFimISO);

    if (agendamentosAnteriorError) throw agendamentosAnteriorError;

    const variacaoAgendamentos = agendamentosMesAnterior 
      ? Math.round(((totalAgendamentosHoje - agendamentosMesAnterior) / agendamentosMesAnterior) * 100)
      : 0;

    // 3. Faturamento do mês (contas a receber do mês atual)
    const { data: contasReceberMes, error: contasReceberError } = await supabase
      .from('contas_receber')
      .select('valor_original, valor_recebido')
      .gte('data_vencimento', inicioMesISO)
      .lte('data_vencimento', fimMesISO)
      .is('deletado_em', null);

    if (contasReceberError) throw contasReceberError;

    // Usar valor_recebido se já foi pago, senão usar valor_original
    const faturamentoMes = contasReceberMes?.reduce((sum, conta) => {
      const valor = Number(conta.valor_recebido) > 0 ? Number(conta.valor_recebido) : Number(conta.valor_original || 0);
      return sum + valor;
    }, 0) || 0;

    // Faturamento do mês anterior
    const { data: contasReceberMesAnterior, error: contasReceberAnteriorError } = await supabase
      .from('contas_receber')
      .select('valor_original, valor_recebido')
      .gte('data_vencimento', mesAnteriorInicioISO)
      .lte('data_vencimento', mesAnteriorFimISO)
      .is('deletado_em', null);

    if (contasReceberAnteriorError) throw contasReceberAnteriorError;

    const faturamentoMesAnterior = contasReceberMesAnterior?.reduce((sum, conta) => {
      const valor = Number(conta.valor_recebido) > 0 ? Number(conta.valor_recebido) : Number(conta.valor_original || 0);
      return sum + valor;
    }, 0) || 0;
    const variacaoFaturamento = faturamentoMesAnterior 
      ? Math.round(((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100)
      : 0;

    // 4. Taxa de conclusão (últimos 30 dias)
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    trintaDiasAtras.setHours(0, 0, 0, 0);
    const trintaDiasAtrasISO = trintaDiasAtras.toISOString();

    const { data: atendimentos30Dias, error: atendimentosError } = await supabase
      .from('fila_atendimento')
      .select('status')
      .gte('hora_chegada', trintaDiasAtrasISO)
      .eq('ativo', true);

    if (atendimentosError) throw atendimentosError;

    const totalAtendimentos30Dias = atendimentos30Dias?.length || 0;
    const atendimentosConcluidos = atendimentos30Dias?.filter(a => a.status === 'ATENDIDO').length || 0;
    const taxaConclusao = totalAtendimentos30Dias > 0 
      ? Math.round((atendimentosConcluidos / totalAtendimentos30Dias) * 100)
      : 0;

    // Taxa de conclusão dos 30 dias anteriores (para comparação)
    const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
    sessentaDiasAtras.setHours(0, 0, 0, 0);
    const sessentaDiasAtrasISO = sessentaDiasAtras.toISOString();

    const { data: atendimentos60Dias, error: atendimentos60Error } = await supabase
      .from('fila_atendimento')
      .select('status')
      .gte('hora_chegada', sessentaDiasAtrasISO)
      .lt('hora_chegada', trintaDiasAtrasISO)
      .eq('ativo', true);

    if (atendimentos60Error) throw atendimentos60Error;

    const totalAtendimentos60Dias = atendimentos60Dias?.length || 0;
    const atendimentosConcluidos60Dias = atendimentos60Dias?.filter(a => a.status === 'ATENDIDO').length || 0;
    const taxaConclusaoAnterior = totalAtendimentos60Dias > 0 
      ? Math.round((atendimentosConcluidos60Dias / totalAtendimentos60Dias) * 100)
      : 0;

    const variacaoTaxaConclusao = taxaConclusaoAnterior 
      ? taxaConclusao - taxaConclusaoAnterior
      : 0;

    // 5. Atendimentos recentes (últimos 10 da fila)
    const { data: atendimentosRecentes, error: atendimentosRecentesError } = await supabase
      .from('fila_atendimento')
      .select('*')
      .eq('ativo', true)
      .in('status', ['AGUARDANDO', 'EM_ATENDIMENTO', 'ATENDIDO'])
      .order('hora_chegada', { ascending: false })
      .limit(10);

    if (atendimentosRecentesError) throw atendimentosRecentesError;

    // Buscar dados dos pacientes e profissionais separadamente
    const pacienteIds = [...new Set((atendimentosRecentes || []).map((a: any) => a.paciente_id).filter(Boolean))];
    const profissionalIds = [...new Set((atendimentosRecentes || []).map((a: any) => a.optometrista_id).filter(Boolean))];

    let pacientesMap = new Map();
    let profissionaisMap = new Map();

    if (pacienteIds.length > 0) {
      const { data: pacientes, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id, nome_completo')
        .in('id', pacienteIds);

      if (pacientesError) throw pacientesError;
      pacientesMap = new Map((pacientes || []).map((p: any) => [p.id, p.nome_completo]));
    }

    if (profissionalIds.length > 0) {
      const { data: profissionais, error: profissionaisError } = await supabase
        .from('usuarios')
        .select('id, nome_completo')
        .in('id', profissionalIds);

      if (profissionaisError) throw profissionaisError;
      profissionaisMap = new Map((profissionais || []).map((u: any) => [u.id, u.nome_completo]));
    }

    const atendimentosFormatados = (atendimentosRecentes || []).map((atendimento: any) => {
      const hora = new Date(atendimento.hora_chegada);
      const horaFormatada = hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      let status = 'waiting';
      if (atendimento.status === 'ATENDIDO') status = 'completed';
      else if (atendimento.status === 'EM_ATENDIMENTO') status = 'in-progress';

      const pacienteNome = pacientesMap.get(atendimento.paciente_id) || 'Paciente';
      const profissionalNome = profissionaisMap.get(atendimento.optometrista_id) || 'Profissional';

      return {
        patient: pacienteNome,
        time: horaFormatada,
        status: status,
        doctor: profissionalNome,
      };
    });

    // Formatar valores
    const formatarMoeda = (valor: number) => {
      if (valor >= 1000) {
        return `R$ ${(valor / 1000).toFixed(1)}k`;
      }
      return `R$ ${valor.toFixed(2)}`;
    };

    res.json({
      stats: {
        pacientesAtivos: {
          value: totalPacientes?.toLocaleString('pt-BR') || '0',
          description: 'Total cadastrado',
          trend: {
            value: `${Math.abs(variacaoPacientes)}%`,
            positive: variacaoPacientes >= 0,
          },
        },
        consultasHoje: {
          value: totalAgendamentosHoje.toString(),
          description: `${emAndamentoHoje} em andamento`,
          trend: {
            value: `${Math.abs(variacaoAgendamentos)}%`,
            positive: variacaoAgendamentos >= 0,
          },
        },
        faturamentoMes: {
          value: formatarMoeda(faturamentoMes),
          description: `${hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          trend: {
            value: `${Math.abs(variacaoFaturamento)}%`,
            positive: variacaoFaturamento >= 0,
          },
        },
        taxaConclusao: {
          value: `${taxaConclusao}%`,
          description: 'Últimos 30 dias',
          trend: {
            value: `${Math.abs(variacaoTaxaConclusao)}%`,
            positive: variacaoTaxaConclusao >= 0,
          },
        },
      },
      recentAppointments: atendimentosFormatados,
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar estatísticas' });
  }
});

