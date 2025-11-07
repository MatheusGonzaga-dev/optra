-- Tabela de vínculos entre parcerias e serviços com desconto/acréscimo
CREATE TABLE IF NOT EXISTS public.parcerias_servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parceria_id UUID NOT NULL REFERENCES public.parcerias(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  desconto_percentual DECIMAL(5,2) DEFAULT 0, -- desconto em porcentagem
  desconto_valor DECIMAL(10,2) DEFAULT 0, -- desconto em valor fixo
  acrescimo_percentual DECIMAL(5,2) DEFAULT 0, -- acréscimo em porcentagem
  acrescimo_valor DECIMAL(10,2) DEFAULT 0, -- acréscimo em valor fixo
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parceria_id, servico_id)
);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION trg_update_parcerias_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER parcerias_servicos_set_updated_at
BEFORE UPDATE ON public.parcerias_servicos
FOR EACH ROW EXECUTE FUNCTION trg_update_parcerias_servicos_updated_at();

CREATE INDEX IF NOT EXISTS idx_parcerias_servicos_parceria ON public.parcerias_servicos(parceria_id);
CREATE INDEX IF NOT EXISTS idx_parcerias_servicos_servico ON public.parcerias_servicos(servico_id);
CREATE INDEX IF NOT EXISTS idx_parcerias_servicos_ativo ON public.parcerias_servicos(ativo);



