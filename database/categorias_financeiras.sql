-- ===========================
-- TABELAS DE CATEGORIAS FINANCEIRAS
-- ===========================

-- Tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('RECEITA', 'DESPESA')) NOT NULL DEFAULT 'DESPESA',
  cor TEXT DEFAULT '#3b82f6', -- Cor em hexadecimal para UI
  icone TEXT, -- Nome do ícone (lucide-react)
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMPTZ
);

-- Tabela de subcategorias financeiras
CREATE TABLE IF NOT EXISTS public.subcategorias_financeiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID NOT NULL REFERENCES public.categorias_financeiras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deletado_em TIMESTAMPTZ
);

-- Triggers para atualizar atualizado_em
CREATE OR REPLACE FUNCTION trg_update_categorias_financeiras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER categorias_financeiras_set_updated_at
BEFORE UPDATE ON public.categorias_financeiras
FOR EACH ROW EXECUTE FUNCTION trg_update_categorias_financeiras_updated_at();

CREATE TRIGGER subcategorias_financeiras_set_updated_at
BEFORE UPDATE ON public.subcategorias_financeiras
FOR EACH ROW EXECUTE FUNCTION trg_update_categorias_financeiras_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON public.categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_ativo ON public.categorias_financeiras(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_deletado ON public.categorias_financeiras((deletado_em IS NULL));

CREATE INDEX IF NOT EXISTS idx_subcategorias_financeiras_categoria ON public.subcategorias_financeiras(categoria_id);
CREATE INDEX IF NOT EXISTS idx_subcategorias_financeiras_ativo ON public.subcategorias_financeiras(ativo);
CREATE INDEX IF NOT EXISTS idx_subcategorias_financeiras_deletado ON public.subcategorias_financeiras((deletado_em IS NULL));

-- Comentários
COMMENT ON TABLE public.categorias_financeiras IS 'Categorias para classificação de receitas e despesas';
COMMENT ON TABLE public.subcategorias_financeiras IS 'Subcategorias vinculadas a categorias financeiras';
