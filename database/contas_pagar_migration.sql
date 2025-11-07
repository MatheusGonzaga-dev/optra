-- ===========================
-- MIGRAÇÃO TABELA CONTAS_PAGAR
-- Ajusta para o schema correto com view existente
-- ===========================

-- 1) Salvar e dropar view existente (se existir)
DO $$
DECLARE
  view_def TEXT;
BEGIN
  -- Tentar obter a definição da view
  SELECT pg_get_viewdef('public.vw_contas_pagar_detalhadas', true)
  INTO view_def;
  
  IF view_def IS NOT NULL THEN
    -- Dropar view temporariamente
    DROP VIEW IF EXISTS public.vw_contas_pagar_detalhadas CASCADE;
    RAISE NOTICE 'View vw_contas_pagar_detalhadas removida temporariamente';
  END IF;
END $$;

-- 2) Criar tipos ENUM se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_conta') THEN
    CREATE TYPE status_conta AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forma_pagamento_conta') THEN
    CREATE TYPE forma_pagamento_conta AS ENUM ('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'TRANSFERENCIA');
  END IF;
END $$;

-- 3) Adicionar/ajustar colunas conforme schema
DO $$
BEGIN
  -- numero_documento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='numero_documento'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN numero_documento TEXT;
  END IF;

  -- Renomear e ajustar campos de valor
  -- valor_titulo -> valor_original (se existir valor_titulo)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_titulo'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_original'
  ) THEN
    ALTER TABLE public.contas_pagar
    RENAME COLUMN valor_titulo TO valor_original;
  END IF;

  -- Se não existir valor_original, criar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_original'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN valor_original NUMERIC NOT NULL DEFAULT 0;
  END IF;

  -- desconto -> valor_desconto
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='desconto'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_desconto'
  ) THEN
    ALTER TABLE public.contas_pagar
    RENAME COLUMN desconto TO valor_desconto;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_desconto'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN valor_desconto NUMERIC NOT NULL DEFAULT 0;
  END IF;

  -- acrescimo -> valor_juros
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='acrescimo'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_juros'
  ) THEN
    ALTER TABLE public.contas_pagar
    RENAME COLUMN acrescimo TO valor_juros;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_juros'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN valor_juros NUMERIC NOT NULL DEFAULT 0;
  END IF;

  -- Garantir valor_pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_pago'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN valor_pago NUMERIC NOT NULL DEFAULT 0;
  END IF;

  -- data_emissao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='data_emissao'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN data_emissao DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Garantir data_vencimento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='data_vencimento'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN data_vencimento DATE NOT NULL;
  END IF;

  -- Garantir data_pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='data_pagamento'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN data_pagamento DATE;
  END IF;

  -- forma_pagamento (criar como TEXT primeiro, depois converter)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='forma_pagamento'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN forma_pagamento TEXT;
  END IF;

  -- status (ajustar para ENUM)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='status' 
    AND udt_name <> 'status_conta'
  ) THEN
    -- Converter status para ENUM
    ALTER TABLE public.contas_pagar
    ALTER COLUMN status TYPE TEXT;
    
    ALTER TABLE public.contas_pagar
    ALTER COLUMN status TYPE status_conta
    USING (
      CASE UPPER(COALESCE(status::text, ''))
        WHEN 'PENDENTE' THEN 'PENDENTE'::status_conta
        WHEN 'PAGO' THEN 'PAGO'::status_conta
        WHEN 'VENCIDO' THEN 'VENCIDO'::status_conta
        WHEN 'CANCELADO' THEN 'CANCELADO'::status_conta
        ELSE 'PENDENTE'::status_conta
      END
    );
  END IF;

  -- categoria_id (substituir categoria TEXT por categoria_id UUID)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='categoria_id'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN categoria_id UUID;
  END IF;

  -- subcategoria_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='subcategoria_id'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN subcategoria_id UUID;
  END IF;

  -- cadastrado_por (renomear criado_por_id se existir)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='criado_por_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='cadastrado_por'
  ) THEN
    ALTER TABLE public.contas_pagar
    RENAME COLUMN criado_por_id TO cadastrado_por;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='cadastrado_por'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN cadastrado_por UUID;
  END IF;

  -- deletado_em (ao invés de ativo)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='deletado_em'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN deletado_em TIMESTAMPTZ;
  END IF;

  -- Garantir timestamps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='criado_em'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='atualizado_em'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 4) Converter forma_pagamento para ENUM (após dropar view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='forma_pagamento'
    AND udt_name <> 'forma_pagamento_conta'
  ) THEN
    ALTER TABLE public.contas_pagar
    ALTER COLUMN forma_pagamento TYPE TEXT;
    
    ALTER TABLE public.contas_pagar
    ALTER COLUMN forma_pagamento TYPE forma_pagamento_conta
    USING (
      CASE UPPER(COALESCE(forma_pagamento::text, ''))
        WHEN 'DINHEIRO' THEN 'DINHEIRO'::forma_pagamento_conta
        WHEN 'CARTAO_CREDITO' THEN 'CARTAO_CREDITO'::forma_pagamento_conta
        WHEN 'CARTAO_DEBITO' THEN 'CARTAO_DEBITO'::forma_pagamento_conta
        WHEN 'PIX' THEN 'PIX'::forma_pagamento_conta
        WHEN 'BOLETO' THEN 'BOLETO'::forma_pagamento_conta
        WHEN 'TRANSFERENCIA' THEN 'TRANSFERENCIA'::forma_pagamento_conta
        ELSE NULL
      END
    );
  END IF;
