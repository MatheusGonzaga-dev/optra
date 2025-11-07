-- ============================================================
-- SISTEMA DE GRUPOS E PERMISSÕES GRANULARES
-- ============================================================

-- 1) Tabela de Grupos de Acesso
CREATE TABLE IF NOT EXISTS public.grupos_acesso (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Tabela de Permissões (cada funcionalidade do sistema)
CREATE TABLE IF NOT EXISTS public.permissoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE, -- Ex: 'pacientes.ver', 'contas_pagar.criar'
  nome TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT NOT NULL, -- Ex: 'Pacientes', 'Financeiro', 'Atendimento'
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Relacionamento Grupo <-> Permissões (N para N)
CREATE TABLE IF NOT EXISTS public.grupo_permissoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID NOT NULL REFERENCES public.grupos_acesso(id) ON DELETE CASCADE,
  permissao_id UUID NOT NULL REFERENCES public.permissoes(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grupo_id, permissao_id)
);

-- 4) Adicionar grupo_id na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES public.grupos_acesso(id) ON DELETE SET NULL;

-- 5) Índices para performance
CREATE INDEX IF NOT EXISTS idx_grupos_acesso_ativo ON public.grupos_acesso(ativo);
CREATE INDEX IF NOT EXISTS idx_grupos_acesso_nome ON public.grupos_acesso(nome);

CREATE INDEX IF NOT EXISTS idx_permissoes_codigo ON public.permissoes(codigo);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo ON public.permissoes(modulo);
CREATE INDEX IF NOT EXISTS idx_permissoes_ativo ON public.permissoes(ativo);

CREATE INDEX IF NOT EXISTS idx_grupo_permissoes_grupo ON public.grupo_permissoes(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_permissoes_permissao ON public.grupo_permissoes(permissao_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_grupo ON public.usuarios(grupo_id);

-- 6) Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION trg_update_grupos_acesso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER grupos_acesso_set_updated_at
BEFORE UPDATE ON public.grupos_acesso
FOR EACH ROW EXECUTE FUNCTION trg_update_grupos_acesso_updated_at();

-- 7) Inserir permissões padrão do sistema
INSERT INTO public.permissoes (codigo, nome, descricao, modulo) VALUES
-- Dashboard
('dashboard.ver', 'Ver Dashboard', 'Visualizar página inicial', 'Dashboard'),

-- Pacientes
('pacientes.ver', 'Ver Pacientes', 'Visualizar lista de pacientes', 'Cadastros'),
('pacientes.criar', 'Criar Pacientes', 'Cadastrar novos pacientes', 'Cadastros'),
('pacientes.editar', 'Editar Pacientes', 'Editar dados de pacientes', 'Cadastros'),
('pacientes.excluir', 'Excluir Pacientes', 'Excluir pacientes', 'Cadastros'),

-- Parcerias
('parcerias.ver', 'Ver Parcerias', 'Visualizar parcerias', 'Cadastros'),
('parcerias.criar', 'Criar Parcerias', 'Cadastrar parcerias', 'Cadastros'),
('parcerias.editar', 'Editar Parcerias', 'Editar parcerias', 'Cadastros'),
('parcerias.excluir', 'Excluir Parcerias', 'Excluir parcerias', 'Cadastros'),

-- Serviços
('servicos.ver', 'Ver Serviços', 'Visualizar serviços', 'Cadastros'),
('servicos.criar', 'Criar Serviços', 'Cadastrar serviços', 'Cadastros'),
('servicos.editar', 'Editar Serviços', 'Editar serviços', 'Cadastros'),
('servicos.excluir', 'Excluir Serviços', 'Excluir serviços', 'Cadastros'),

-- Categorias
('categorias.ver', 'Ver Categorias', 'Visualizar categorias', 'Cadastros'),
('categorias.criar', 'Criar Categorias', 'Cadastrar categorias', 'Cadastros'),
('categorias.editar', 'Editar Categorias', 'Editar categorias', 'Cadastros'),
('categorias.excluir', 'Excluir Categorias', 'Excluir categorias', 'Cadastros'),

-- Fila de Atendimento
('fila.ver', 'Ver Fila', 'Visualizar fila de atendimento', 'Atendimento'),
('fila.gerenciar', 'Gerenciar Fila', 'Adicionar/remover da fila', 'Atendimento'),
('fila.chamar', 'Chamar Paciente', 'Iniciar atendimento', 'Atendimento'),

-- Histórico de Atendimentos
('atendimentos.ver', 'Ver Histórico', 'Visualizar histórico de atendimentos', 'Atendimento'),
('atendimentos.detalhes', 'Ver Detalhes', 'Ver detalhes de atendimentos', 'Atendimento'),
('atendimentos.criar', 'Criar Prontuário', 'Criar prontuários e prescrições', 'Atendimento'),
('atendimentos.editar', 'Editar Prontuário', 'Editar prontuários', 'Atendimento'),

-- Contas a Pagar
('contas_pagar.ver', 'Ver Contas a Pagar', 'Visualizar contas a pagar', 'Financeiro'),
('contas_pagar.criar', 'Criar Contas a Pagar', 'Lançar despesas', 'Financeiro'),
('contas_pagar.editar', 'Editar Contas a Pagar', 'Editar despesas', 'Financeiro'),
('contas_pagar.excluir', 'Excluir Contas a Pagar', 'Excluir despesas', 'Financeiro'),
('contas_pagar.pagar', 'Pagar Contas', 'Registrar pagamentos', 'Financeiro'),

