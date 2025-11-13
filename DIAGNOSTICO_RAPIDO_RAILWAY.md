# ⚡ Diagnóstico Rápido - Erro de Deploy Railway

## 🔍 Verifique Agora (5 minutos)

### 1️⃣ Ver os Logs do Erro

**No Railway:**
1. Clique no serviço **"optra-system"**
2. Vá na aba **"Deployments"**
3. Clique no deploy que falhou (deve ter ícone vermelho)
4. **Veja os Logs** - me diga qual erro aparece

**Erros comuns que você pode ver:**
- `Cannot find module '@supabase/supabase-js'`
- `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`
- `Build failed`
- `Command not found: npm`

---

### 2️⃣ Verificar Configurações Básicas

**No Railway, vá em Settings e verifique:**

#### ✅ Root Directory
- **Deve estar:** `server`
- **Se estiver vazio:** Digite `server` e salve

#### ✅ Build Command
- **Deve estar:** `npm install && npm run build`
- **Se estiver vazio:** Adicione e salve

#### ✅ Start Command
- **Deve estar:** `npm start`
- **Se estiver vazio:** Adicione e salve

---

### 3️⃣ Verificar Variáveis de Ambiente

**Vá na aba "Variables" e verifique se tem:**

```
PORT = 4000
SUPABASE_URL = https://imxvcgixvlxrllkvngsa.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (sua chave aqui)
```

**Se alguma estiver faltando:**
- Clique em "New Variable"
- Adicione a variável
- Salve

---

## 🚨 Erros Mais Comuns

### ❌ "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Causa:** Variáveis não configuradas

**Solução:**
1. Vá em Variables
2. Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
3. Faça redeploy

---

### ❌ "Cannot find module"

**Causa:** Root Directory errado ou dependências não instaladas

**Solução:**
1. Verifique Root Directory = `server`
2. Verifique Build Command = `npm install && npm run build`
3. Faça redeploy

---

### ❌ "Build failed" ou Erro de TypeScript

**Causa:** Erro no código

**Solução:**
1. Veja os logs completos
2. Procure pela linha do erro
3. Me envie o erro completo

---

## 📋 Checklist Rápido

Antes de tentar novamente:

- [ ] Root Directory = `server` ✅
- [ ] Build Command = `npm install && npm run build` ✅
- [ ] Start Command = `npm start` ✅
- [ ] Variável `PORT=4000` ✅
- [ ] Variável `SUPABASE_URL` ✅
- [ ] Variável `SUPABASE_SERVICE_ROLE_KEY` ✅

---

## 🆘 Me Diga:

1. **Qual erro aparece nos Logs?** (copie o texto completo)
2. **O Root Directory está como `server`?**
3. **As variáveis estão configuradas?**

Com essas informações, consigo resolver rapidamente! 🚀

