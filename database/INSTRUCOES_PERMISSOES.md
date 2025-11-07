# Sistema de Permissões e Grupos de Acesso

## Configuração Inicial

Para configurar o sistema de permissões, execute os seguintes scripts SQL **nesta ordem**:

### 1. Criar Estrutura de Tabelas

Execute o arquivo `grupos_acesso_permissoes.sql` no seu banco de dados PostgreSQL:

```bash
psql -U seu_usuario -d nome_do_banco -f database/grupos_acesso_permissoes.sql
```

Este script irá:
- Criar a tabela `grupos_acesso`
- Criar a tabela `permissoes`
- Criar a tabela `grupo_permissao` (relacionamento N:N)
- Adicionar a coluna `grupo_acesso_id` na tabela `usuarios`
- Criar triggers para atualizar `atualizado_em`
- Criar índices para otimização

### 2. Popular Permissões Iniciais

Execute o arquivo `permissoes_iniciais.sql`:

```bash
psql -U seu_usuario -d nome_do_banco -f database/permissoes_iniciais.sql
```

Este script irá:
- Criar todas as permissões do sistema
- Criar 3 grupos de acesso padrão:
  - **Administrador**: Acesso total (via código)
  - **Financeiro**: Acesso completo ao módulo financeiro
  - **Recepção**: Acesso à fila e cadastro de pacientes
- Vincular permissões aos grupos

## Estrutura de Permissões

As permissões seguem o padrão: `modulo.acao`

### Módulos Disponíveis

- **pacientes**: Gerenciamento de pacientes
- **fila**: Fila de atendimento
- **atendimentos**: Atendimentos/prontuários
- **contas_pagar**: Contas a pagar
- **contas_receber**: Contas a receber
- **servicos**: Serviços
- **parcerias**: Parcerias
- **categorias**: Categorias financeiras
- **relatorios**: Relatórios
- **usuarios**: Gerenciamento de usuários
- **grupos**: Grupos de acesso
- **dashboard**: Dashboard e métricas

### Ações Disponíveis

- **view**: Visualizar
- **create**: Criar
- **edit**: Editar
- **delete**: Excluir
- **manage**: Gerenciar (ações especiais)
- **pay/receive**: Efetuar pagamentos/recebimentos
- **export**: Exportar dados

### Exemplos de Permissões

```
pacientes.view          → Visualizar pacientes
pacientes.create        → Criar pacientes
contas_pagar.pay        → Efetuar pagamentos
relatorios.export       → Exportar relatórios
grupos.manage_permissions → Gerenciar permissões de grupos
```

## Como Usar

### 1. Criar um Novo Grupo

Acesse **Ferramentas > Grupos** no menu admin e clique em "Novo Grupo".

### 2. Atribuir Permissões ao Grupo

1. Na lista de grupos, clique em "Permissões"
2. Marque as permissões desejadas
3. As alterações são salvas automaticamente

### 3. Vincular Usuário a um Grupo

Ao cadastrar ou editar um usuário, selecione o grupo de acesso desejado.

### 4. Proteger Rotas no Frontend

Use o componente `ProtectedRoute` com as permissões necessárias:

```tsx
// Por permissão única
<Route path="/admin/expenses" element={
  <ProtectedRoute permission="contas_pagar.view">
    <AdminExpenses />
  </ProtectedRoute>
} />

// Por qualquer uma das permissões
<Route path="/admin/financial" element={
  <ProtectedRoute anyPermissions={['contas_pagar.view', 'contas_receber.view']}>
    <AdminFinancial />
  </ProtectedRoute>
} />

// Por todas as permissões
<Route path="/admin/reports" element={
  <ProtectedRoute allPermissions={['relatorios.view', 'relatorios.export']}>
    <AdminReports />
  </ProtectedRoute>
} />
```

### 5. Proteger Componentes no Frontend

Use o hook `usePermissions`:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('pacientes.edit') && (
        <Button>Editar Paciente</Button>
      )}
      
      {hasPermission('pacientes.delete') && (
        <Button variant="destructive">Excluir Paciente</Button>
      )}
    </div>
  );
}
```

## Importante

- **Administradores** (perfil `ADMINISTRADOR`) têm **todas as permissões** automaticamente, independente do grupo.
- Para funcionários com outros perfis, as permissões são controladas pelo grupo de acesso.
- Um usuário pode pertencer a apenas um grupo por vez.
- Se um usuário não tiver grupo associado, ele não terá nenhuma permissão (exceto admins).

## Adicionando Novas Permissões

Para adicionar uma nova permissão ao sistema:

1. Insira a permissão no banco de dados:

```sql
INSERT INTO public.permissoes (nome, descricao) 
VALUES ('novo_modulo.acao', 'Descrição da permissão');
```

2. Vincule a permissão aos grupos desejados via interface web em **Ferramentas > Grupos**.

3. Proteja as rotas/componentes usando o novo código de permissão.

## Troubleshooting

### Usuário não consegue acessar uma tela

1. Verifique se o usuário tem um grupo associado (tabela `usuarios`, coluna `grupo_acesso_id`)
2. Verifique se o grupo tem a permissão necessária (tabela `grupo_permissao`)
3. Verifique se a rota está protegida com a permissão correta
4. Limpe o cache e faça logout/login novamente

### Permissões não estão sendo carregadas

1. Verifique se as tabelas foram criadas corretamente
2. Verifique se o script `permissoes_iniciais.sql` foi executado
3. Verifique os logs do backend para erros
4. Teste a query diretamente no banco:

```sql
SELECT p.nome 
FROM grupo_permissao gp
JOIN permissoes p ON gp.permissao_id = p.id
WHERE gp.grupo_id = 'ID_DO_GRUPO';
```

## Estrutura de Banco de Dados

```
grupos_acesso
├── id (UUID)
├── nome (TEXT, UNIQUE)
├── descricao (TEXT)
├── ativo (BOOLEAN)
├── criado_em (TIMESTAMPTZ)
└── atualizado_em (TIMESTAMPTZ)

permissoes
├── id (UUID)
├── nome (TEXT, UNIQUE)
├── descricao (TEXT)
├── criado_em (TIMESTAMPTZ)
└── atualizado_em (TIMESTAMPTZ)

grupo_permissao (N:N)
├── grupo_id (UUID FK → grupos_acesso.id)
├── permissao_id (UUID FK → permissoes.id)
└── criado_em (TIMESTAMPTZ)
└── PRIMARY KEY (grupo_id, permissao_id)

usuarios
└── grupo_acesso_id (UUID FK → grupos_acesso.id) [NOVO]
```

