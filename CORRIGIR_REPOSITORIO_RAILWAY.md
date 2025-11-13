# 🔧 Corrigir Repositório no Railway

## 🐛 Problema

No Railway você conectou o repositório **`optra`**, mas o correto é **`optra_system`**.

Por isso o backend não está funcionando corretamente!

## ✅ Solução: Conectar o Repositório Correto

### Opção 1: Reconectar o Serviço (Recomendado)

1. **Acesse:** https://railway.app → Seu projeto
2. **Clique no serviço** que está conectado ao `optra`
3. **Vá em:** **Settings** (aba no topo)
4. **Role até:** **"Source"** ou **"Repository"**
5. **Clique em:** **"Disconnect"** ou **"Change Repository"**
6. **Selecione:** **"Connect GitHub Repository"**
7. **Procure e selecione:** `MatheusGonzaga-dev/optra_system`
8. **Autorize** se pedir
9. ✅ Repositório conectado!

### Opção 2: Criar Novo Serviço (Alternativa)

Se não conseguir reconectar:

1. **No Railway, clique em:** **"New"** (no projeto)
2. **Selecione:** **"GitHub Repo"**
3. **Procure e selecione:** `MatheusGonzaga-dev/optra_system`
4. **Configure:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. **Adicione as variáveis:**
   - `PORT=4000`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
6. **Gere o domínio** (Settings → Networking → Generate Domain)
7. ✅ Novo serviço criado!

---

## 🔍 Verificar Qual Repositório Está Conectado

### No Railway:

1. **Clique no serviço**
2. **Vá em:** **Settings**
3. **Procure por:** **"Source"** ou **"Repository"**
4. **Veja qual repositório está conectado:**
   - Se for `optra` → Precisa mudar para `optra_system`
   - Se for `optra_system` → Está correto! ✅

---

## 🎯 Passo a Passo Completo

### 1. Verificar Repositório Atual

1. **Railway** → Seu projeto → Serviço
2. **Settings** → **Source/Repository**
3. **Veja:** Qual repositório está conectado

### 2. Reconectar (Se for `optra`)

1. **Clique em:** **"Disconnect"** ou **"Change Repository"**
2. **Selecione:** **"Connect GitHub Repository"**
3. **Procure:** `optra_system`
4. **Selecione:** `MatheusGonzaga-dev/optra_system`
5. **Autorize** se pedir
6. ✅ Conectado!

### 3. Verificar Configurações

Após reconectar, verifique:

1. **Root Directory:** `server` ✅
2. **Build Command:** `npm install && npm run build` ✅
3. **Start Command:** `npm start` ✅
4. **Variáveis de ambiente:** Todas configuradas ✅

### 4. Aguardar Deploy

1. Railway vai fazer deploy automaticamente
2. **Aguarde** 2-5 minutos
3. **Verifique os logs** para ver se funcionou

### 5. Atualizar URL na Vercel

Após o deploy funcionar:

1. **Railway** → **Settings** → **Networking**
2. **Copie a URL** do domínio (ex: `https://optra-system-production.up.railway.app`)
3. **Vercel** → **Settings** → **Environment Variables**
4. **Atualize:** `VITE_API_URL` com a nova URL
5. **Faça redeploy** na Vercel

---

## 🔍 Verificar se Funcionou

### 1. Testar Backend

1. **Acesse:** A URL do Railway (ex: `https://optra-system-production.up.railway.app/health`)
2. **Deve retornar:** `{"status":"ok"}` ou similar
3. ✅ Backend funcionando!

### 2. Verificar Logs

1. **Railway** → **Deployments**
2. **Clique no deploy mais recente**
3. **Veja os logs:**
   - ✅ Deve mostrar: `[server] listening on http://localhost:4000`
   - ❌ Se mostrar erro, veja qual é

---

## 🐛 Problemas Comuns

### ❌ Não consigo desconectar o repositório

**Solução:**
- Pode precisar deletar o serviço e criar um novo
- Ou verificar permissões no GitHub

### ❌ Repositório `optra_system` não aparece

**Solução:**
1. Verifique se você tem acesso ao repositório
2. Verifique se autorizou o Railway a acessar seus repositórios
3. Vá em GitHub → Settings → Applications → Railway → Configure

### ❌ Deploy falha após reconectar

**Solução:**
1. Verifique se o repositório `optra_system` tem a pasta `server/`
2. Verifique se tem o arquivo `server/package.json`
3. Verifique os logs para ver o erro específico

---

## 📋 Checklist

- [ ] Repositório conectado: `MatheusGonzaga-dev/optra_system` ✅
- [ ] Root Directory: `server` ✅
- [ ] Build Command: `npm install && npm run build` ✅
- [ ] Start Command: `npm start` ✅
- [ ] Variáveis configuradas: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ✅
- [ ] Domínio gerado e URL copiada ✅
- [ ] Deploy funcionando (`/health` retorna ok) ✅
- [ ] `VITE_API_URL` atualizada na Vercel ✅

---

## 🆘 Precisa de Ajuda?

Me diga:
1. **Conseguiu reconectar o repositório para `optra_system`?**
2. **O deploy funcionou?**
3. **Qual é a nova URL do Railway?** (para atualizar na Vercel)

Com essas informações, consigo ajudar a finalizar! 🚀

