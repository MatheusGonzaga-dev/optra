# 🚂 Guia Completo: Deploy no Railway - Passo a Passo

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já tem)
- ✅ Repositório `MatheusGonzaga-dev/optra` (já tem)
- ✅ Projeto Supabase configurado (já tem)

## 🚀 Passo a Passo Completo

### 1️⃣ Criar Conta no Railway

1. **Acesse:** https://railway.app
2. **Clique em:** "Start a New Project" ou "Login"
3. **Escolha:** "Login with GitHub"
4. **Autorize** o Railway a acessar seus repositórios
5. ✅ Conta criada!

---

### 2️⃣ Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"** (botão roxo no topo)
2. Selecione **"Deploy from GitHub repo"**
3. **Autorize** o Railway a acessar seus repositórios (se pedir)
4. **Procure e selecione:** `MatheusGonzaga-dev/optra`
5. **Clique em:** "Deploy Now"
6. ✅ Railway vai começar a fazer deploy automaticamente!

---

### 3️⃣ Configurar Root Directory

O Railway precisa saber que o backend está na pasta `server/`:

1. **Clique no serviço** que foi criado (geralmente tem o nome do repositório)
2. Vá na aba **"Settings"** (ícone de engrenagem)
3. Role até **"Root Directory"**
4. **Digite:** `server`
5. **Clique em:** "Save"
6. ✅ Railway agora sabe onde está o backend!

---

### 4️⃣ Configurar Build e Start Commands

1. Ainda na aba **"Settings"**
2. Role até **"Build Command"**
3. **Digite:** `npm install && npm run build`
4. **Clique em:** "Save"
5. Role até **"Start Command"**
6. **Digite:** `npm start`
7. **Clique em:** "Save"
8. ✅ Comandos configurados!

---

### 5️⃣ Configurar Variáveis de Ambiente

1. Vá na aba **"Variables"** (no topo, ao lado de Settings)
2. Você verá uma lista vazia ou algumas variáveis padrão
3. **Clique em:** "New Variable" ou "+" (botão para adicionar)
4. **Adicione cada variável uma por uma:**

#### Variável 1: PORT
- **Name:** `PORT`
- **Value:** `4000`
- **Clique em:** "Add"

#### Variável 2: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://imxvcgixvlxrllkvngsa.supabase.co`
  - (Use a mesma URL que está na Vercel)
- **Clique em:** "Add"

#### Variável 3: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Sua service_role_key do Supabase
  - (Vá no Supabase → Settings → API → service_role key)
- **Clique em:** "Add"
- ⚠️ **IMPORTANTE:** Esta é a chave SECRETA (service_role), não a anon key!

5. ✅ Todas as variáveis configuradas!

**Onde encontrar a SERVICE_ROLE_KEY:**
1. Acesse: https://supabase.com → Seu projeto
2. Vá em: **Settings** → **API**
3. Procure por: **"service_role" key** (não a anon key!)
4. Copie a chave completa (começa com `eyJ...`)

---

### 6️⃣ Gerar Domínio (URL do Backend)

1. Vá na aba **"Settings"**
2. Role até **"Networking"**
3. **Clique em:** "Generate Domain"
4. Railway vai gerar uma URL tipo: `seu-projeto-production.up.railway.app`
5. **Copie essa URL** - você vai precisar dela!
6. ✅ Domínio criado!

**Exemplo de URL gerada:**
```
https://optra-backend-production.up.railway.app
```

---

### 7️⃣ Aguardar Deploy

1. Vá na aba **"Deployments"** (no topo)
2. Você verá o deploy em andamento
3. **Aguarde** até ver:
   - ✅ Status: "Success"
   - ✅ Logs mostrando: `[server] listening on http://localhost:4000`
4. ✅ Deploy concluído!

**Tempo estimado:** 2-5 minutos

---

### 8️⃣ Testar o Backend

1. **Copie a URL** do domínio gerado (passo 6)
2. **Adicione** `/health` no final
3. **Acesse no navegador:**
   ```
   https://seu-projeto-production.up.railway.app/health
   ```
4. **Esperado:** `{"status":"ok"}` ou similar
5. ✅ Backend funcionando!

---

### 9️⃣ Configurar na Vercel

Agora que o backend está funcionando, configure na Vercel:

1. **Acesse:** https://vercel.com → Seu projeto
2. Vá em: **Settings** → **Environment Variables**
3. **Adicione:**
   - **Name:** `VITE_API_URL`
   - **Value:** A URL do Railway (ex: `https://optra-backend-production.up.railway.app`)
   - **Environments:** Marque **Production**, **Preview** e **Development**
4. **Clique em:** "Save"
5. **Faça redeploy:**
   - Vá em **Deployments**
   - Clique nos **três pontos (...)** no último deploy
   - Selecione **Redeploy**
6. ✅ Frontend configurado!

---

## 🔍 Verificar se Está Funcionando

### Teste 1: Backend Diretamente
```
https://seu-projeto-production.up.railway.app/health
```
**Esperado:** `{"status":"ok"}`

### Teste 2: Frontend
1. Acesse: `https://optrasystem.vercel.app`
2. Abra o console (F12)
3. Faça login e acesse uma página
4. **Verifique:** Não deve mais aparecer `localhost:4000`
5. **Verifique:** Requisições devem ir para a URL do Railway

---

## 🐛 Problemas Comuns

### ❌ Erro: "Cannot find module"

**Solução:**
- Verifique se o **Root Directory** está como `server`
- Verifique se o **Build Command** está correto: `npm install && npm run build`

### ❌ Erro: "Missing SUPABASE_URL"

**Solução:**
- Verifique se todas as variáveis estão configuradas na aba **Variables**
- Verifique se os nomes estão corretos (maiúsculas/minúsculas importam!)

### ❌ Backend não inicia

**Solução:**
- Vá em **Deployments** → Clique no deploy → Veja os **Logs**
- Procure por erros
- Verifique se o **Start Command** está como `npm start`

### ❌ CORS Error no Frontend

**Solução:**
- O backend já está configurado para aceitar requisições da Vercel
- Verifique se a URL em `VITE_API_URL` está correta (com `https://`)

---

## 📊 Checklist Final

- [ ] Conta criada no Railway
- [ ] Projeto criado e conectado ao GitHub
- [ ] Root Directory configurado como `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variável `PORT=4000` adicionada
- [ ] Variável `SUPABASE_URL` adicionada
- [ ] Variável `SUPABASE_SERVICE_ROLE_KEY` adicionada
- [ ] Domínio gerado e URL copiada
- [ ] Deploy concluído com sucesso
- [ ] `/health` retorna `{"status":"ok"}`
- [ ] `VITE_API_URL` configurada na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Frontend funcionando sem erros

---

## 🎯 Resumo Rápido

1. **Railway:** New Project → Deploy from GitHub → Selecione repositório
2. **Settings:** Root Directory = `server`
3. **Settings:** Build = `npm install && npm run build`
4. **Settings:** Start = `npm start`
5. **Variables:** Adicione `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
6. **Settings:** Generate Domain → Copie URL
7. **Vercel:** Adicione `VITE_API_URL` com a URL do Railway
8. ✅ Pronto!

---

## 🆘 Precisa de Ajuda?

Se tiver algum problema:

1. **Verifique os Logs:**
   - Railway → Deployments → Clique no deploy → Veja Logs

2. **Me diga:**
   - Qual erro aparece?
   - O que está nos logs?
   - Em qual passo está travado?

Com essas informações, consigo ajudar a resolver! 🚀

