-- Tabela para gerenciar a fila de atendimento
CREATE TABLE IF NOT EXISTS public.fila_atendimento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  posicao INTEGER NOT NULL,
  tipo_atendimento TEXT CHECK (tipo_atendimento IN ('CONSULTA_COMPLETA', 'REFRACAO', 'RETORNO', 'EXAME_LENTE_CONTATO')) NOT NULL,
  status TEXT CHECK (status IN ('AGUARDANDO', 'EM_ATENDIMENTO', 'ATENDIDO', 'CANCELADO')) DEFAULT 'AGUARDANDO' NOT NULL,
  prioridade TEXT CHECK (prioridade IN ('NORMAL', 'ALTA', 'URGENTE')) DEFAULT 'NORMAL' NOT NULL,
  
  -- Anamnese
  sintomas TEXT,
  usa_medicamentos BOOLEAN DEFAULT false,
  medicamentos_lista TEXT,
  
  -- Informações de atendimento
  optometrista_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  hora_chegada TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  hora_chamada TIMESTAMPTZ,
  hora_inicio_atendimento TIMESTAMPTZ,
  hora_fim_atendimento TIMESTAMPTZ,
  tempo_espera_minutos INTEGER,
  
  -- Pagamento
  valor_consulta DECIMAL(10,2),
  forma_pagamento TEXT CHECK (forma_pagamento IN ('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'CONVENIO', 'PENDENTE')),
  pagamento_confirmado BOOLEAN DEFAULT false,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  cadastrado_por_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fila_paciente_id ON public.fila_atendimento(paciente_id);
CREATE INDEX IF NOT EXISTS idx_fila_status ON public.fila_atendimento(status);
CREATE INDEX IF NOT EXISTS idx_fila_posicao ON public.fila_atendimento(posicao);
CREATE INDEX IF NOT EXISTS idx_fila_hora_chegada ON public.fila_atendimento(hora_chegada);
CREATE INDEX IF NOT EXISTS idx_fila_ativo ON public.fila_atendimento(ativo);

-- Trigger para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION update_fila_atendimento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_fila_atendimento_timestamp
BEFORE UPDATE ON public.fila_atendimento
FOR EACH ROW
EXECUTE FUNCTION update_fila_atendimento_updated_at();

-- Função para calcular tempo de espera
CREATE OR REPLACE FUNCTION calcular_tempo_espera()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hora_inicio_atendimento IS NOT NULL AND OLD.hora_inicio_atendimento IS NULL THEN
    NEW.tempo_espera_minutos = EXTRACT(EPOCH FROM (NEW.hora_inicio_atendimento - NEW.hora_chegada))/60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_tempo_espera
BEFORE UPDATE ON public.fila_atendimento
FOR EACH ROW
EXECUTE FUNCTION calcular_tempo_espera();

-- RLS (Row Level Security) - Opcional, ajuste conforme sua política
ALTER TABLE public.fila_atendimento ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários podem ver fila" ON public.fila_atendimento
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir inserção para secretárias e administradores
CREATE POLICY "Secretárias e admins podem adicionar à fila" ON public.fila_atendimento
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('SECRETARIA', 'ADMINISTRADOR')
    )
  );

-- Política para permitir atualização para secretárias, optometristas e administradores
CREATE POLICY "Profissionais podem atualizar fila" ON public.fila_atendimento
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('SECRETARIA', 'OPTOMETRISTA', 'ADMINISTRADOR')
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.fila_atendimento IS 'Gerencia a fila de atendimento de pacientes';
COMMENT ON COLUMN public.fila_atendimento.posicao IS 'Posição do paciente na fila (1 = primeiro)';
COMMENT ON COLUMN public.fila_atendimento.tempo_espera_minutos IS 'Tempo de espera calculado automaticamente';

