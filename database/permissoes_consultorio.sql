-- Permissões para Consultórios
INSERT INTO public.permissoes (codigo, nome, descricao, modulo)
VALUES
  ('consultorio.selecionar', 'Selecionar consultório', 'Obriga o profissional a selecionar um consultório ao fazer login', 'Consultórios'),
  ('consultorio.view', 'Visualizar consultórios', 'Permite visualizar consultórios', 'Consultórios'),
  ('consultorio.create', 'Criar consultórios', 'Permite cadastrar novos consultórios', 'Consultórios'),
  ('consultorio.edit', 'Editar consultórios', 'Permite editar consultórios', 'Consultórios'),
  ('consultorio.delete', 'Excluir consultórios', 'Permite excluir consultórios', 'Consultórios')
ON CONFLICT (codigo) DO NOTHING;


