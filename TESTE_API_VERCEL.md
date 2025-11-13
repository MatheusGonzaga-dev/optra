# 🧪 Como Testar a API na Vercel

## ✅ Passo 1: Verificar se a API está funcionando

Abra o navegador e acesse:

```
https://optrasystem.vercel.app/api/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

ou

```json
{"name":"optra-vision-backend","status":"ok","environment":"vercel"}
```

## ❌ Se der erro:

### Erro 404 (Not Found)
- A função serverless não está sendo criada
- Verifique se o arquivo `api/index.ts` existe
- Verifique se o `vercel.json` está configurado corretamente

### Erro 500 (Internal Server Error)
- Problema no código do backend
- **Ação:** Verifique os logs (veja abaixo)

### Erro "Failed to fetch" (no console do navegador)
- CORS ou problema de rede
- Verifique se a URL está correta

## 📋 Passo 2: Verificar Logs na Vercel

1. Acesse: https://vercel.com → Seu projeto
2. Vá em **Deployments**
3. Clique no **último deploy**
4. Vá na aba **Functions**
5. Clique em **`api/index.ts`**
6. Veja os **Logs**

**O que procurar:**
- ✅ `Listening on...` → Funcionando
- ❌ `Missing SUPABASE_URL...` → Variável faltando
- ❌ `Cannot find module...` → Dependência faltando
- ❌ `SyntaxError` → Erro no código

## 📋 Passo 3: Testar Endpoints Específicos

No console do navegador (F12), execute:

```javascript
// Teste 1: Health check
fetch('https://optrasystem.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Teste 2: Dashboard stats (precisa estar logado)
fetch('https://optrasystem.vercel.app/api/dashboard/stats')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Teste 3: Pacientes
fetch('https://optrasystem.vercel.app/api/pacientes')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 🔍 Passo 4: Verificar Variáveis

Na Vercel, confirme que TODAS estas variáveis estão configuradas:

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_URL` (mesmo valor de VITE_SUPABASE_URL)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Importante:** Todas devem estar em **"All Environments"**

## 🚀 Passo 5: Redeploy

Após qualquer mudança:
1. Vá em **Deployments**
2. Clique nos **três pontos (...)** no último deploy
3. Selecione **Redeploy**
4. Aguarde 2-5 minutos

## 📝 Me Envie:

1. **O que aparece quando acessa:** `https://optrasystem.vercel.app/api/health`
2. **Os erros dos logs** (se houver)
3. **Os erros do console do navegador** (F12 → Console)

Com essas informações, consigo identificar exatamente o problema!

