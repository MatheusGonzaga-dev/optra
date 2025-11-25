import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

export const router = Router();

// Schema de validação
const consultorioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

// GET /consultorios - Listar todos os consultórios ativos com informações de uso
router.get('/', async (_req, res) => {
  try {
    const { data: consultorios, error } = await supabase
      .from('consultorios')
      .select('*')
      .eq('ativo', true)
      .is('deletado_em', null)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar consultórios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Para cada consultório, verificar se há alguém usando
    const consultoriosComUso = await Promise.all(
      (consultorios || []).map(async (consultorio) => {
        // Buscar sessão ativa para este consultório
        const { data: sessaoAtiva, error: sessaoError } = await supabase
          .from('consultorio_sessoes')
          .select(`
            *,
            usuarios (
              id,
              nome_completo
            )
          `)
          .eq('consultorio_id', consultorio.id)
          .eq('ativo', true)
          .is('fim_sessao', null)
          .order('inicio_sessao', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessaoError && sessaoError.code !== 'PGRST116') {
          console.error(`Erro ao buscar sessão ativa para consultório ${consultorio.nome}:`, sessaoError);
        }

        // Debug: verificar o que está sendo retornado
        if (sessaoAtiva) {
          console.log(`✅ Consultório ${consultorio.nome} está em uso. Sessão completa:`, JSON.stringify(sessaoAtiva, null, 2));
        }

        // A estrutura do Supabase pode retornar usuarios como array ou objeto
        // Vamos verificar todas as possibilidades
        let usuarioData = null;
        let profissionalNome = null;
        let profissionalId = null;

        if (sessaoAtiva) {
          // Tentar diferentes formas de acessar os dados do usuário
          if (Array.isArray(sessaoAtiva.usuarios)) {
            usuarioData = sessaoAtiva.usuarios[0];
          } else if (sessaoAtiva.usuarios) {
            usuarioData = sessaoAtiva.usuarios;
          }

          profissionalNome = usuarioData?.nome_completo || null;
          profissionalId = usuarioData?.id || sessaoAtiva.usuario_id || null;

          // Se ainda não encontrou o nome, buscar diretamente do banco
          if (!profissionalNome && sessaoAtiva.usuario_id) {
            const { data: usuarioInfo } = await supabase
              .from('usuarios')
              .select('id, nome_completo')
              .eq('id', sessaoAtiva.usuario_id)
              .single();
            
            if (usuarioInfo) {
              profissionalNome = usuarioInfo.nome_completo;
              profissionalId = usuarioInfo.id;
            }
          }

          console.log(`📋 Dados finais para ${consultorio.nome}:`, {
            em_uso: true,
            profissional_nome: profissionalNome,
            profissional_id: profissionalId
          });
        }

        return {
          ...consultorio,
          em_uso: !!sessaoAtiva,
          profissional_nome: profissionalNome,
          profissional_id: profissionalId,
        };
      })
    );

    res.json(consultoriosComUso || []);
  } catch (error: any) {
    console.error('Erro no endpoint GET /consultorios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /consultorios/:id - Obter um consultório específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('consultorios')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .is('deletado_em', null)
      .single();

    if (error) {
      console.error('Erro ao buscar consultório:', error);
      return res.status(404).json({ error: 'Consultório não encontrado' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint GET /consultorios/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /consultorios - Criar novo consultório
router.post('/', async (req, res) => {
  try {
    const parse = consultorioSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('consultorios')
      .insert({
        ...parse.data,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar consultório:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /consultorios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /consultorios/:id - Atualizar consultório
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parse = consultorioSchema.partial().safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({ error: parse.error.format() });
    }

    const { data, error } = await supabase
      .from('consultorios')
      .update({
        ...parse.data,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar consultório:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint PUT /consultorios/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /consultorios/:id - Excluir consultório (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('consultorios')
      .update({
        ativo: false,
        deletado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao excluir consultório:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Consultório excluído com sucesso', data });
  } catch (error: any) {
    console.error('Erro no endpoint DELETE /consultorios/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /consultorios/sessao/ativa/:usuarioId - Obter sessão ativa do usuário
router.get('/sessao/ativa/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const { data, error } = await supabase
      .from('consultorio_sessoes')
      .select(`
        *,
        consultorios (*)
      `)
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)
      .is('fim_sessao', null)
      .order('inicio_sessao', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar sessão ativa:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Erro no endpoint GET /consultorios/sessao/ativa/:usuarioId:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /consultorios/sessao/iniciar - Iniciar sessão em um consultório
router.post('/sessao/iniciar', async (req, res) => {
  try {
    const { usuario_id, consultorio_id } = req.body;

    if (!usuario_id || !consultorio_id) {
      return res.status(400).json({ error: 'usuario_id e consultorio_id são obrigatórios' });
    }

    console.log(`🔄 Iniciando sessão - usuario_id: ${usuario_id}, consultorio_id: ${consultorio_id}`);

    // Finalizar sessões ativas anteriores do usuário
    const { data: finalizadas, error: finalizarError } = await supabase
      .from('consultorio_sessoes')
      .update({
        ativo: false,
        fim_sessao: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('usuario_id', usuario_id)
      .eq('ativo', true)
      .is('fim_sessao', null)
      .select();

    if (finalizarError) {
      console.error('⚠️ Erro ao finalizar sessões anteriores:', finalizarError);
    } else {
      console.log(`✅ Sessões anteriores finalizadas: ${finalizadas?.length || 0}`);
    }

    // Criar nova sessão
    const { data, error } = await supabase
      .from('consultorio_sessoes')
      .insert({
        usuario_id,
        consultorio_id,
        inicio_sessao: new Date().toISOString(),
        ativo: true,
      })
      .select(`
        *,
        consultorios (*)
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao iniciar sessão:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Sessão criada com sucesso:', {
      id: data.id,
      usuario_id: data.usuario_id,
      consultorio_id: data.consultorio_id,
      ativo: data.ativo,
      inicio_sessao: data.inicio_sessao
    });

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Erro no endpoint POST /consultorios/sessao/iniciar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /consultorios/sessao/finalizar/:usuarioId - Finalizar sessão ativa
router.post('/sessao/finalizar/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const { data, error } = await supabase
      .from('consultorio_sessoes')
      .update({
        ativo: false,
        fim_sessao: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)
      .is('fim_sessao', null)
      .select()
      .single();

    if (error) {
      // Se não encontrar sessão ativa, não é erro crítico
      if (error.code === 'PGRST116') {
        return res.json({ message: 'Nenhuma sessão ativa encontrada' });
      }
      console.error('Erro ao finalizar sessão:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Sessão finalizada com sucesso', data });
  } catch (error: any) {
    console.error('Erro no endpoint POST /consultorios/sessao/finalizar/:usuarioId:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

