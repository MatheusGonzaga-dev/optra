-- ===========================
-- ADICIONAR ESPÉCIE DO DOCUMENTO E NUMERAÇÃO SEQUENCIAL
-- ===========================

-- 1) Criar ENUM para espécie de documento
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'especie_documento') THEN
    CREATE TYPE especie_documento AS ENUM (
      'CONTAS_A_PAGAR',
      'NOTA_FISCAL',
      'FATURA',
      'DUPLICATA',
      'BOLETO',
      'RECIBO',
      'NOTA_FISCAL_SERVICO',
      'PEDIDO',
      'ORDEM_COMPRA',
      'OUTROS'
    );
  END IF;
END $$;

-- 2) Adicionar coluna especie_documento na tabela contas_pagar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='especie_documento'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN especie_documento especie_documento;
    
    RAISE NOTICE 'Coluna especie_documento adicionada';
  ELSE
    RAISE NOTICE 'Coluna especie_documento já existe';
  END IF;
END $$;

-- 3) Criar índice para melhorar performance nas consultas de numeração
CREATE INDEX IF NOT EXISTS idx_contas_pagar_especie_documento 
  ON public.contas_pagar(especie_documento) 
  WHERE deletado_em IS NULL;

-- 4) Criar índice composto para busca do último número por espécie
CREATE INDEX IF NOT EXISTS idx_contas_pagar_especie_numero 
  ON public.contas_pagar(especie_documento, numero_documento) 
  WHERE deletado_em IS NULL AND numero_documento IS NOT NULL;

COMMENT ON COLUMN public.contas_pagar.especie_documento IS 
'Espécie do documento (Nota Fiscal, Fatura, Duplicata, etc.)';
