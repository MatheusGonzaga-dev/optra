-- ===========================
-- TABELA DE LOG PARA CONTAS A RECEBER
-- Registra todas as alterações na tabela contas_receber
-- ===========================

-- 1) Criar tabela de log
CREATE TABLE IF NOT EXISTS public.contas_receber_log (
  -- ID do log
  log_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Tipo de evento
  evento_tipo TEXT NOT NULL CHECK (evento_tipo IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Data e hora do evento (armazenado em horário de São Paulo, sem timezone)
  evento_data TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  
  -- Usuário que executou a ação (se disponível)
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- ID do registro original
  conta_id UUID NOT NULL,
  
  -- Replicar todas as colunas da tabela principal
  -- Informações básicas
  paciente_id UUID,
  consulta_id UUID,
  descricao TEXT,
  categoria_id UUID,
  subcategoria_id UUID,
  especie_documento TEXT,
  numero_documento TEXT,
  
  -- Valores
  valor_original NUMERIC,
  valor_recebido NUMERIC,
  valor_desconto NUMERIC,
  valor_juros NUMERIC,
  valor_final NUMERIC,
  
  -- Datas
  data_emissao DATE,
  data_vencimento DATE,
  data_recebimento DATE,
  
  -- Forma de pagamento e status
  forma_pagamento TEXT,
  status TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata original
  criado_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ,
  deletado_em TIMESTAMPTZ,
  
  -- Campos específicos do log
  -- Para UPDATE: armazena os valores anteriores (JSONB)
  valores_anteriores JSONB,
  
  -- Para UPDATE: armazena quais campos foram alterados (JSONB)
  -- Formato: {"campo": {"de": "valor_antigo", "para": "valor_novo"}}
  alteracoes JSONB,
  
  -- IP do usuário (se disponível via contexto)
  ip_address TEXT,
  
  -- Informações adicionais sobre o evento
  observacoes_log TEXT
);

-- 2) Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_contas_receber_log_conta_id 
  ON public.contas_receber_log(conta_id);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_evento_tipo 
  ON public.contas_receber_log(evento_tipo);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_evento_data 
  ON public.contas_receber_log(evento_data DESC);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_usuario_id 
  ON public.contas_receber_log(usuario_id);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_paciente_id 
  ON public.contas_receber_log(paciente_id);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_numero_documento 
  ON public.contas_receber_log(numero_documento);

CREATE INDEX IF NOT EXISTS idx_contas_receber_log_status 
  ON public.contas_receber_log(status);

-- Função auxiliar para obter o horário de São Paulo como TIMESTAMP (sem timezone)
CREATE OR REPLACE FUNCTION get_sao_paulo_time()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'America/Sao_Paulo');
END;
$$ LANGUAGE plpgsql;

-- 3) Função para capturar valores anteriores e alterações (UPDATE)
CREATE OR REPLACE FUNCTION trg_log_contas_receber_update()
RETURNS TRIGGER AS $$
DECLARE
  alteracoes_json JSONB := '{}'::JSONB;
  valores_antigos_json JSONB;
