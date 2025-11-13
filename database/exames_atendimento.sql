-- Tabela para armazenar exames realizados durante o atendimento
CREATE TABLE IF NOT EXISTS public.exames_atendimento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fila_id UUID NOT NULL REFERENCES public.fila_atendimento(id) ON DELETE CASCADE,
  prontuario_id UUID REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nome_exame TEXT NOT NULL,
  resultado TEXT NOT NULL,
  observacoes TEXT,
  data_realizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_exames_fila_id ON public.exames_atendimento(fila_id);
CREATE INDEX IF NOT EXISTS idx_exames_prontuario_id ON public.exames_atendimento(prontuario_id);
CREATE INDEX IF NOT EXISTS idx_exames_paciente_id ON public.exames_atendimento(paciente_id);

-- Trigger para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION update_exames_atendimento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_exames_atendimento_timestamp
BEFORE UPDATE ON public.exames_atendimento
FOR EACH ROW
EXECUTE FUNCTION update_exames_atendimento_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.exames_atendimento ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários podem ver exames" ON public.exames_atendimento
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir inserção para profissionais
CREATE POLICY "Profissionais podem adicionar exames" ON public.exames_atendimento
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('OPTOMETRISTA', 'ADMINISTRADOR')
    )
  );

-- Política para permitir atualização para profissionais
CREATE POLICY "Profissionais podem atualizar exames" ON public.exames_atendimento
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('OPTOMETRISTA', 'ADMINISTRADOR')
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.exames_atendimento IS 'Armazena exames realizados durante atendimentos';
COMMENT ON COLUMN public.exames_atendimento.nome_exame IS 'Nome do exame realizado (Refração, Tonometria, etc)';
COMMENT ON COLUMN public.exames_atendimento.resultado IS 'Resultado ou descrição do exame';


