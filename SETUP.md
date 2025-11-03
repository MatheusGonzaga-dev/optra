# Optra Vision - Guia de Configuração e Execução

Sistema completo de gestão optométrica com backend Node.js + Express e frontend React + Vite.

## 📋 Pré-requisitos

- **Node.js** 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** ou **yarn**
- **Conta no Supabase** (para banco de dados PostgreSQL)

---

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Aguarde a criação do banco de dados

### 2. Executar o Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Cole todo o conteúdo do script SQL fornecido (estrutura completa das tabelas)
3. Execute o script
4. Verifique se todas as tabelas foram criadas na aba **Table Editor**

### 3. Obter as Credenciais

1. Vá em **Project Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (para o frontend)
   - **service_role key** (para o backend - NUNCA exponha publicamente)

---

## ⚙️ Configuração do Backend

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `server/`:

```env
PORT=4000
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

⚠️ **IMPORTANTE**: Use a **Service Role Key** no backend (permite acesso total ao banco).

### 3. Executar o Backend

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

O backend estará rodando em: **http://localhost:4000**

### Endpoints Disponíveis

- `GET /health` - Health check
- `GET /pacientes` - Listar todos os pacientes
- `POST /pacientes` - Criar novo paciente
- `GET /pacientes/:id` - Obter paciente por ID
- `PUT /pacientes/:id` - Atualizar paciente
- `DELETE /pacientes/:id` - Deletar paciente (soft delete)
- `GET /agendamentos` - Listar agendamentos
- `POST /agendamentos` - Criar novo agendamento

---

## 🎨 Configuração do Frontend

### 1. Instalar Dependências

```bash
# Na raiz do projeto (fora da pasta server)
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na **raiz do projeto** (não dentro de `server/`):

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-public-key-aqui
```

⚠️ **IMPORTANTE**: Use a **Anon/Public Key** no frontend (acesso limitado e seguro).

### 3. Executar o Frontend

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

O frontend estará rodando em: **http://localhost:8080**

---

## 🚀 Executando Ambos (Frontend + Backend)

### Opção 1: Dois Terminais

**Terminal 1** (Backend):
```bash
cd server
npm run dev
```

**Terminal 2** (Frontend):
```bash
npm run dev
```

### Opção 2: Usar concurrently (recomendado)

Adicione ao `package.json` da raiz:

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd server && npm run dev\""
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

Depois execute:
```bash
npm install
npm run dev:all
```

---

## 🔐 Autenticação e Acesso

### Criar Primeiro Usuário (Admin)

Como ainda não há interface de cadastro, você precisa criar o primeiro usuário diretamente no Supabase:

#### 1. Criar Usuário na Autenticação

No Supabase Dashboard:
1. Vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: `admin@optravision.com`
   - Password: `senha123` (ou outra senha)
   - Auto Confirm User: **Ativado**

#### 2. Copiar o UUID do Usuário

Após criar, copie o **UUID** do usuário criado.

#### 3. Inserir Dados na Tabela `usuarios`

Vá em **SQL Editor** e execute:

```sql
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  perfil,
  ativo
) VALUES (
  'UUID_COPIADO_AQUI',
  'Administrador',
  'admin@optravision.com',
  'ADMINISTRADOR',
  true
);
```

Substitua `UUID_COPIADO_AQUI` pelo UUID real.

### Fazer Login

1. Acesse **http://localhost:8080**
2. Você será redirecionado para `/login`
3. Digite:
   - Email: `admin@optravision.com`
   - Senha: `senha123`
4. O sistema detectará automaticamente que você é **ADMINISTRADOR** e redirecionará para `/admin/dashboard`

### Perfis Disponíveis

- **ADMINISTRADOR** - Acesso completo ao sistema
- **SECRETARIA** - Gestão de pacientes, agendamentos e fila
- **OPTOMETRISTA** - Atendimento clínico e histórico de consultas

---

## 📁 Estrutura do Projeto

```
optra-vision/
├── server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── index.ts          # Servidor principal
│   │   ├── supabase.ts       # Cliente Supabase
│   │   └── routes/           # Rotas da API
│   │       ├── health.ts
│   │       ├── pacientes.ts
│   │       └── agendamentos.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Variáveis do backend
│
├── src/                       # Frontend React
│   ├── components/           # Componentes UI
│   ├── contexts/             # Contextos (AuthContext)
│   ├── lib/                  # Utilities
│   │   └── supabase.ts      # Cliente Supabase (frontend)
│   ├── pages/               # Páginas/rotas
│   │   ├── Login.tsx        # ✨ Nova tela de login
│   │   ├── admin/           # Área administrativa
│   │   ├── secretary/       # Área da secretária
│   │   └── optometrist/     # Área do optometrista
│   ├── App.tsx              # App principal com rotas protegidas
│   └── main.tsx
│
├── .env                      # Variáveis do frontend
├── package.json
└── SETUP.md                  # Este arquivo
```

---

## 🎯 Próximos Passos

1. ✅ Execute o script SQL no Supabase
2. ✅ Configure as variáveis de ambiente
3. ✅ Crie o primeiro usuário admin
4. ✅ Inicie backend e frontend
5. ✅ Faça login e teste o sistema

### Funcionalidades Implementadas

- ✅ Tela de login profissional com UX otimizada
- ✅ Autenticação via Supabase
- ✅ Detecção automática de perfil após login
- ✅ Rotas protegidas por perfil
- ✅ Backend REST API com Express
- ✅ Integração completa com banco de dados

### Próximas Implementações Sugeridas

- [ ] Recuperação de senha
- [ ] Interface para cadastro de usuários (admin)
- [ ] Dashboard com dados reais do Supabase
- [ ] CRUD completo de pacientes integrado
- [ ] Sistema de agendamentos funcional
- [ ] Fila de atendimento em tempo real
- [ ] Relatórios financeiros

---

## 🆘 Troubleshooting

### Erro: "Missing Supabase environment variables"

- Verifique se criou o arquivo `.env` corretamente
- Frontend: `.env` na raiz
- Backend: `.env` dentro de `server/`

### Erro ao fazer login: "Email ou senha incorretos"

- Confirme que criou o usuário no Supabase Auth
- Verifique se inseriu os dados na tabela `usuarios`
- Confira se o UUID do usuário está correto

### Backend não conecta ao Supabase

- Verifique se está usando a **Service Role Key** no backend
- Confirme que o `SUPABASE_URL` está correto

### Frontend não conecta ao Supabase

- Verifique se está usando a **Anon Key** no frontend
- Reinicie o servidor Vite após alterar `.env`

---

## 📝 Licença

Projeto proprietário - Todos os direitos reservados.

