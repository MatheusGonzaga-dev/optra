# Guia de Teste - Sistema de Permissões

## 🎯 Objetivo
Este guia explica como testar o sistema de controle granular de permissões no Optra Vision.

## 📋 Pré-requisitos

1. **Banco de dados atualizado** com as tabelas:
   - `grupos_acesso`
   - `permissoes`
   - `grupo_permissoes`
   - Coluna `grupo_acesso_id` na tabela `usuarios`

2. **Scripts SQL executados**:
   - `database/grupos_acesso_permissoes.sql`
   - `database/permissoes_iniciais.sql`

## 🔧 Configuração Inicial

### 1. Verificar Permissões no Banco
Execute no Supabase SQL Editor:

```sql
-- Verificar se as permissões foram criadas
SELECT COUNT(*) as total_permissoes FROM public.permissoes;

-- Listar todas as permissões
SELECT codigo, nome, modulo FROM public.permissoes ORDER BY modulo, nome;

-- Verificar grupos de acesso criados
SELECT * FROM public.grupos_acesso;
```

### 2. Criar um Grupo de Teste

1. Acesse o sistema como **Administrador**
2. Vá em **Ferramentas > Grupos**
3. Clique em **Novo Grupo**
4. Preencha:
   - **Nome**: Teste Financeiro
   - **Descrição**: Grupo de teste com acesso apenas ao financeiro
5. Clique em **Salvar**

### 3. Configurar Permissões do Grupo

1. Na lista de grupos, clique em **Permissões** no grupo "Teste Financeiro"
2. Marque apenas as seguintes permissões:
   - **Dashboard > Ativo** ✅
   - **Financeiro > Contas a Pagar > Ativo** ✅
   - **Financeiro > Contas a Pagar > Inserir** ✅
   - **Financeiro > Contas a Receber > Ativo** ✅
3. Clique em **Salvar**

### 4. Criar Usuário de Teste

1. Vá em **Ferramentas > Acessos**
2. Clique em **Novo Funcionário**
3. Preencha:
   - **Nome Completo**: Teste Financeiro
   - **Email**: teste.financeiro@optra.com
   - **CPF**: 000.000.000-00
   - **Perfil**: Administrador (⚠️ Importante: não será admin de verdade, as permissões serão controladas pelo grupo)
   - **Grupo de Acesso**: Teste Financeiro
4. Salve

5. **Criar a conta no Supabase Authentication**:
   - Acesse o Supabase Dashboard
   - Vá em Authentication > Users
   - Clique em "Add user"
   - Email: `teste.financeiro@optra.com`
   - Senha: `teste123`
   - Auto Confirm User: ✅

## ✅ Testes a Realizar

### Teste 1: Login com Usuário Restrito

1. **Fazer logout** do sistema
2. **Fazer login** com:
   - Email: `teste.financeiro@optra.com`
   - Senha: `teste123`
3. **Verificar no console do navegador** (F12):
   ```
   Permissões carregadas: ["dashboard.view", "contas_pagar.view", "contas_pagar.create", "contas_receber.view"]
   ```

### Teste 2: Sidebar Filtrada

Ao fazer login, o menu lateral deve mostrar **APENAS**:
- ✅ Dashboard
- ✅ Financeiro
  - ✅ Contas a Pagar
  - ✅ Contas a Receber

**NÃO deve aparecer**:
- ❌ Atendimento
- ❌ Cadastros (Pacientes, Parcerias, etc.)
- ❌ Ferramentas
- ❌ Relatórios
- ❌ Configurações

### Teste 3: Acesso Direto por URL

Tente acessar diretamente URLs restritas:

1. Digite na barra de endereços: `/admin/patients`
   - **Resultado esperado**: Deve redirecionar para uma página de "Acesso Negado" ou Dashboard

2. Digite: `/admin/queue`
   - **Resultado esperado**: Deve redirecionar para uma página de "Acesso Negado" ou Dashboard

3. Digite: `/admin/expenses`
   - **Resultado esperado**: Deve funcionar normalmente ✅

### Teste 4: Botões de Ação nas Páginas

1. Acesse **Contas a Pagar**
2. Verifique que:
   - ✅ Botão "Nova Despesa" está visível (tem permissão `create`)
   - ✅ Lista de despesas está visível
   - ❌ Botões de "Editar" NÃO aparecem (não tem permissão `edit`)
   - ❌ Botões de "Excluir" NÃO aparecem (não tem permissão `delete`)

