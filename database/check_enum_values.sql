-- ===========================
-- VERIFICAR VALORES DO ENUM especie_documento
-- Execute este script no Supabase SQL Editor para ver os valores existentes
-- ===========================

-- Verificar se o ENUM existe
SELECT 
  EXISTS(SELECT 1 FROM pg_type WHERE typname = 'especie_documento') as enum_existe;

-- Listar todos os valores do ENUM especie_documento
SELECT 
  e.enumlabel as valor,
  e.enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'especie_documento'
ORDER BY e.enumsortorder;

-- Verificar se a coluna especie_documento existe na tabela contas_pagar
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contas_pagar' 
  AND column_name = 'especie_documento';



