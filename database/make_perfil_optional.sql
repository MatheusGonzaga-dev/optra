-- Tornar o campo perfil opcional na tabela usuarios
-- Execute este script se o campo perfil estiver como NOT NULL

ALTER TABLE public.usuarios 
ALTER COLUMN perfil DROP NOT NULL;

COMMENT ON COLUMN public.usuarios.perfil IS 'Perfil do usuário (opcional, pois as permissões são controladas pelo grupo_id)';

