# 👁️ Optra Vision - Sistema de Gestão Optométrica

Sistema completo de gestão para clínicas de optometria, com controle de pacientes, agendamentos, atendimentos, finanças e relatórios.

![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20Supabase-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd optra-vision

# 2. Configure as variáveis de ambiente
# Veja ENV_SETUP.md para instruções detalhadas

# 3. Instale as dependências
npm install
cd server && npm install && cd ..

# 4. Execute o banco de dados
# Importe o script SQL no Supabase (veja SETUP.md)

# 5. Inicie o backend
cd server && npm run dev

# 6. Inicie o frontend (em outro terminal)
npm run dev
```

📖 **[Leia o guia completo de configuração](SETUP.md)**

---

## 🎯 Funcionalidades

### 👤 Gestão de Usuários
- ✅ Sistema de autenticação com Supabase
- ✅ 3 perfis de acesso: Administrador, Secretária, Optometrista
- ✅ Controle de permissões por perfil
- ✅ Login automático com detecção de perfil

### 👥 Gestão de Pacientes
- Cadastro completo com histórico médico
- Busca e filtros avançados
- Histórico de consultas e exames
- Receitas e prescrições

### 📅 Agendamentos
- Agenda visual por optometrista
- Confirmação automática via sistema
- Controle de horários disponíveis
- Notificações e lembretes

### 🏥 Atendimento Clínico
- Fila de atendimento em tempo real
- Prontuário eletrônico completo
- Registro de exames optométricos
- Prescrição de óculos
- Histórico de tratamentos

### 💰 Controle Financeiro
- Contas a receber e pagar
- Fluxo de caixa
- Relatórios gerenciais
- Controle de despesas
- Parcerias e convênios

### 📊 Relatórios
- Dashboard com métricas em tempo real
- Relatórios personalizados
- Exportação de dados
- Indicadores de desempenho

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component Library
- **React Router** - Navigation
- **React Query** - Data Fetching
- **Zod** - Validation
- **Recharts** - Charts

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **Supabase** - Database & Auth
- **Zod** - API Validation

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)**
- **Views e Functions otimizadas**
- **Triggers automáticos**

---

## 📁 Estrutura do Projeto

```
optra-vision/
├── src/                          # Frontend
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ProtectedRoute.tsx  # Proteção de rotas
│   ├── contexts/               # React Contexts
│   │   └── AuthContext.tsx     # Autenticação global
│   ├── lib/                    # Utilitários
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── utils.ts           # Helpers
│   ├── pages/                  # Páginas/Rotas
│   │   ├── Login.tsx          # 🆕 Tela de login renovada
│   │   ├── admin/             # Área administrativa
│   │   ├── secretary/         # Área da secretária
│   │   └── optometrist/       # Área do optometrista
│   └── App.tsx                # App principal
│
├── server/                      # Backend
│   ├── src/
│   │   ├── index.ts           # Servidor Express
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── routes/            # Rotas da API
│   │       ├── health.ts
│   │       ├── pacientes.ts
│   │       └── agendamentos.ts
│   └── package.json
│
├── SETUP.md                    # Guia completo de configuração
├── ENV_SETUP.md               # Configuração de variáveis
└── README.md                  # Este arquivo
```

---

## 🎨 Design System

- **Cores**: Paleta médica profissional (azuis e brancos)
- **Tipografia**: Sistema de fontes hierárquico
- **Componentes**: shadcn/ui customizado
- **Dark Mode**: Suporte nativo
- **Responsivo**: Mobile-first design

---

## 🔐 Segurança

- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) no banco
- ✅ Proteção de rotas por perfil
- ✅ Validação de dados (Zod)
- ✅ HTTPS obrigatório em produção
- ✅ Sanitização de inputs

---

## 📚 Documentação

- **[SETUP.md](SETUP.md)** - Guia completo de configuração
- **[ENV_SETUP.md](ENV_SETUP.md)** - Configuração de variáveis
- **Script SQL** - Estrutura completa do banco

---

## 🚦 Como Rodar

### Desenvolvimento

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Acesse: **http://localhost:8080**

### Produção

```bash
# Build Frontend
npm run build

# Build Backend
cd server
npm run build

# Deploy para seu servidor ou Vercel/Netlify
```

---

## 🧪 Primeiro Acesso

1. Execute o script SQL no Supabase
2. Crie um usuário no Supabase Authentication
3. Insira os dados na tabela `usuarios`
4. Faça login com as credenciais

📖 **Veja o [SETUP.md](SETUP.md) para instruções detalhadas**

---

## 🎯 Roadmap

### ✅ Concluído
- [x] Estrutura do projeto
- [x] Backend REST API
- [x] Tela de login profissional
- [x] Sistema de autenticação
- [x] Rotas protegidas por perfil
- [x] Integração com Supabase
- [x] Design system completo

### 🚧 Em Desenvolvimento
- [ ] Dashboard com dados reais
- [ ] CRUD completo de pacientes
- [ ] Sistema de agendamentos
- [ ] Fila de atendimento
- [ ] Prontuário eletrônico

### 📋 Planejado
- [ ] Módulo financeiro completo
- [ ] Relatórios avançados
- [ ] Notificações em tempo real
- [ ] App mobile
- [ ] Integração com equipamentos
- [ ] BI e Analytics

---

## 🤝 Contribuindo

Este é um projeto proprietário. Entre em contato para mais informações.

---

## 📄 Licença

Todos os direitos reservados © 2024 Optra Vision

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação](SETUP.md)
2. Verifique as [issues](https://github.com/seu-usuario/optra-vision/issues)
3. Entre em contato com o time de desenvolvimento

---

**Desenvolvido com 💙 para profissionais da saúde ocular**