### Teste 5: Administrador Tem Tudo

1. Faça logout
2. Faça login com sua conta de **Administrador** (perfil = ADMINISTRADOR)
3. Verifique que **TODOS** os menus aparecem, independente de ter ou não grupo de acesso configurado

## 🐛 Troubleshooting

### Problema: Menu não filtra

**Solução**:
1. Abra o Console do navegador (F12)
2. Verifique se aparece: `Permissões carregadas: [...]`
3. Se o array estiver vazio, verifique:
   - Se o usuário tem `grupo_acesso_id` preenchido
   - Se o grupo tem permissões associadas na tabela `grupo_permissoes`

### Problema: Erro ao buscar permissões

**Verifique**:
```sql
-- Ver se o usuário tem grupo
SELECT id, nome_completo, email, perfil, grupo_acesso_id 
FROM usuarios 
WHERE email = 'teste.financeiro@optra.com';

-- Ver permissões do grupo
SELECT gp.*, p.codigo, p.nome
FROM grupo_permissoes gp
JOIN permissoes p ON p.id = gp.permissao_id
WHERE gp.grupo_id = 'SEU_GRUPO_ID_AQUI';
```

### Problema: Nome da tabela incorreto

Se aparecer erro `relation "grupo_permissao" does not exist`:

**Correção**: A tabela correta é `grupo_permissoes` (com S no final)

## 📊 Estrutura das Permissões

### Formato do Código de Permissão
```
modulo.acao
```

**Exemplos**:
- `pacientes.view` - Visualizar pacientes
- `pacientes.create` - Criar pacientes
- `contas_pagar.pay` - Efetuar pagamentos
- `fila.manage` - Gerenciar fila

### Módulos Disponíveis

| Módulo | Permissões Principais |
|--------|----------------------|
| `dashboard` | `view`, `view_financial` |
| `pacientes` | `view`, `create`, `edit`, `delete` |
| `fila` | `view`, `manage` |
| `atendimentos` | `view`, `create`, `edit` |
| `contas_pagar` | `view`, `create`, `edit`, `delete`, `pay` |
| `contas_receber` | `view`, `create`, `edit`, `delete`, `receive` |
| `servicos` | `view`, `create`, `edit`, `delete` |
| `parcerias` | `view`, `create`, `edit`, `delete` |
| `categorias` | `view`, `create`, `edit`, `delete` |
| `grupos` | `view`, `create`, `edit`, `delete`, `manage_permissions` |
| `usuarios` | `view`, `create`, `edit`, `delete` |
| `relatorios` | `view`, `export` |

## 🎓 Cenários de Uso Reais

### Cenário 1: Recepcionista
**Permissões recomendadas**:
- `dashboard.view`
- `pacientes.view`, `pacientes.create`, `pacientes.edit`
- `fila.view`, `fila.manage`
- `atendimentos.view`

### Cenário 2: Financeiro
**Permissões recomendadas**:
- `dashboard.view`, `dashboard.view_financial`
- `contas_pagar.view`, `contas_pagar.create`, `contas_pagar.edit`, `contas_pagar.pay`
- `contas_receber.view`, `contas_receber.create`, `contas_receber.edit`, `contas_receber.receive`
- `categorias.view`
- `relatorios.view`, `relatorios.export`

### Cenário 3: Optometrista
**Permissões recomendadas**:
- `dashboard.view`
- `fila.view`
- `atendimentos.view`, `atendimentos.create`, `atendimentos.edit`
- `pacientes.view`

### Cenário 4: Gerente
**Permissões recomendadas**:
- Todas as permissões ✅
- Ou simplesmente definir `perfil = 'ADMINISTRADOR'`

## 📝 Notas Importantes

1. **Perfil ADMINISTRADOR** sempre tem acesso total, independente do grupo
2. **Grupos vazios** (sem permissões) = usuário não vê nenhum menu
3. **Permissões são aditivas**: ter `view` + `create` significa poder ver E criar
4. **Rotas protegidas**: Além do menu, as rotas no frontend também verificam permissões via `ProtectedRoute`

## 🚀 Próximos Passos

Após os testes básicos funcionarem:

1. Proteger botões de ação nas páginas (Editar, Excluir, etc.)
2. Proteger seções específicas do Dashboard (ex: métricas financeiras)
3. Adicionar permissões para exportação de relatórios
4. Implementar log de auditoria de ações dos usuários

