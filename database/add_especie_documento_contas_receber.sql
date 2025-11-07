-- ============================================================
-- ADICIONAR CAMPO ESPECIE_DOCUMENTO NA TABELA CONTAS_RECEBER
-- ============================================================

-- Adicionar coluna especie_documento se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contas_receber' 
    AND column_name = 'especie_documento'
  ) THEN
    ALTER TABLE public.contas_receber
    ADD COLUMN especie_documento TEXT;
    
    RAISE NOTICE 'Coluna especie_documento adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna especie_documento já existe';
  END IF;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN public.contas_receber.especie_documento IS 
'Tipo de documento da conta a receber: NOTA_FISCAL, RECIBO, FATURA, DUPLICATA, BOLETO, PIX, OUTROS';

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_contas_receber_especie_documento 
ON public.contas_receber(especie_documento);

-- Confirmar a alteração
SELECT 
  'Alteração concluída!' as status,
  'Campo especie_documento adicionado na tabela contas_receber' as detalhes;