END $$;

-- 5) Coluna calculada valor_final
DO $$
BEGIN
  -- Dropar se existir e não for calculada
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_final'
    AND is_generated = 'NEVER'
  ) THEN
    ALTER TABLE public.contas_pagar
    DROP COLUMN valor_final;
  END IF;

  -- Criar como calculada se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='contas_pagar' AND column_name='valor_final'
  ) THEN
    ALTER TABLE public.contas_pagar
    ADD COLUMN valor_final NUMERIC GENERATED ALWAYS AS (
      COALESCE(valor_original, 0) - COALESCE(valor_desconto, 0) + COALESCE(valor_juros, 0)
    ) STORED;
  END IF;
END $$;

-- 6) Constraints
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_contas_pagar_valores_nonneg') THEN
    ALTER TABLE public.contas_pagar DROP CONSTRAINT ck_contas_pagar_valores_nonneg;
  END IF;

  ALTER TABLE public.contas_pagar
  ADD CONSTRAINT ck_contas_pagar_valores_nonneg
  CHECK (
    COALESCE(valor_original, 0) >= 0 AND
    COALESCE(valor_pago, 0) >= 0 AND
    COALESCE(valor_desconto, 0) >= 0 AND
    COALESCE(valor_juros, 0) >= 0
  );

  -- Unicidade numero_documento por fornecedor
  DROP INDEX IF EXISTS uq_contas_pagar_fornecedor_numero;
  CREATE UNIQUE INDEX uq_contas_pagar_fornecedor_numero
    ON public.contas_pagar (fornecedor, numero_documento)
    WHERE numero_documento IS NOT NULL AND deletado_em IS NULL;
END $$;

-- 7) Foreign Keys
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='usuarios') THEN
    ALTER TABLE public.contas_pagar
    DROP CONSTRAINT IF EXISTS fk_contas_pagar_cadastrado_por;
    ALTER TABLE public.contas_pagar
    ADD CONSTRAINT fk_contas_pagar_cadastrado_por
    FOREIGN KEY (cadastrado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='categorias_financeiras') THEN
    ALTER TABLE public.contas_pagar
    DROP CONSTRAINT IF EXISTS fk_contas_pagar_categoria;
    ALTER TABLE public.contas_pagar
    ADD CONSTRAINT fk_contas_pagar_categoria
    FOREIGN KEY (categoria_id) REFERENCES public.categorias_financeiras(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subcategorias_financeiras') THEN
    ALTER TABLE public.contas_pagar
    DROP CONSTRAINT IF EXISTS fk_contas_pagar_subcategoria;
    ALTER TABLE public.contas_pagar
    ADD CONSTRAINT fk_contas_pagar_subcategoria
    FOREIGN KEY (subcategoria_id) REFERENCES public.subcategorias_financeiras(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 8) Trigger para atualizado_em
CREATE OR REPLACE FUNCTION trg_update_contas_pagar_updated_at()
RETURNS TRIGGER AS $f$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$f$ LANGUAGE plpgsql;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS contas_pagar_set_updated_at ON public.contas_pagar;
  CREATE TRIGGER contas_pagar_set_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW EXECUTE FUNCTION trg_update_contas_pagar_updated_at();
END $$;

-- 9) Índices
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON public.contas_pagar(fornecedor);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_deletado_em_null ON public.contas_pagar((deletado_em IS NULL));
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON public.contas_pagar(categoria_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_subcategoria ON public.contas_pagar(subcategoria_id);

-- 10) Recriar view (se você souber a definição original)
-- Se você não souber a definição, pode recriar depois ou deixar comentado
-- Exemplo básico (ajuste conforme necessário):
CREATE OR REPLACE VIEW public.vw_contas_pagar_detalhadas AS
SELECT 
  cp.*,
  COALESCE(cp.valor_final, 0) as valor_total,
  CASE 
    WHEN cp.deletado_em IS NOT NULL THEN true
    ELSE false
  END as deletado,
  CASE
    WHEN cp.data_vencimento < CURRENT_DATE AND cp.status = 'PENDENTE' THEN true
    ELSE false
  END as vencido
FROM public.contas_pagar cp
WHERE cp.deletado_em IS NULL;

COMMENT ON VIEW public.vw_contas_pagar_detalhadas IS 
'View detalhada de contas a pagar com campos calculados';

