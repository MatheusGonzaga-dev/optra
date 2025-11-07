-- ===========================
-- DADOS INICIAIS: CATEGORIAS E SUBCATEGORIAS DE DESPESAS
-- ===========================

-- Inserir categorias padrão de despesas (ignora se já existir)
INSERT INTO public.categorias_financeiras (nome, tipo, cor, icone, descricao, ativo)
SELECT * FROM (VALUES
  ('Fornecedores', 'DESPESA', '#ef4444', 'Building2', 'Despesas com fornecedores e compras', true),
  ('Aluguel e Condomínio', 'DESPESA', '#f59e0b', 'Home', 'Despesas com aluguel e condomínio', true),
  ('Utilidades', 'DESPESA', '#3b82f6', 'Zap', 'Água, energia, telefone, internet', true),
  ('Material de Escritório', 'DESPESA', '#8b5cf6', 'Briefcase', 'Papelaria e materiais de escritório', true),
  ('Equipamentos', 'DESPESA', '#06b6d4', 'Wrench', 'Compra e manutenção de equipamentos', true),
  ('Marketing e Publicidade', 'DESPESA', '#ec4899', 'Megaphone', 'Publicidade e divulgação', true),
  ('Profissionais e Serviços', 'DESPESA', '#10b981', 'Users', 'Honorários e serviços terceirizados', true),
  ('Impostos e Taxas', 'DESPESA', '#6366f1', 'FileText', 'Impostos, taxas e tributos', true),
  ('Transporte e Combustível', 'DESPESA', '#14b8a6', 'Car', 'Transporte e deslocamento', true),
  ('Outras Despesas', 'DESPESA', '#64748b', 'MoreHorizontal', 'Outras despesas diversas', true)
) AS v(nome, tipo, cor, icone, descricao, ativo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias_financeiras c 
  WHERE c.nome = v.nome AND c.tipo = v.tipo
);

-- Inserir subcategorias para cada categoria
-- Fornecedores
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Fornecedor de Lentes', 'Fornecedores de lentes oftálmicas'),
  ('Fornecedor de Armações', 'Fornecedores de armações'),
  ('Fornecedor de Equipamentos', 'Fornecedores de equipamentos ópticos'),
  ('Fornecedor de Materiais', 'Outros materiais e suprimentos')
) AS sc(nome, descricao)
  WHERE c.nome = 'Fornecedores'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Aluguel e Condomínio
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Aluguel', 'Valor do aluguel do imóvel'),
  ('Condomínio', 'Taxa de condomínio'),
  ('IPTU', 'Imposto Predial e Territorial Urbano'),
  ('Seguro do Imóvel', 'Seguro do imóvel')
) AS sc(nome, descricao)
  WHERE c.nome = 'Aluguel e Condomínio'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Utilidades
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Energia Elétrica', 'Conta de energia elétrica'),
  ('Água e Esgoto', 'Conta de água e esgoto'),
  ('Telefone Fixo', 'Telefonia fixa'),
  ('Internet', 'Serviço de internet'),
  ('Celular', 'Telefonia móvel')
) AS sc(nome, descricao)
  WHERE c.nome = 'Utilidades'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Material de Escritório
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Papelaria', 'Papéis e material de escritório'),
  ('Impressão', 'Cartuchos e serviços de impressão'),
  ('Material de Limpeza', 'Produtos de limpeza'),
  ('Material de Higiene', 'Produtos de higiene')
) AS sc(nome, descricao)
  WHERE c.nome = 'Material de Escritório'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Equipamentos
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Manutenção de Equipamentos', 'Manutenção e reparos'),
  ('Compra de Equipamentos', 'Aquisição de novos equipamentos'),
  ('Calibração', 'Calibração de equipamentos'),
  ('Assistência Técnica', 'Serviços de assistência técnica')
) AS sc(nome, descricao)
  WHERE c.nome = 'Equipamentos'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Marketing e Publicidade
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Anúncios Online', 'Google Ads, Facebook Ads, etc'),
  ('Panfletos e Materiais', 'Materiais impressos de divulgação'),
  ('Placas e Sinalização', 'Placas e sinalização externa'),
  ('Redes Sociais', 'Gestão de redes sociais')
) AS sc(nome, descricao)
  WHERE c.nome = 'Marketing e Publicidade'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Profissionais e Serviços
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Contador', 'Serviços contábeis'),
  ('Advogado', 'Serviços jurídicos'),
  ('Limpeza', 'Serviços de limpeza'),
  ('Segurança', 'Serviços de segurança'),
  ('Consultoria', 'Serviços de consultoria')
) AS sc(nome, descricao)
  WHERE c.nome = 'Profissionais e Serviços'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Impostos e Taxas
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('ISS', 'Imposto Sobre Serviços'),
  ('ICMS', 'Imposto sobre Circulação de Mercadorias'),
  ('IRPJ', 'Imposto de Renda Pessoa Jurídica'),
  ('CSLL', 'Contribuição Social sobre Lucro Líquido'),
  ('Taxas Municipais', 'Taxas e licenças municipais')
) AS sc(nome, descricao)
  WHERE c.nome = 'Impostos e Taxas'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );

-- Transporte e Combustível
INSERT INTO public.subcategorias_financeiras (categoria_id, nome, descricao, ativo)
SELECT c.id, sc.nome, sc.descricao, true
FROM public.categorias_financeiras c,
(VALUES
  ('Combustível', 'Abastecimento de veículos'),
  ('Manutenção de Veículos', 'Manutenção de veículos'),
  ('Estacionamento', 'Gastos com estacionamento'),
  ('Transporte de Mercadorias', 'Frete e transporte')
) AS sc(nome, descricao)
  WHERE c.nome = 'Transporte e Combustível'
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategorias_financeiras s 
    WHERE s.categoria_id = c.id AND s.nome = sc.nome
  );
