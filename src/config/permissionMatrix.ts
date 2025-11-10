export type PermissionActionKey = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'pay' | 'receive' | 'export';

export interface PermissionActionDefinition {
  label: string;
  permission: string;
}

export interface PermissionMenuDefinition {
  label: string;
  actions: Record<PermissionActionKey, PermissionActionDefinition | undefined>;
  extraActions?: PermissionActionDefinition[];
}

export type PermissionMatrix = Record<string, Record<string, PermissionMenuDefinition>>;

export const permissionMatrix: PermissionMatrix = {
  Cadastros: {
    Pacientes: {
      label: 'Pacientes',
      actions: {
        view: { label: 'Ativo', permission: 'pacientes.view' },
        create: { label: 'Inserir', permission: 'pacientes.create' },
        edit: { label: 'Alterar', permission: 'pacientes.edit' },
        delete: { label: 'Apagar', permission: 'pacientes.delete' },
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    Funcionarios: {
      label: 'Funcionários',
      actions: {
        view: { label: 'Ativo', permission: 'usuarios.view' },
        create: { label: 'Inserir', permission: 'usuarios.create' },
        edit: { label: 'Alterar', permission: 'usuarios.edit' },
        delete: { label: 'Apagar', permission: 'usuarios.delete' },
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    'Grupo de Acesso': {
      label: 'Grupo de Acesso',
      actions: {
        view: { label: 'Ativo', permission: 'grupos.view' },
        create: { label: 'Inserir', permission: 'grupos.create' },
        edit: { label: 'Alterar', permission: 'grupos.edit' },
        delete: { label: 'Apagar', permission: 'grupos.delete' },
        manage: { label: 'Gerenciar Permissões', permission: 'grupos.manage_permissions' },
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    Serviços: {
      label: 'Serviços',
      actions: {
        view: { label: 'Ativo', permission: 'servicos.view' },
        create: { label: 'Inserir', permission: 'servicos.create' },
        edit: { label: 'Alterar', permission: 'servicos.edit' },
        delete: { label: 'Apagar', permission: 'servicos.delete' },
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    Parcerias: {
      label: 'Parcerias',
      actions: {
        view: { label: 'Ativo', permission: 'parcerias.view' },
        create: { label: 'Inserir', permission: 'parcerias.create' },
        edit: { label: 'Alterar', permission: 'parcerias.edit' },
        delete: { label: 'Apagar', permission: 'parcerias.delete' },
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    Categorias: {
      label: 'Categorias',
      actions: {
        view: { label: 'Ativo', permission: 'categorias.view' },
        create: { label: 'Inserir', permission: 'categorias.create' },
        edit: { label: 'Alterar', permission: 'categorias.edit' },
        delete: { label: 'Apagar', permission: 'categorias.delete' },
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
  },
  Atendimento: {
    'Fila de Atendimento': {
      label: 'Fila de Atendimento',
      actions: {
        view: { label: 'Ativo', permission: 'fila.view' },
        create: undefined,
        edit: undefined,
        delete: undefined,
        manage: { label: 'Gerenciar', permission: 'fila.manage' },
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
    },
    Atendimento: {
      label: 'Atendimentos / Prontuários',
      actions: {
        view: { label: 'Ativo', permission: 'atendimentos.view' },
        create: { label: 'Inserir', permission: 'atendimentos.create' },
        edit: { label: 'Alterar', permission: 'atendimentos.edit' },
        delete: undefined,
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: undefined,
      },
      extraActions: [
        { label: 'Detalhes', permission: 'atendimentos.detalhes' },
      ],
    },
  },
  Financeiro: {
    'Contas a Pagar': {
      label: 'Contas a Pagar',
      actions: {
        view: { label: 'Ativo', permission: 'contas_pagar.view' },
        create: { label: 'Inserir', permission: 'contas_pagar.create' },
        edit: { label: 'Alterar', permission: 'contas_pagar.edit' },
        delete: { label: 'Apagar', permission: 'contas_pagar.delete' },
        manage: undefined,
        pay: { label: 'Pagar', permission: 'contas_pagar.pay' },
        receive: undefined,
        export: undefined,
      },
    },
    'Contas a Receber': {
      label: 'Contas a Receber',
      actions: {
        view: { label: 'Ativo', permission: 'contas_receber.view' },
        create: { label: 'Inserir', permission: 'contas_receber.create' },
        edit: { label: 'Alterar', permission: 'contas_receber.edit' },
        delete: { label: 'Apagar', permission: 'contas_receber.delete' },
        manage: undefined,
        pay: undefined,
        receive: { label: 'Receber', permission: 'contas_receber.receive' },
        export: undefined,
      },
    },
  },
  Relatórios: {
    Relatórios: {
      label: 'Relatórios',
      actions: {
        view: { label: 'Ativo', permission: 'relatorios.view' },
        create: undefined,
        edit: undefined,
        delete: undefined,
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: { label: 'Exportar', permission: 'relatorios.export' },
      },
    },
  },
  Dashboard: {
    Dashboard: {
      label: 'Dashboard',
      actions: {
        view: { label: 'Ativo', permission: 'dashboard.view' },
        create: undefined,
        edit: undefined,
        delete: undefined,
        manage: undefined,
        pay: undefined,
        receive: undefined,
        export: { label: 'Financeiro', permission: 'dashboard.view_financial' },
      },
    },
  },
};

export const actionColumns: Array<{ key: PermissionActionKey; label: string }> = [
  { key: 'view', label: 'Ativo' },
  { key: 'create', label: 'Inserir' },
  { key: 'edit', label: 'Alterar' },
  { key: 'delete', label: 'Apagar' },
  { key: 'manage', label: 'Gerenciar' },
  { key: 'pay', label: 'Pagar' },
  { key: 'receive', label: 'Receber' },
  { key: 'export', label: 'Exportar' },
];


