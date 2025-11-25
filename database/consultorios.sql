-- Tabela de Consultórios
CREATE TABLE IF NOT EXISTS public.consultorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deletado_em TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_consultorios_ativo ON public.consultorios(ativo) WHERE deletado_em IS NULL;

-- Comentários
COMMENT ON TABLE public.consultorios IS 'Tabela de consultórios da clínica';
COMMENT ON COLUMN public.consultorios.nome IS 'Nome do consultório (ex: Consultório 1, Sala A, etc)';
COMMENT ON COLUMN public.consultorios.descricao IS 'Descrição opcional do consultório';
COMMENT ON COLUMN public.consultorios.ativo IS 'Indica se o consultório está ativo';

-- Tabela de Sessões de Consultório (rastreia qual profissional está em qual consultório)
CREATE TABLE IF NOT EXISTS public.consultorio_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  consultorio_id UUID NOT NULL REFERENCES public.consultorios(id) ON DELETE CASCADE,
  inicio_sessao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fim_sessao TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_consultorio_sessoes_usuario ON public.consultorio_sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_consultorio_sessoes_consultorio ON public.consultorio_sessoes(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_consultorio_sessoes_ativo ON public.consultorio_sessoes(usuario_id, ativo) WHERE ativo = true;

-- Comentários
COMMENT ON TABLE public.consultorio_sessoes IS 'Rastreia qual profissional está em qual consultório';
COMMENT ON COLUMN public.consultorio_sessoes.usuario_id IS 'ID do profissional';
COMMENT ON COLUMN public.consultorio_sessoes.consultorio_id IS 'ID do consultório';
COMMENT ON COLUMN public.consultorio_sessoes.inicio_sessao IS 'Quando o profissional entrou no consultório';
COMMENT ON COLUMN public.consultorio_sessoes.fim_sessao IS 'Quando o profissional saiu do consultório (NULL = ainda ativo)';
COMMENT ON COLUMN public.consultorio_sessoes.ativo IS 'Indica se a sessão está ativa';

-- Inserir alguns consultórios padrão
INSERT INTO public.consultorios (nome, descricao) VALUES
  ('Consultório 1', 'Consultório principal'),
  ('Consultório 2', 'Consultório secundário'),
  ('Consultório 3', 'Consultório terciário')
ON CONFLICT DO NOTHING;

