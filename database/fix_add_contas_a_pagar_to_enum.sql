-- ===========================
-- ADICIONAR 'CONTAS_A_PAGAR' AO ENUM EXISTENTE
-- Execute este script se o ENUM já foi criado sem o valor CONTAS_A_PAGAR
-- 
-- IMPORTANTE: Em PostgreSQL, ALTER TYPE ... ADD VALUE não pode ser executado 
-- dentro de uma transação (bloco DO $$).
-- 
-- SOLUÇÃO: Execute o comando abaixo DIRETAMENTE no Supabase SQL Editor
-- (fora de qualquer bloco transacional).
-- ===========================

-- Execute este comando diretamente no Supabase SQL Editor:
ALTER TYPE especie_documento ADD VALUE IF NOT EXISTS 'CONTAS_A_PAGAR';

-- Se o comando acima falhar porque o valor já existe, ignore o erro.
-- Se você quiser adicionar antes de um valor específico (ex: NOTA_FISCAL), use:
-- ALTER TYPE especie_documento ADD VALUE 'CONTAS_A_PAGAR' BEFORE 'NOTA_FISCAL';
