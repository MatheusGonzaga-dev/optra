-- ============================================================
-- ATUALIZAÇÃO: Mudar evento_data de TIMESTAMPTZ para TIMESTAMP
-- para armazenar horário de São Paulo diretamente
-- ============================================================

-- 1) Dropar a view primeiro (depende da coluna evento_data)
DROP VIEW IF EXISTS public.vw_contas_pagar_log_detalhado CASCADE;

-- 2) Dropar a função antiga (que retornava TIMESTAMPTZ)
DROP FUNCTION IF EXISTS get_sao_paulo_time();

-- 3) Criar a função nova retornando TIMESTAMP
CREATE FUNCTION get_sao_paulo_time()
RETURNS TIMESTAMP AS $$
BEGIN
  -- Converte o horário UTC atual para o horário de São Paulo
  -- e retorna como TIMESTAMP (sem timezone)
  RETURN (NOW() AT TIME ZONE 'America/Sao_Paulo');
END;
$$ LANGUAGE plpgsql;

-- 4) Alterar a coluna evento_data de TIMESTAMPTZ para TIMESTAMP
-- Convertendo os valores existentes de UTC para São Paulo
ALTER TABLE public.contas_pagar_log 
  ALTER COLUMN evento_data TYPE TIMESTAMP 
  USING (evento_data AT TIME ZONE 'America/Sao_Paulo');

-- 5) Alterar o DEFAULT da coluna
ALTER TABLE public.contas_pagar_log 
  ALTER COLUMN evento_data SET DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo');

-- 6) Atualizar o comentário da coluna
COMMENT ON COLUMN public.contas_pagar_log.evento_data IS 
'Data e hora do evento armazenado no horário de São Paulo (TIMESTAMP sem timezone)';

-- 7) Recriar a view

CREATE VIEW public.vw_contas_pagar_log_detalhado AS
SELECT 
  log_id,
  evento_tipo,
  -- evento_data já está armazenado no horário de São Paulo (TIMESTAMP)
  evento_data AS evento_data_brasilia,
  conta_id,
  fornecedor,
  numero_documento,
  especie_documento,
  descricao,
  valor_original,
  status,
  alteracoes,
  valores_anteriores,
  usuario_id,
  criado_em,
  atualizado_em
FROM public.contas_pagar_log
ORDER BY evento_data DESC;

COMMENT ON VIEW public.vw_contas_pagar_log_detalhado IS 
'View para facilitar consultas do log de contas a pagar. O campo evento_data_brasilia está armazenado no horário de São Paulo (TIMESTAMP sem timezone). Use jsonb_pretty(alteracoes) para visualizar as alterações de forma legível.';

-- Confirmar a alteração
SELECT 
  'Alteração concluída!' as status,
  'evento_data agora é TIMESTAMP no horário de São Paulo' as detalhes;

