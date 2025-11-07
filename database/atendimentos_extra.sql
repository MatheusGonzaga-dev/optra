-- Tabelas auxiliares para prontuário e ordem de serviço

-- PRONTUÁRIOS
CREATE TABLE IF NOT EXISTS public.prontuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fila_id UUID NOT NULL REFERENCES public.fila_atendimento(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  optometrista_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  prescricao_json JSONB NOT NULL,
  observacoes TEXT,
  recomendacoes TEXT,
  data_retorno TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON public.prontuarios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_fila ON public.prontuarios(fila_id);

-- ORDENS DE SERVIÇO
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fila_id UUID NOT NULL REFERENCES public.fila_atendimento(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  parceria_id UUID REFERENCES public.parcerias(id) ON DELETE SET NULL,
  descricao_servico TEXT NOT NULL,
  valor_base DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  acrescimo DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Adicionar coluna parceria_id se não existir (migration safe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordens_servico' AND column_name = 'parceria_id'
  ) THEN
    ALTER TABLE public.ordens_servico 
    ADD COLUMN parceria_id UUID REFERENCES public.parcerias(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_os_paciente ON public.ordens_servico(paciente_id);
CREATE INDEX IF NOT EXISTS idx_os_fila ON public.ordens_servico(fila_id);


