

-- Caso precise reaplicar, limpe as tabelas antes (opcional):
-- TRUNCATE TABLE public.grupo_permissoes RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.permissoes RESTART IDENTITY CASCADE;

INSERT INTO public.permissoes (codigo, nome, descricao, modulo)
VALUES
  -- Pacientes
  ('pacientes.view', 'Visualizar pacientes', 'Permite visualizar pacientes', 'Pacientes'),
  ('pacientes.create', 'Criar pacientes', 'Permite cadastrar novos pacientes', 'Pacientes'),
  ('pacientes.edit', 'Editar pacientes', 'Permite editar pacientes existentes', 'Pacientes'),
  ('pacientes.delete', 'Excluir pacientes', 'Permite remover pacientes', 'Pacientes'),

  -- Fila de atendimento
  ('fila.view', 'Visualizar fila de atendimento', 'Permite ver a fila de atendimento', 'Fila de Atendimento'),
  ('fila.manage', 'Gerenciar fila de atendimento', 'Permite movimentar pacientes na fila', 'Fila de Atendimento'),

  -- Atendimentos
  ('atendimentos.view', 'Visualizar atendimentos', 'Permite visualizar atendimentos e prontuários', 'Atendimentos'),
  ('atendimentos.create', 'Criar atendimentos', 'Permite criar novos prontuários', 'Atendimentos'),
  ('atendimentos.edit', 'Editar atendimentos', 'Permite editar prontuários existentes', 'Atendimentos'),

  -- Contas a pagar
  ('contas_pagar.view', 'Visualizar contas a pagar', 'Permite visualizar contas a pagar', 'Financeiro'),
  ('contas_pagar.create', 'Criar contas a pagar', 'Permite lançar novas despesas', 'Financeiro'),
  ('contas_pagar.edit', 'Editar contas a pagar', 'Permite editar lançamentos de despesas', 'Financeiro'),
  ('contas_pagar.delete', 'Excluir contas a pagar', 'Permite excluir despesas', 'Financeiro'),
  ('contas_pagar.pay', 'Efetuar pagamentos', 'Permite registrar pagamentos', 'Financeiro'),

  -- Contas a receber
  ('contas_receber.view', 'Visualizar contas a receber', 'Permite visualizar contas a receber', 'Financeiro'),
  ('contas_receber.create', 'Criar contas a receber', 'Permite lançar novas receitas', 'Financeiro'),
  ('contas_receber.edit', 'Editar contas a receber', 'Permite editar lançamentos de receitas', 'Financeiro'),
  ('contas_receber.delete', 'Excluir contas a receber', 'Permite excluir receitas', 'Financeiro'),
  ('contas_receber.receive', 'Receber pagamentos', 'Permite registrar recebimentos', 'Financeiro'),

  -- Serviços
  ('servicos.view', 'Visualizar serviços', 'Permite visualizar serviços', 'Serviços'),
  ('servicos.create', 'Criar serviços', 'Permite cadastrar serviços', 'Serviços'),
  ('servicos.edit', 'Editar serviços', 'Permite editar serviços', 'Serviços'),
  ('servicos.delete', 'Excluir serviços', 'Permite excluir serviços', 'Serviços'),

  -- Parcerias
  ('parcerias.view', 'Visualizar parcerias', 'Permite visualizar parcerias', 'Parcerias'),
  ('parcerias.create', 'Criar parcerias', 'Permite cadastrar parcerias', 'Parcerias'),
  ('parcerias.edit', 'Editar parcerias', 'Permite editar parcerias', 'Parcerias'),
  ('parcerias.delete', 'Excluir parcerias', 'Permite excluir parcerias', 'Parcerias'),

  -- Categorias
  ('categorias.view', 'Visualizar categorias', 'Permite visualizar categorias financeiras', 'Financeiro'),
  ('categorias.create', 'Criar categorias', 'Permite cadastrar categorias financeiras', 'Financeiro'),
  ('categorias.edit', 'Editar categorias', 'Permite editar categorias financeiras', 'Financeiro'),
  ('categorias.delete', 'Excluir categorias', 'Permite excluir categorias financeiras', 'Financeiro'),

  -- Relatórios
  ('relatorios.view', 'Visualizar relatórios', 'Permite acessar relatórios', 'Relatórios'),
  ('relatorios.export', 'Exportar relatórios', 'Permite exportar relatórios', 'Relatórios'),

  -- Usuários (acessos)
  ('usuarios.view', 'Visualizar usuários', 'Permite visualizar usuários', 'Acessos'),
  ('usuarios.create', 'Criar usuários', 'Permite cadastrar usuários', 'Acessos'),
  ('usuarios.edit', 'Editar usuários', 'Permite editar usuários', 'Acessos'),
  ('usuarios.delete', 'Excluir usuários', 'Permite excluir usuários', 'Acessos'),

  -- Grupos de acesso
  ('grupos.view', 'Visualizar grupos de acesso', 'Permite visualizar grupos de acesso', 'Acessos'),
  ('grupos.create', 'Criar grupos de acesso', 'Permite criar grupos de acesso', 'Acessos'),
  ('grupos.edit', 'Editar grupos de acesso', 'Permite editar grupos de acesso', 'Acessos'),
  ('grupos.delete', 'Excluir grupos de acesso', 'Permite excluir grupos de acesso', 'Acessos'),
  ('grupos.manage_permissions', 'Gerenciar permissões de grupos', 'Permite gerenciar permissões dos grupos', 'Acessos'),

  -- Dashboard
  ('dashboard.view', 'Visualizar dashboard', 'Permite visualizar o dashboard', 'Dashboard'),
  ('dashboard.view_financial', 'Visualizar métricas financeiras', 'Permite visualizar métricas financeiras no dashboard', 'Dashboard')
