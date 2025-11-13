# 🔧 Como Configurar o Backend e VITE_API_URL

## ❓ O que é VITE_API_URL?

É a URL do seu **backend** (servidor API). O frontend precisa dessa URL para se comunicar com o backend e buscar dados.

## 🎯 Você tem 3 opções:

### Opção 1: Deixar sem configurar (Temporário) ⏳

**Quando usar:** Se você ainda não fez deploy do backend.

**O que fazer:**
- **NÃO** adicione `VITE_API_URL` nas variáveis de ambiente da Vercel
- O sistema usará `http://localhost:4000` como padrão
- ⚠️ **Limitação:** Funcionalidades que dependem do backend não funcionarão em produção

**Funcionalidades que NÃO vão funcionar:**
- Fila de atendimento
- Salvar prontuários
- Gerenciar pacientes
- Contas a pagar/receber
- E outras que precisam do backend

**Funcionalidades que VÃO funcionar:**
- Login (usa Supabase diretamente)
- Interface visual
- Navegação

---

### Opção 2: Fazer Deploy do Backend (Recomendado) ✅

**Quando usar:** Quando quiser que tudo funcione em produção.

#### Passo a Passo:

##### 1. Escolher um serviço para o backend:

**Opção A: Railway (Mais fácil)**
- Acesse: https://railway.app
- Faça login com GitHub
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha seu repositório
- Configure:
  - **Root Directory:** `server`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`
- Adicione variáveis de ambiente:
  ```
  PORT=4000
  SUPABASE_URL=https://seu-projeto.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
  ```
- Railway vai gerar uma URL tipo: `https://seu-projeto.railway.app`

**Opção B: Render**
- Acesse: https://render.com
- Similar ao Railway, mas com interface diferente

**Opção C: Fly.io**
- Acesse: https://fly.io
- Mais complexo, mas muito poderoso

##### 2. Após fazer deploy do backend:

Você receberá uma URL tipo:
- `https://seu-projeto.railway.app`
- `https://seu-projeto.onrender.com`
- `https://seu-projeto.fly.dev`

##### 3. Adicionar na Vercel:

1. Vá no painel da Vercel
2. Settings → Environment Variables
3. Adicione:
   ```
   Nome: VITE_API_URL
   Valor: https://seu-projeto.railway.app (ou a URL que você recebeu)
   ```

##### 4. Fazer redeploy na Vercel

---

### Opção 3: Usar Backend Local (Apenas para testes) 🧪

**Quando usar:** Para testar localmente antes de fazer deploy.

**O que fazer:**
1. Rode o backend localmente:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. Configure na Vercel:
   ```
   VITE_API_URL=http://localhost:4000
   ```
   
   ⚠️ **ATENÇÃO:** Isso só funciona se você estiver testando localmente. Em produção na Vercel, `localhost` não vai funcionar porque o backend não está rodando no mesmo servidor.

---

## 📋 Checklist

### Para começar rápido (sem backend):
- [ ] Configure apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Deixe `VITE_API_URL` sem configurar
- [ ] Site vai funcionar parcialmente (login, interface)

### Para funcionar completo:
- [ ] Faça deploy do backend em Railway/Render/Fly.io
- [ ] Configure `VITE_API_URL` com a URL do backend
- [ ] Configure variáveis do backend (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Faça redeploy na Vercel
- [ ] Tudo deve funcionar! 🎉

## 🆘 Precisa de ajuda?

1. **Backend não está funcionando?**
   - Verifique os logs do serviço (Railway/Render)
   - Verifique se as variáveis de ambiente do backend estão corretas
   - Teste a URL do backend diretamente no navegador: `https://seu-backend.com/health`

2. **Erro de CORS?**
   - Configure CORS no backend para aceitar requisições da Vercel
   - Adicione a URL da Vercel nas origens permitidas

3. **Não sei qual serviço usar?**
   - **Railway:** Mais fácil para começar
   - **Render:** Gratuito, mas pode ser mais lento
   - **Fly.io:** Mais complexo, mas muito poderoso

## 📚 Próximos Passos

1. Se escolheu **Opção 1** (sem backend): Você pode usar o sistema parcialmente. Quando quiser tudo funcionando, faça o deploy do backend.

2. Se escolheu **Opção 2** (deploy do backend): Siga o passo a passo acima e você terá tudo funcionando!

3. Dúvidas? Consulte a documentação do serviço escolhido ou me pergunte!