-- Contas a Receber
('contas_receber.ver', 'Ver Contas a Receber', 'Visualizar contas a receber', 'Financeiro'),
('contas_receber.criar', 'Criar Contas a Receber', 'Lançar receitas', 'Financeiro'),
('contas_receber.editar', 'Editar Contas a Receber', 'Editar receitas', 'Financeiro'),
('contas_receber.excluir', 'Excluir Contas a Receber', 'Excluir receitas', 'Financeiro'),
('contas_receber.receber', 'Receber Contas', 'Registrar recebimentos', 'Financeiro'),

-- Relatórios
('relatorios.ver', 'Ver Relatórios', 'Acessar relatórios', 'Ferramentas'),
('relatorios.exportar', 'Exportar Relatórios', 'Exportar dados', 'Ferramentas'),

-- Acessos (Gerenciamento de Usuários)
('acessos.ver', 'Ver Usuários', 'Visualizar usuários do sistema', 'Ferramentas'),
('acessos.criar', 'Criar Usuários', 'Cadastrar funcionários', 'Ferramentas'),
('acessos.editar', 'Editar Usuários', 'Editar cadastros', 'Ferramentas'),
('acessos.excluir', 'Excluir Usuários', 'Excluir usuários', 'Ferramentas'),

-- Grupos de Acesso
('grupos.ver', 'Ver Grupos', 'Visualizar grupos de acesso', 'Ferramentas'),
('grupos.criar', 'Criar Grupos', 'Criar novos grupos', 'Ferramentas'),
('grupos.editar', 'Editar Grupos', 'Editar grupos e permissões', 'Ferramentas'),
('grupos.excluir', 'Excluir Grupos', 'Excluir grupos', 'Ferramentas'),

-- Configurações
('configuracoes.ver', 'Ver Configurações', 'Acessar configurações', 'Ferramentas'),
('configuracoes.editar', 'Editar Configurações', 'Alterar configurações', 'Ferramentas')

ON CONFLICT (codigo) DO NOTHING;

-- 8) Criar grupos padrão
INSERT INTO public.grupos_acesso (nome, descricao) VALUES
('Administrador', 'Acesso total ao sistema'),
('Secretária', 'Gerencia pacientes, agenda e fila de atendimento'),
('Optometrista', 'Realiza atendimentos e cria prontuários'),
('Financeiro', 'Acessa apenas módulo financeiro')
ON CONFLICT (nome) DO NOTHING;

-- 9) Associar TODAS as permissões ao grupo Administrador
INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
SELECT 
  (SELECT id FROM public.grupos_acesso WHERE nome = 'Administrador'),
  id
FROM public.permissoes
ON CONFLICT (grupo_id, permissao_id) DO NOTHING;

-- 10) Permissões para Secretária
INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
SELECT 
  (SELECT id FROM public.grupos_acesso WHERE nome = 'Secretária'),
  id
FROM public.permissoes
WHERE codigo IN (
  'dashboard.ver',
  'pacientes.ver', 'pacientes.criar', 'pacientes.editar',
  'fila.ver', 'fila.gerenciar',
  'atendimentos.ver', 'atendimentos.detalhes'
)
ON CONFLICT (grupo_id, permissao_id) DO NOTHING;

-- 11) Permissões para Optometrista
INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
SELECT 
  (SELECT id FROM public.grupos_acesso WHERE nome = 'Optometrista'),
  id
FROM public.permissoes
WHERE codigo IN (
  'dashboard.ver',
  'pacientes.ver',
  'fila.ver', 'fila.chamar',
  'atendimentos.ver', 'atendimentos.detalhes', 'atendimentos.criar', 'atendimentos.editar'
)
ON CONFLICT (grupo_id, permissao_id) DO NOTHING;

-- 12) Permissões para Financeiro
INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
SELECT 
  (SELECT id FROM public.grupos_acesso WHERE nome = 'Financeiro'),
  id
FROM public.permissoes
WHERE codigo IN (
  'dashboard.ver',
  'contas_pagar.ver', 'contas_pagar.criar', 'contas_pagar.editar', 'contas_pagar.pagar',
  'contas_receber.ver', 'contas_receber.criar', 'contas_receber.editar', 'contas_receber.receber',
  'categorias.ver',
  'relatorios.ver', 'relatorios.exportar'
)
ON CONFLICT (grupo_id, permissao_id) DO NOTHING;

-- 13) View para facilitar consultas de permissões por usuário
CREATE OR REPLACE VIEW public.vw_usuario_permissoes AS
SELECT 
  u.id as usuario_id,
  u.nome_completo,
  u.email,
  g.id as grupo_id,
  g.nome as grupo_nome,
  p.id as permissao_id,
  p.codigo as permissao_codigo,
  p.nome as permissao_nome,
  p.modulo as permissao_modulo
FROM public.usuarios u
LEFT JOIN public.grupos_acesso g ON u.grupo_id = g.id
LEFT JOIN public.grupo_permissoes gp ON g.id = gp.grupo_id
LEFT JOIN public.permissoes p ON gp.permissao_id = p.id
WHERE u.ativo = true AND (g.ativo = true OR g.ativo IS NULL);

COMMENT ON VIEW public.vw_usuario_permissoes IS 
'View que retorna todas as permissões de cada usuário baseado no grupo';

-- Comentários
COMMENT ON TABLE public.grupos_acesso IS 'Grupos de acesso do sistema (ex: Admin, Secretária)';
COMMENT ON TABLE public.permissoes IS 'Permissões granulares do sistema';
COMMENT ON TABLE public.grupo_permissoes IS 'Relacionamento N para N entre grupos e permissões';