ON CONFLICT (codigo) DO NOTHING;

-- Criar grupos de acesso padrão

-- Grupo: Administrador (acesso total via código)
INSERT INTO public.grupos_acesso (nome, descricao, ativo)
VALUES ('Administrador', 'Acesso total ao sistema', true)
ON CONFLICT (nome) DO NOTHING;

-- Grupo: Financeiro (acesso a finanças)
INSERT INTO public.grupos_acesso (nome, descricao, ativo)
VALUES ('Financeiro', 'Acesso ao módulo financeiro', true)
ON CONFLICT (nome) DO NOTHING;

-- Grupo: Recepção (acesso básico)
INSERT INTO public.grupos_acesso (nome, descricao, ativo)
VALUES ('Recepção', 'Acesso à fila de atendimento e cadastro de pacientes', true)
ON CONFLICT (nome) DO NOTHING;

-- Vincular permissões ao grupo Financeiro
DO $$
DECLARE
  grupo_financeiro_id UUID;
  perm_id UUID;
BEGIN
  -- Buscar ID do grupo Financeiro
  SELECT id INTO grupo_financeiro_id FROM public.grupos_acesso WHERE nome = 'Financeiro';
  
  IF grupo_financeiro_id IS NOT NULL THEN
    -- Adicionar permissões de contas a pagar
    FOR perm_id IN 
      SELECT id FROM public.permissoes 
      WHERE codigo LIKE 'contas_pagar.%' OR codigo LIKE 'contas_receber.%'
    LOOP
      INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
      VALUES (grupo_financeiro_id, perm_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Adicionar permissão de visualizar dashboard
    SELECT id INTO perm_id FROM public.permissoes WHERE codigo = 'dashboard.view';
    IF perm_id IS NOT NULL THEN
      INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
      VALUES (grupo_financeiro_id, perm_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- Vincular permissões ao grupo Recepção
DO $$
DECLARE
  grupo_recepcao_id UUID;
  perm_id UUID;
BEGIN
  -- Buscar ID do grupo Recepção
  SELECT id INTO grupo_recepcao_id FROM public.grupos_acesso WHERE nome = 'Recepção';
  
  IF grupo_recepcao_id IS NOT NULL THEN
    -- Adicionar permissões de pacientes (exceto delete)
    FOR perm_id IN 
      SELECT id FROM public.permissoes 
      WHERE codigo IN ('pacientes.view', 'pacientes.create', 'pacientes.edit')
    LOOP
      INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
      VALUES (grupo_recepcao_id, perm_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Adicionar permissões de fila
    FOR perm_id IN 
      SELECT id FROM public.permissoes 
      WHERE codigo LIKE 'fila.%'
    LOOP
      INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
      VALUES (grupo_recepcao_id, perm_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Adicionar permissão de visualizar dashboard
    SELECT id INTO perm_id FROM public.permissoes WHERE codigo = 'dashboard.view';
    IF perm_id IS NOT NULL THEN
      INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
      VALUES (grupo_recepcao_id, perm_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- Mensagem de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Permissões e grupos iniciais criados com sucesso!';
  RAISE NOTICE 'Grupos criados:';
  RAISE NOTICE '  - Administrador (acesso total via código)';
  RAISE NOTICE '  - Financeiro (% permissões)', (SELECT COUNT(*) FROM grupo_permissoes WHERE grupo_id = (SELECT id FROM grupos_acesso WHERE nome = 'Financeiro'));
  RAISE NOTICE '  - Recepção (% permissões)', (SELECT COUNT(*) FROM grupo_permissoes WHERE grupo_id = (SELECT id FROM grupos_acesso WHERE nome = 'Recepção'));
END $$;

