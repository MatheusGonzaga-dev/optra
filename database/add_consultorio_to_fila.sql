-- Adicionar coluna consultorio_id à tabela fila_atendimento
ALTER TABLE public.fila_atendimento
ADD COLUMN IF NOT EXISTS consultorio_id UUID REFERENCES public.consultorios(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fila_consultorio_id ON public.fila_atendimento(consultorio_id);

-- Comentário
COMMENT ON COLUMN public.fila_atendimento.consultorio_id IS 'ID do consultório onde o paciente está sendo atendido';

