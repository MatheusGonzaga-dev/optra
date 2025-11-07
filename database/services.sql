-- Tabela de serviços/procedimentos da clínica
CREATE TABLE IF NOT EXISTS public.servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_retorno DECIMAL(10,2),
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_update_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER servicos_set_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW EXECUTE FUNCTION trg_update_servicos_updated_at();

CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON public.servicos(ativo);


