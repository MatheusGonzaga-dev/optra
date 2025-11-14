import { Router } from 'express';
import { supabase } from '../supabase.js';

export const router = Router();

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      email,
      senha,
      perfil,
      telefone,
      crm,
      estado_crm,
      cpf,
      rg,
      data_nascimento,
      estado_civil,
      endereco,
      cep,
      cidade,
      estado,
      data_admissao,
      cargo,
      salario,
      grupo_acesso_id,
    } = req.body;

    // Validação básica
    if (!nome_completo || !email || !senha || !grupo_acesso_id) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: nome_completo, email, senha, grupo_acesso_id' 
      });
    }

    // Mapear grupo_acesso_id para grupo_id (nome da coluna no banco)
    const grupo_id = grupo_acesso_id;

    // Validar perfil se fornecido
    if (perfil) {
      const perfisValidos = ['ADMINISTRADOR', 'SECRETARIA', 'OPTOMETRISTA'];
      if (!perfisValidos.includes(perfil)) {
        return res.status(400).json({ 
          error: 'Perfil inválido. Use: ADMINISTRADOR, SECRETARIA ou OPTOMETRISTA' 
        });
      }
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email já cadastrado no sistema' 
      });
    }

    // Criar usuário no Supabase Auth usando service role key
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Auto confirmar email
      user_metadata: {
        nome_completo,
        ...(perfil && { perfil })
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError);
      return res.status(500).json({ 
        error: 'Erro ao criar usuário na autenticação',
        details: authError.message 
      });
    }

    // Inserir dados na tabela usuarios
    const insertData: any = {
      id: authData.user.id,
      nome_completo,
      email,
      senha_hash: '', // A senha é gerenciada pelo Supabase Auth
      telefone: telefone || null,
      cpf: cpf || null,
      rg: rg || null,
      data_nascimento: data_nascimento || null,
      estado_civil: estado_civil || null,
      endereco: endereco || null,
      cep: cep || null,
      cidade: cidade || null,
      estado: estado || null,
      data_admissao: data_admissao || null,
      cargo: cargo || null,
      salario: salario !== undefined && salario !== null ? Number(salario) : null,
      crm: crm || null,
      estado_crm: estado_crm || null,
      ativo: true,
      grupo_id: grupo_id,
    };

    // Adicionar perfil apenas se fornecido
    if (perfil) {
      insertData.perfil = perfil;
    }

    const { data: usuarioData, error: dbError } = await supabase
      .from('usuarios')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao inserir na tabela usuarios:', dbError);
      // Tentar limpar o usuário criado no Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ 
        error: 'Erro ao salvar dados do usuário',
        details: dbError.message 
      });
    }

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioData
    });

  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Listar todos os usuários
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('ativo', true)
      .is('deletado_em', null)
      .order('nome_completo');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar usuários',
        details: error.message 
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Obter usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        details: error.message 
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      email,
      perfil,
      telefone,
      crm,
      estado_crm,
      ativo,
      grupo_acesso_id,
      cpf,
      rg,
      data_nascimento,
      estado_civil,
      endereco,
      cep,
      cidade,
      estado,
      data_admissao,
      cargo,
      salario,
    } = req.body;

    const updateData: any = {};
    if (nome_completo) updateData.nome_completo = nome_completo;
    if (email) updateData.email = email;
    if (perfil) updateData.perfil = perfil;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (crm !== undefined) updateData.crm = crm;
    if (estado_crm !== undefined) updateData.estado_crm = estado_crm;
    if (ativo !== undefined) updateData.ativo = ativo;
    if (grupo_acesso_id !== undefined) updateData.grupo_id = grupo_acesso_id || null;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (rg !== undefined) updateData.rg = rg;
    if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento;
    if (estado_civil !== undefined) updateData.estado_civil = estado_civil;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (cep !== undefined) updateData.cep = cep;
    if (cidade !== undefined) updateData.cidade = cidade;
    if (estado !== undefined) updateData.estado = estado;
    if (data_admissao !== undefined) updateData.data_admissao = data_admissao;
    if (cargo !== undefined) updateData.cargo = cargo;
    if (salario !== undefined) updateData.salario = salario !== null ? Number(salario) : null;
    
    updateData.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar usuário',
        details: error.message 
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Desativar/deletar usuário (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        ativo: false,
        deletado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao desativar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao desativar usuário',
        details: error.message 
      });
    }

    // Também remover do Auth (opcional)
    await supabase.auth.admin.deleteUser(id);

    return res.json({ 
      message: 'Usuário desativado com sucesso',
      usuario: data 
    });
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

