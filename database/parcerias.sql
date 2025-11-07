-- Tabela de parcerias (óticas e profissionais)
CREATE TABLE IF NOT EXISTS public.parcerias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj_cpf TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  data_parceria DATE DEFAULT CURRENT_DATE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION trg_update_parcerias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER parcerias_set_updated_at
BEFORE UPDATE ON public.parcerias
FOR EACH ROW EXECUTE FUNCTION trg_update_parcerias_updated_at();

CREATE INDEX IF NOT EXISTS idx_parcerias_ativo ON public.parcerias(ativo);
CREATE INDEX IF NOT EXISTS idx_parcerias_nome ON public.parcerias(nome);



