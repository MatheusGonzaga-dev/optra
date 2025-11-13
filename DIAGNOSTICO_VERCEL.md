# 🔍 Diagnóstico Completo - Vercel

## ✅ Variáveis de Ambiente Necessárias

### Frontend (já configuradas):
- ✅ `VITE_SUPABASE_URL` - URL do Supabase
- ✅ `VITE_SUPABASE_ANON_KEY` - Chave anon/public

### Backend (Serverless Function):
- ✅ `SUPABASE_URL` - Mesmo valor de VITE_SUPABASE_URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Chave service_role (secret)

## 🐛 Problemas Possíveis

### 1. Serverless Function não está funcionando

O arquivo `api/index.ts` tenta importar o backend, mas pode haver problemas:

**Teste se a API está funcionando:**
- Acesse: `https://optrasystem.vercel.app/api/health`
- Deve retornar: `{"status":"ok"}` ou similar
- Se der erro 500 ou 404, o problema é no backend

### 2. Verificar Logs da Vercel

1. Vá em **Deployments** na Vercel
2. Clique no último deploy
3. Vá na aba **Functions**
4. Clique em `api/index.ts`
5. Veja os **Logs** - deve mostrar erros se houver

**Erros comuns:**
- `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` → Variáveis não configuradas
- `Cannot find module` → Problema de build/importação
- `SyntaxError` → Problema no código TypeScript

### 3. Verificar Build

1. Vá em **Deployments**
2. Clique no último deploy
3. Veja os **Build Logs**
4. Procure por erros de compilação

**Erros comuns:**
- `Module not found` → Dependências faltando
- `TypeScript errors` → Erros de tipo
- `Build failed` → Problema no processo de build

### 4. Testar API Diretamente

Abra o console do navegador (F12) e execute:

```javascript
// Testar se a API está respondendo
fetch('https://optrasystem.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Testar endpoint específico
fetch('https://optrasystem.vercel.app/api/dashboard/stats')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Se der erro:**
- `Failed to fetch` → API não está funcionando
- `404 Not Found` → Rota não existe
- `500 Internal Server Error` → Erro no backend (veja logs)

## 🔧 Soluções

### Solução 1: Verificar se variáveis estão corretas

Na Vercel, verifique se:
- `SUPABASE_URL` = `https://imxvcgixvlxrllkvngsa.supabase.co` (sem barra no final)
- `SUPABASE_SERVICE_ROLE_KEY` = chave completa (começa com `eyJ...`)
- Todas estão marcadas para **"All Environments"**

### Solução 2: Redeploy após adicionar variáveis

Após adicionar/atualizar variáveis:
1. Vá em **Deployments**
2. Clique nos **três pontos (...)** no último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar (2-5 minutos)

### Solução 3: Verificar estrutura do projeto

O `api/index.ts` precisa conseguir importar o backend. Verifique se:
- A pasta `server/` existe
- O arquivo `server/src/index.ts` existe
- As dependências do backend estão no `package.json` raiz

### Solução 4: Alternativa - Deploy do Backend Separado

Se o serverless function não funcionar, você pode:
1. Fazer deploy do backend no Railway ou Render
2. Adicionar `VITE_API_URL` na Vercel com a URL do backend
3. O frontend vai usar essa URL para chamar o backend

## 📋 Checklist Rápido

- [ ] `VITE_SUPABASE_URL` configurada ✅
- [ ] `VITE_SUPABASE_ANON_KEY` configurada ✅
- [ ] `SUPABASE_URL` configurada ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada ✅
- [ ] Todas as variáveis estão em "All Environments"
- [ ] Fez redeploy após adicionar variáveis
- [ ] Testou `https://optrasystem.vercel.app/api/health`
- [ ] Verificou os logs da função serverless
- [ ] Verificou os logs de build

## 🆘 Próximos Passos

1. **Teste a API:**
   - Acesse: `https://optrasystem.vercel.app/api/health`
   - Me diga o que aparece

2. **Verifique os logs:**
   - Vá em Deployments → Functions → api/index.ts → Logs
   - Me diga se há algum erro

3. **Teste no console:**
   - Abra o site
   - Pressione F12
   - Vá na aba Console
   - Me diga quais erros aparecem

Com essas informações, consigo identificar exatamente o problema!

