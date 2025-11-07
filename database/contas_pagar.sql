-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações básicas
  fornecedor TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT, -- Categoria simples (pode ser expandida depois com tabela separada)
  
  -- Valores
  valor_titulo DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  acrescimo DECIMAL(10,2) DEFAULT 0,
  
  -- Datas
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Conta e status
  conta_corrente TEXT,
  status TEXT CHECK (status IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')) DEFAULT 'PENDENTE' NOT NULL,
  
  -- Recorrente
  recorrente BOOLEAN DEFAULT false NOT NULL,
  recorrencia_mensal INTEGER, -- número de meses para recorrência
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_por_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL
);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION trg_update_contas_pagar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER contas_pagar_set_updated_at
BEFORE UPDATE ON public.contas_pagar
FOR EACH ROW EXECUTE FUNCTION trg_update_contas_pagar_updated_at();

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON public.contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_ativo ON public.contas_pagar(ativo);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON public.contas_pagar(categoria);