BEGIN
  -- Armazenar todos os valores anteriores como JSONB
  valores_antigos_json := row_to_json(OLD)::JSONB;
  
  -- Comparar cada campo importante e registrar alterações
  -- Paciente ID
  IF (OLD.paciente_id IS DISTINCT FROM NEW.paciente_id) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'paciente_id', 
      jsonb_build_object('de', OLD.paciente_id::TEXT, 'para', NEW.paciente_id::TEXT)
    );
  END IF;
  
  -- Consulta ID
  IF (OLD.consulta_id IS DISTINCT FROM NEW.consulta_id) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'consulta_id', 
      jsonb_build_object('de', OLD.consulta_id::TEXT, 'para', NEW.consulta_id::TEXT)
    );
  END IF;
  
  -- Descrição
  IF (OLD.descricao IS DISTINCT FROM NEW.descricao) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'descricao', 
      jsonb_build_object('de', OLD.descricao, 'para', NEW.descricao)
    );
  END IF;
  
  -- Categoria ID
  IF (OLD.categoria_id IS DISTINCT FROM NEW.categoria_id) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'categoria_id', 
      jsonb_build_object('de', OLD.categoria_id::TEXT, 'para', NEW.categoria_id::TEXT)
    );
  END IF;
  
  -- Subcategoria ID
  IF (OLD.subcategoria_id IS DISTINCT FROM NEW.subcategoria_id) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'subcategoria_id', 
      jsonb_build_object('de', OLD.subcategoria_id::TEXT, 'para', NEW.subcategoria_id::TEXT)
    );
  END IF;
  
  -- Espécie Documento
  IF (OLD.especie_documento IS DISTINCT FROM NEW.especie_documento) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'especie_documento', 
      jsonb_build_object('de', OLD.especie_documento::TEXT, 'para', NEW.especie_documento::TEXT)
    );
  END IF;
  
  -- Número Documento
  IF (OLD.numero_documento IS DISTINCT FROM NEW.numero_documento) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'numero_documento', 
      jsonb_build_object('de', OLD.numero_documento, 'para', NEW.numero_documento)
    );
  END IF;
  
  -- Valor Original
  IF (OLD.valor_original IS DISTINCT FROM NEW.valor_original) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'valor_original', 
      jsonb_build_object('de', OLD.valor_original::TEXT, 'para', NEW.valor_original::TEXT)
    );
  END IF;
  
  -- Valor Recebido
  IF (OLD.valor_recebido IS DISTINCT FROM NEW.valor_recebido) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'valor_recebido', 
      jsonb_build_object('de', OLD.valor_recebido::TEXT, 'para', NEW.valor_recebido::TEXT)
    );
  END IF;
  
  -- Valor Desconto
  IF (OLD.valor_desconto IS DISTINCT FROM NEW.valor_desconto) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'valor_desconto', 
      jsonb_build_object('de', OLD.valor_desconto::TEXT, 'para', NEW.valor_desconto::TEXT)
    );
  END IF;
  
  -- Valor Juros
  IF (OLD.valor_juros IS DISTINCT FROM NEW.valor_juros) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'valor_juros', 
      jsonb_build_object('de', OLD.valor_juros::TEXT, 'para', NEW.valor_juros::TEXT)
    );
  END IF;
  
  -- Data Emissão
  IF (OLD.data_emissao IS DISTINCT FROM NEW.data_emissao) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'data_emissao', 
      jsonb_build_object('de', OLD.data_emissao::TEXT, 'para', NEW.data_emissao::TEXT)
    );
  END IF;
  
  -- Data Vencimento
  IF (OLD.data_vencimento IS DISTINCT FROM NEW.data_vencimento) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'data_vencimento', 
      jsonb_build_object('de', OLD.data_vencimento::TEXT, 'para', NEW.data_vencimento::TEXT)
    );
  END IF;
  
  -- Data Recebimento
  IF (OLD.data_recebimento IS DISTINCT FROM NEW.data_recebimento) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'data_recebimento', 
      jsonb_build_object('de', OLD.data_recebimento::TEXT, 'para', NEW.data_recebimento::TEXT)
    );
  END IF;
  
  -- Forma Pagamento
  IF (OLD.forma_pagamento IS DISTINCT FROM NEW.forma_pagamento) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'forma_pagamento', 
      jsonb_build_object('de', OLD.forma_pagamento::TEXT, 'para', NEW.forma_pagamento::TEXT)
    );
  END IF;
  
  -- Status
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'status', 
      jsonb_build_object('de', OLD.status::TEXT, 'para', NEW.status::TEXT)
    );
  END IF;
  
  -- Observações
  IF (OLD.observacoes IS DISTINCT FROM NEW.observacoes) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'observacoes', 
      jsonb_build_object('de', OLD.observacoes, 'para', NEW.observacoes)
    );
  END IF;
  
  -- Deletado Em (soft delete)
  IF (OLD.deletado_em IS DISTINCT FROM NEW.deletado_em) THEN
    alteracoes_json := alteracoes_json || jsonb_build_object(
      'deletado_em', 
      jsonb_build_object('de', OLD.deletado_em::TEXT, 'para', NEW.deletado_em::TEXT)
    );
  END IF;
  
  -- Verificar se é um soft delete (deletado_em passou de NULL para uma data)
  -- e não há outras alterações além de deletado_em e atualizado_em
  IF (OLD.deletado_em IS NULL AND NEW.deletado_em IS NOT NULL) THEN
    -- É um soft delete - registrar como DELETE
    INSERT INTO public.contas_receber_log (
      evento_tipo,
      evento_data,
      conta_id,
      paciente_id,
      consulta_id,
      descricao,
      categoria_id,
      subcategoria_id,
      especie_documento,
      numero_documento,
      valor_original,
      valor_recebido,
      valor_desconto,
      valor_juros,
      valor_final,
      data_emissao,
      data_vencimento,
      data_recebimento,
      forma_pagamento,
      status,
      observacoes,
      criado_em,
      atualizado_em,
      deletado_em,
      valores_anteriores
    )
    VALUES (
      'DELETE',
      get_sao_paulo_time(),
      OLD.id,
      OLD.paciente_id,
      OLD.consulta_id,
      OLD.descricao,
      OLD.categoria_id,
      OLD.subcategoria_id,
      OLD.especie_documento::TEXT,
      OLD.numero_documento,
      OLD.valor_original,
      OLD.valor_recebido,
      OLD.valor_desconto,
      OLD.valor_juros,
      OLD.valor_final,
      OLD.data_emissao,
      OLD.data_vencimento,
      OLD.data_recebimento,
      OLD.forma_pagamento::TEXT,
      OLD.status::TEXT,
      OLD.observacoes,
      OLD.criado_em,
      OLD.atualizado_em,
      OLD.deletado_em,
      valores_antigos_json
    );
  ELSIF alteracoes_json != '{}'::JSONB THEN
    -- É um UPDATE normal - registrar como UPDATE
    INSERT INTO public.contas_receber_log (
      evento_tipo,
      evento_data,
      conta_id,
      paciente_id,
      consulta_id,
      descricao,
      categoria_id,
      subcategoria_id,
      especie_documento,
      numero_documento,
      valor_original,
      valor_recebido,
      valor_desconto,
      valor_juros,
      valor_final,
      data_emissao,
      data_vencimento,
      data_recebimento,
      forma_pagamento,
      status,
      observacoes,
      criado_em,
      atualizado_em,
      deletado_em,
      valores_anteriores,
      alteracoes
    )
    VALUES (
      'UPDATE',
      get_sao_paulo_time(),
      NEW.id,
      NEW.paciente_id,
      NEW.consulta_id,
      NEW.descricao,
      NEW.categoria_id,
      NEW.subcategoria_id,
      NEW.especie_documento::TEXT,
      NEW.numero_documento,
      NEW.valor_original,
      NEW.valor_recebido,
      NEW.valor_desconto,
      NEW.valor_juros,
      NEW.valor_final,
      NEW.data_emissao,
      NEW.data_vencimento,
      NEW.data_recebimento,
      NEW.forma_pagamento::TEXT,
      NEW.status::TEXT,
      NEW.observacoes,
      NEW.criado_em,
      NEW.atualizado_em,
      NEW.deletado_em,
      valores_antigos_json,
      alteracoes_json
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Função para capturar INSERT
CREATE OR REPLACE FUNCTION trg_log_contas_receber_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contas_receber_log (
    evento_tipo,
    evento_data,
    conta_id,
    paciente_id,
    consulta_id,
    descricao,
    categoria_id,
    subcategoria_id,
    especie_documento,
    numero_documento,
    valor_original,
    valor_recebido,
    valor_desconto,
    valor_juros,
    valor_final,
    data_emissao,
    data_vencimento,
    data_recebimento,
    forma_pagamento,
    status,
    observacoes,
    criado_em,
    atualizado_em,
    deletado_em
  )
  VALUES (
    'INSERT',
    get_sao_paulo_time(),
    NEW.id,
    NEW.paciente_id,
    NEW.consulta_id,
    NEW.descricao,
    NEW.categoria_id,
    NEW.subcategoria_id,
    NEW.especie_documento::TEXT,
    NEW.numero_documento,
    NEW.valor_original,
    NEW.valor_recebido,
    NEW.valor_desconto,
    NEW.valor_juros,
    NEW.valor_final,
    NEW.data_emissao,
    NEW.data_vencimento,
    NEW.data_recebimento,
    NEW.forma_pagamento::TEXT,
    NEW.status::TEXT,
    NEW.observacoes,
    NEW.criado_em,
    NEW.atualizado_em,
    NEW.deletado_em
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5) Função para capturar DELETE
CREATE OR REPLACE FUNCTION trg_log_contas_receber_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contas_receber_log (
    evento_tipo,
    evento_data,
    conta_id,
    paciente_id,
    consulta_id,
    descricao,
    categoria_id,
    subcategoria_id,
    especie_documento,
    numero_documento,
    valor_original,
    valor_recebido,
    valor_desconto,
    valor_juros,
    valor_final,
    data_emissao,
    data_vencimento,
    data_recebimento,
    forma_pagamento,
    status,
    observacoes,
    criado_em,
    atualizado_em,
    deletado_em,
    valores_anteriores
  )
  VALUES (
    'DELETE',
    get_sao_paulo_time(),
    OLD.id,
    OLD.paciente_id,
    OLD.consulta_id,
    OLD.descricao,
    OLD.categoria_id,
    OLD.subcategoria_id,
    OLD.especie_documento::TEXT,
    OLD.numero_documento,
    OLD.valor_original,
    OLD.valor_recebido,
    OLD.valor_desconto,
    OLD.valor_juros,
    OLD.valor_final,
    OLD.data_emissao,
    OLD.data_vencimento,
    OLD.data_recebimento,
    OLD.forma_pagamento::TEXT,
    OLD.status::TEXT,
    OLD.observacoes,
    OLD.criado_em,
    OLD.atualizado_em,
    OLD.deletado_em,
    row_to_json(OLD)::JSONB
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6) Criar triggers
DROP TRIGGER IF EXISTS contas_receber_after_insert_log ON public.contas_receber;
CREATE TRIGGER contas_receber_after_insert_log
AFTER INSERT ON public.contas_receber
FOR EACH ROW EXECUTE FUNCTION trg_log_contas_receber_insert();

DROP TRIGGER IF EXISTS contas_receber_after_update_log ON public.contas_receber;
CREATE TRIGGER contas_receber_after_update_log
AFTER UPDATE ON public.contas_receber
FOR EACH ROW EXECUTE FUNCTION trg_log_contas_receber_update();

DROP TRIGGER IF EXISTS contas_receber_after_delete_log ON public.contas_receber;
CREATE TRIGGER contas_receber_after_delete_log
AFTER DELETE ON public.contas_receber
FOR EACH ROW EXECUTE FUNCTION trg_log_contas_receber_delete();

-- 7) Comentários na tabela
COMMENT ON TABLE public.contas_receber_log IS 
'Log detalhado de todas as operações na tabela contas_receber. Registra INSERT, UPDATE e DELETE com valores completos e alterações.';

