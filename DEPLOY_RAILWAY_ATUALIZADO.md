# 🚂 Deploy no Railway - Guia Completo Atualizado

Este é o guia definitivo para fazer deploy do **Optra Vision** no Railway (Backend + Frontend).

## 📋 O que você vai fazer

1. **Backend**: Deploy na pasta `server/`
2. **Frontend**: Deploy na raiz do projeto
3. Ambos no **mesmo repositório**, mas **serviços separados** no Railway

---

## 🚀 Passo a Passo Completo

### **1. Preparar o Repositório**

Primeiro, faça commit das configurações atualizadas:

```bash
git add .
git commit -m "Configurações otimizadas para Railway"
git push origin main
```

---

### **2. Criar Projeto no Railway**

1. Acesse: https://railway.app
2. Clique em **"Login with GitHub"**
3. Autorize o Railway
4. Clique em **"New Project"**
5. Selecione **"Empty Project"** (vamos adicionar os serviços manualmente)

---

### **3. Deploy do Backend**

#### **3.1. Adicionar Serviço do Backend**

1. No projeto criado, clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Escolha seu repositório: `MatheusGonzaga-dev/optra` (ou o nome correto)
4. O Railway vai criar um serviço

#### **3.2. Configurar Backend**

1. **Clique no serviço do backend**
2. Vá em **"Settings"**
3. Configure:

**Root Directory:**
```
server
```

**Custom Build Command (opcional):**
```
npm ci && npm run build
```

**Custom Start Command (opcional):**
```
node dist/index.js
```

**Watch Paths:**
```
server/**
```

Isso garante que o Railway só faz rebuild quando algo mudar na pasta `server/`.

#### **3.3. Variáveis de Ambiente do Backend**

Vá em **"Variables"** e adicione:

