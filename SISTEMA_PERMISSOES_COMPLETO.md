# Sistema de Permissões e Grupos de Acesso - Implementação Completa

## ✅ O Que Foi Implementado

### 1. **Banco de Dados**

#### Tabelas Criadas
- `grupos_acesso`: Armazena os grupos de permissões
- `permissoes`: Lista todas as permissões do sistema
- `grupo_permissao`: Relacionamento N:N entre grupos e permissões
- `usuarios.grupo_acesso_id`: Nova coluna para vincular usuário ao grupo

#### Scripts SQL
- **`database/grupos_acesso_permissoes.sql`**: Estrutura das tabelas
- **`database/permissoes_iniciais.sql`**: Popular permissões e grupos padrão
- **`database/INSTRUCOES_PERMISSOES.md`**: Documentação completa

### 2. **Backend (Node.js/Express)**

#### Rotas Implementadas (`server/src/routes/grupos.ts`)
```
GET    /grupos                      → Listar todos os grupos
GET    /grupos/:id                  → Buscar grupo específico
GET    /grupos/:id/permissoes       → Listar permissões de um grupo
POST   /grupos                      → Criar novo grupo
PUT    /grupos/:id                  → Atualizar grupo
DELETE /grupos/:id                  → Excluir grupo (soft delete)

GET    /grupos/permissoes           → Listar todas as permissões
POST   /grupos/grupo-permissoes     → Adicionar permissão a grupo
DELETE /grupos/grupo-permissoes     → Remover permissão de grupo
```

### 3. **Frontend (React/TypeScript)**

#### Componentes Criados/Atualizados

**`src/contexts/AuthContext.tsx`**
- Adiciona carregamento de permissões do usuário
- Busca permissões do grupo ao fazer login
- Armazena permissões no contexto

**`src/hooks/usePermissions.ts`** (Novo)
- Hook customizado para verificar permissões
- Métodos: `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
- Admin tem todas as permissões automaticamente

**`src/components/ProtectedRoute.tsx`** (Atualizado)
- Suporta proteção por perfil (legado) e por permissão (novo)
- Compatível com código existente
- Redireciona para `/unauthorized` se não tiver acesso

**`src/pages/admin/Groups.tsx`** (Novo)
- Interface completa para gerenciar grupos de acesso
- CRUD de grupos
- Gerenciamento de permissões por grupo
- Interface intuitiva com checkboxes

**`src/components/AddStaffDialog.tsx`** (Atualizado)
- Adiciona campo para selecionar grupo de acesso
- Carrega grupos disponíveis do backend
- Envia `grupo_acesso_id` ao cadastrar funcionário

**`src/components/DashboardLayout.tsx`** (Atualizado)
- Adiciona menu "Grupos" em Ferramentas > Grupos
- Ícone Shield para grupos

**`src/App.tsx`** (Atualizado)
- Adiciona rota `/admin/groups`
- Protegida para administradores

### 4. **Permissões Disponíveis**

Total: **34 permissões** organizadas em **11 módulos**:

#### Pacientes
- `pacientes.view`, `pacientes.create`, `pacientes.edit`, `pacientes.delete`

#### Fila de Atendimento
- `fila.view`, `fila.manage`

#### Atendimentos
- `atendimentos.view`, `atendimentos.create`, `atendimentos.edit`

#### Contas a Pagar
- `contas_pagar.view`, `contas_pagar.create`, `contas_pagar.edit`, `contas_pagar.delete`, `contas_pagar.pay`

#### Contas a Receber
- `contas_receber.view`, `contas_receber.create`, `contas_receber.edit`, `contas_receber.delete`, `contas_receber.receive`

#### Serviços
- `servicos.view`, `servicos.create`, `servicos.edit`, `servicos.delete`

#### Parcerias
- `parcerias.view`, `parcerias.create`, `parcerias.edit`, `parcerias.delete`

#### Categorias
- `categorias.view`, `categorias.create`, `categorias.edit`, `categorias.delete`

#### Relatórios
- `relatorios.view`, `relatorios.export`

#### Usuários
- `usuarios.view`, `usuarios.create`, `usuarios.edit`, `usuarios.delete`

#### Grupos
- `grupos.view`, `grupos.create`, `grupos.edit`, `grupos.delete`, `grupos.manage_permissions`

#### Dashboard
- `dashboard.view`, `dashboard.view_financial`

### 5. **Grupos Padrão Criados**

1. **Administrador**
   - Acesso total via código (não precisa de permissões)

2. **Financeiro**
   - Todas as permissões de `contas_pagar.*` e `contas_receber.*`
   - Permissão de visualizar dashboard

3. **Recepção**
   - Permissões: `pacientes.view`, `pacientes.create`, `pacientes.edit`
   - Permissões: `fila.view`, `fila.manage`
   - Permissão de visualizar dashboard

## 🚀 Como Usar

### Passo 1: Executar Scripts SQL

```bash
# 1. Criar estrutura
psql -U seu_usuario -d nome_do_banco -f database/grupos_acesso_permissoes.sql

