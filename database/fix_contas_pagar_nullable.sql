-- ===========================
-- FIX: REMOVER CONSTRAINT NOT NULL DE categoria_id
-- ===========================

-- Remover constraint NOT NULL do campo categoria_id
DO $$
BEGIN
  -- Verificar se a coluna existe e se tem constraint NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contas_pagar' 
    AND column_name = 'categoria_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.contas_pagar
    ALTER COLUMN categoria_id DROP NOT NULL;
    
    RAISE NOTICE 'Constraint NOT NULL removida de categoria_id';
  ELSE
    RAISE NOTICE 'Campo categoria_id já permite NULL ou não existe';
  END IF;

  -- Verificar e ajustar subcategoria_id também
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contas_pagar' 
    AND column_name = 'subcategoria_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.contas_pagar
    ALTER COLUMN subcategoria_id DROP NOT NULL;
    
    RAISE NOTICE 'Constraint NOT NULL removida de subcategoria_id';
  ELSE
    RAISE NOTICE 'Campo subcategoria_id já permite NULL ou não existe';
  END IF;
END $$;
