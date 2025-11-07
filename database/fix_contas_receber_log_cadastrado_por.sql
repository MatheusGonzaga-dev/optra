-- ============================================================
-- CORRIGIR TABELA DE LOG - REMOVER CAMPO CADASTRADO_POR
-- ============================================================
-- Este script remove o campo cadastrado_por que não existe na tabela contas_receber

-- 1) Remover coluna cadastrado_por da tabela de log se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contas_receber_log' 
    AND column_name = 'cadastrado_por'
  ) THEN
    ALTER TABLE public.contas_receber_log
    DROP COLUMN cadastrado_por;
    
    RAISE NOTICE 'Coluna cadastrado_por removida da tabela contas_receber_log';
  ELSE
    RAISE NOTICE 'Coluna cadastrado_por não existe na tabela contas_receber_log';
  END IF;
END $$;

-- 2) Recriar os triggers para garantir que não há referências a cadastrado_por
-- Primeiro, remover os triggers existentes
DROP TRIGGER IF EXISTS trg_log_contas_receber_insert ON public.contas_receber;
DROP TRIGGER IF EXISTS trg_log_contas_receber_update ON public.contas_receber;
DROP TRIGGER IF EXISTS trg_log_contas_receber_delete ON public.contas_receber;

-- Remover as funções
DROP FUNCTION IF EXISTS trg_log_contas_receber_insert() CASCADE;
DROP FUNCTION IF EXISTS trg_log_contas_receber_update() CASCADE;
DROP FUNCTION IF EXISTS trg_log_contas_receber_delete() CASCADE;

-- IMPORTANTE: Após executar este script, execute novamente o arquivo contas_receber_log.sql
-- para recriar os triggers sem a referência a cadastrado_por