# 2. Popular permissões
psql -U seu_usuario -d nome_do_banco -f database/permissoes_iniciais.sql
```

### Passo 2: Acessar Interface de Grupos

1. Faça login como **Administrador**
2. Acesse **Ferramentas > Grupos**
3. Crie novos grupos conforme necessário
4. Configure permissões de cada grupo

### Passo 3: Vincular Usuários aos Grupos

1. Ao cadastrar funcionário, selecione o **Grupo de Permissões**
2. O funcionário terá apenas as permissões do grupo selecionado
3. Administradores sempre têm todas as permissões

### Passo 4: Proteger Novas Rotas

#### No Frontend
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Proteger rota
<Route path="/nova-rota" element={
  <ProtectedRoute permission="modulo.acao">
    <NovaPagina />
  </ProtectedRoute>
} />

// Proteger componente
import { usePermissions } from "@/hooks/usePermissions";

function MeuComponente() {
  const { hasPermission } = usePermissions();
  
  return (
    <>
      {hasPermission('pacientes.edit') && (
        <Button>Editar</Button>
      )}
    </>
  );
}
```

## 📋 Checklist de Implementação

- [x] Criar tabelas no banco de dados
- [x] Criar permissões iniciais
- [x] Criar grupos padrão
- [x] Implementar rotas de backend para grupos
- [x] Implementar rotas de backend para permissões
- [x] Atualizar AuthContext para carregar permissões
- [x] Criar hook usePermissions
- [x] Atualizar ProtectedRoute para suportar permissões
- [x] Criar página de gerenciamento de grupos
- [x] Adicionar menu de grupos no layout
- [x] Atualizar cadastro de funcionários para incluir grupos
- [x] Criar documentação completa

## 🎯 Próximos Passos (Opcional)

### Melhorias Futuras
1. **Audit Log**: Registrar quem alterou permissões e quando
2. **Permissões por Usuário**: Além de grupos, permitir permissões individuais
3. **Hierarquia de Grupos**: Grupos que herdam de outros grupos
4. **Interface de Permissões por Módulo**: Agrupar visualmente por módulo
5. **Cache de Permissões**: Melhorar performance com cache local

### Integração com Telas Existentes

Para proteger as telas atuais do sistema, você pode:

1. **Identificar as ações**: Liste todas as ações por tela
2. **Atribuir permissões**: Use o padrão `modulo.acao`
3. **Proteger rotas**: Adicione `ProtectedRoute` nas rotas
4. **Proteger botões**: Use `usePermissions` nos componentes

#### Exemplo: Proteger Tela de Pacientes

```tsx
// No App.tsx
<Route path="/admin/patients" element={
  <ProtectedRoute permission="pacientes.view">
    <PatientList />
  </ProtectedRoute>
} />

// No componente PatientList
const { hasPermission } = usePermissions();

return (
  <>
    {hasPermission('pacientes.create') && (
      <Button onClick={handleAdd}>Novo Paciente</Button>
    )}
    
    {hasPermission('pacientes.edit') && (
      <Button onClick={handleEdit}>Editar</Button>
    )}
    
    {hasPermission('pacientes.delete') && (
      <Button onClick={handleDelete}>Excluir</Button>
    )}
  </>
);
```

## ⚠️ Observações Importantes

1. **Administradores**: Sempre têm todas as permissões, independente do grupo
2. **Sem Grupo**: Se um usuário não tiver grupo, não terá nenhuma permissão (exceto admins)
3. **Backward Compatibility**: O sistema continua funcionando com `allowedProfiles` para manter compatibilidade
4. **Performance**: As permissões são carregadas uma vez no login e armazenadas no contexto

## 📚 Documentação Adicional

- **`database/INSTRUCOES_PERMISSOES.md`**: Guia detalhado de uso
- **`database/grupos_acesso_permissoes.sql`**: Estrutura das tabelas
- **`database/permissoes_iniciais.sql`**: Dados iniciais

---

**Sistema implementado com sucesso! ✅**

Todas as funcionalidades estão prontas para uso. Basta executar os scripts SQL e começar a configurar os grupos de acesso.

