-- Adicionar coluna is_admin na tabela grupos_acesso
ALTER TABLE public.grupos_acesso 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Comentário na coluna
COMMENT ON COLUMN public.grupos_acesso.is_admin IS 'Flag que indica se o grupo tem acesso total ao sistema (bypass de todas as permissões)';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_grupos_acesso_is_admin ON public.grupos_acesso(is_admin);