```env
NODE_ENV=production
PORT=4000
SUPABASE_URL=sua-url-do-supabase
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**Onde encontrar as chaves do Supabase:**
1. Vá no Dashboard do Supabase
2. **Settings** → **API**
3. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

#### **3.4. Gerar Domínio do Backend**

1. Na aba **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. **Copie a URL gerada** (ex: `optra-backend-production.up.railway.app`)
5. ✅ Guarde essa URL, vamos usar no frontend!

---

### **4. Deploy do Frontend**

#### **4.1. Adicionar Serviço do Frontend**

1. Volte para o projeto (clique no nome no topo)
2. Clique em **"+ New"** novamente
3. Selecione **"GitHub Repo"**
4. Escolha o **mesmo repositório**
5. O Railway vai criar outro serviço

#### **4.2. Configurar Frontend**

1. **Clique no serviço do frontend**
2. Vá em **"Settings"**
3. Configure:

**Root Directory:**
```
.
```
(ponto = raiz do projeto)

**Watch Paths:**
```
src/**
public/**
index.html
vite.config.ts
package.json
```

Isso garante rebuild apenas quando o frontend mudar.

#### **4.3. Variáveis de Ambiente do Frontend**

Vá em **"Variables"** e adicione:

```env
VITE_API_URL=https://optra-backend-production.up.railway.app
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

**⚠️ IMPORTANTE:**
- Substitua `optra-backend-production.up.railway.app` pela URL real do seu backend
- **NÃO coloque barra `/` no final** da `VITE_API_URL`
- Use `https://` (não `http://`)

#### **4.4. Gerar Domínio do Frontend**

1. Na aba **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. ✅ Essa é a URL do seu sistema!

---

## 🔍 Verificar se está Funcionando

### **Teste 1: Backend**

Acesse no navegador:
```
https://seu-backend.up.railway.app/health
```

**Esperado:** 
```json
{"name":"optra-vision-backend","status":"ok"}
```

### **Teste 2: Frontend**

1. Acesse: `https://seu-frontend.up.railway.app`
2. Abra o Console do Navegador (F12 → Console)
3. Verifique os logs:

```
🔍 VITE_API_URL existe? true
🔍 VITE_API_URL valor: https://seu-backend.up.railway.app
✅ API_BASE_URL configurado: https://seu-backend.up.railway.app
```

4. Tente fazer **login**
5. Se funcionar, está tudo certo! ✅

---

## 🐛 Problemas Comuns

### **Erro: Frontend não carrega / tela branca**

**Causa:** Build falhou ou não gerou a pasta `dist`

**Solução:**
1. Vá em **"Deployments"** no serviço do frontend
2. Clique no último deploy
3. Veja os **logs de build**
4. Procure por erros vermelhos
5. Se tiver erro de memória, vá em **Settings** → **Resources** → Aumente a RAM

### **Erro: "Failed to fetch" ou CORS**

**Causa:** Frontend não consegue conectar no backend

**Solução:**
1. Verifique se `VITE_API_URL` está configurada corretamente
2. Verifique se o backend está rodando (teste `/health`)
3. O CORS já está configurado para aceitar domínios do Railway

### **Erro: Backend não inicia**

**Causa:** Falta de variáveis ou erro no código

**Solução:**
1. Verifique se todas as variáveis estão configuradas
2. Veja os logs em **"Deployments"**
3. Verifique se o `Root Directory` está como `server`

### **Erro: "Cannot find module"**

**Causa:** Dependências não foram instaladas

**Solução:**
1. Vá em **Settings** do serviço
2. Clique em **"Redeploy"** (força um rebuild completo)

---

## 🔄 Atualizar a Aplicação

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Railway detecta automaticamente e faz **redeploy automático**! 🎉

---

## 📊 Monitorar Uso

### **Ver Logs em Tempo Real**

1. Clique no serviço (backend ou frontend)
2. Vá na aba **"Deployments"**
3. Clique no deploy ativo
4. Veja os logs em tempo real

### **Ver Métricas**

1. Na página do serviço
2. Você verá gráficos de:
   - CPU
   - RAM
   - Network
   - Requests

---

## 💰 Custos

O Railway oferece:
- **$5 grátis por mês** (crédito)
- Depois, cobra por uso:
  - ~$0.000463/GB-hour (RAM)
  - ~$0.000231/vCPU-hour (CPU)

**Estimativa para Optra Vision:**
- Backend + Frontend: ~$3-5/mês
- Se passar dos $5 grátis, você paga a diferença

---

## ✅ Checklist Final

- [ ] Backend deployado no Railway
- [ ] Frontend deployado no Railway
- [ ] Backend tem domínio gerado
- [ ] Frontend tem domínio gerado
- [ ] Variáveis de ambiente configuradas:
  - [ ] Backend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Frontend: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_API_URL` aponta para o backend correto
- [ ] Teste `/health` do backend funciona
- [ ] Frontend abre sem erros
- [ ] Login funciona
- [ ] Dashboard carrega dados

---

## 🎯 Estrutura Final no Railway

Seu projeto terá **2 serviços**:

```
📦 Projeto Optra Vision
├── 🟦 Backend (server/)
│   ├── Root Directory: server
│   ├── Port: 4000
│   └── URL: https://backend-xxx.up.railway.app
│
└── 🟩 Frontend (raiz)
    ├── Root Directory: .
    ├── Port: $PORT (automático)
    └── URL: https://frontend-xxx.up.railway.app
```

---

## 🚨 Dica Final

Se quiser um domínio personalizado (ex: `optrasystem.com.br`):

1. Compre o domínio
2. No Railway, vá em **Settings** → **Domains**
3. Clique em **"Custom Domain"**
4. Adicione seu domínio
5. Configure o DNS conforme instruído pelo Railway

---

## 📞 Precisa de Ajuda?

Se algo não funcionar:
1. ✅ Verifique os logs no Railway
2. ✅ Verifique as variáveis de ambiente
3. ✅ Teste o backend com `/health`
4. ✅ Verifique o console do navegador (F12)
5. ✅ Faça um **Redeploy** forçado

**Boa sorte com o deploy! 🚀**