COMMENT ON COLUMN public.contas_receber_log.evento_tipo IS 
'Tipo de evento: INSERT, UPDATE ou DELETE';

COMMENT ON COLUMN public.contas_receber_log.alteracoes IS 
'Para UPDATE: JSONB com as alterações no formato {"campo": {"de": "valor_antigo", "para": "valor_novo"}}';

COMMENT ON COLUMN public.contas_receber_log.valores_anteriores IS 
'Para UPDATE e DELETE: JSONB com todos os valores anteriores do registro';

-- 8) View para facilitar consultas do log
DROP VIEW IF EXISTS public.vw_contas_receber_log_detalhado CASCADE;

CREATE VIEW public.vw_contas_receber_log_detalhado AS
SELECT 
  log_id,
  evento_tipo,
  -- evento_data já está armazenado no horário de São Paulo (TIMESTAMP)
  evento_data AS evento_data_brasilia,
  conta_id,
  paciente_id,
  consulta_id,
  numero_documento,
  especie_documento,
  descricao,
  valor_original,
  valor_recebido,
  status,
  -- Mostrar alterações de forma legível (JSONB completo)
  alteracoes,
  valores_anteriores,
  usuario_id,
  criado_em,
  atualizado_em
FROM public.contas_receber_log
ORDER BY evento_data DESC;

COMMENT ON VIEW public.vw_contas_receber_log_detalhado IS 
'View para facilitar consultas do log de contas a receber. O campo evento_data_brasilia está armazenado no horário de São Paulo (TIMESTAMP sem timezone). Use jsonb_pretty(alteracoes) para visualizar as alterações de forma legível.';


