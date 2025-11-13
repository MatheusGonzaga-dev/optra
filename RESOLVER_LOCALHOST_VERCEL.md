# 🔧 Resolver: Frontend Ainda Usando localhost:4000

## 🐛 Problema

Você configurou `VITE_API_URL` na Vercel, mas o frontend ainda está tentando acessar `localhost:4000`.

## ✅ Soluções (Tente nesta ordem)

### 1️⃣ Verificar se Fez Redeploy

**IMPORTANTE:** Após adicionar/modificar variáveis de ambiente, você PRECISA fazer redeploy!

1. **Vercel** → **Deployments**
2. **Clique nos três pontos (...)** no último deploy
3. **Selecione:** **"Redeploy"**
4. **Aguarde** 2-5 minutos para completar
5. **Teste novamente**

**Se não fez redeploy, essa é provavelmente a causa!**

---

### 2️⃣ Verificar se a Variável Está Correta

1. **Vercel** → **Settings** → **Environment Variables**
2. **Encontre:** `VITE_API_URL`
3. **Verifique:**
   - ✅ Valor: `https://optra-system-production.up.railway.app`
   - ✅ Deve começar com `https://` (não `http://`)
   - ✅ Não deve ter barra no final (`/`)
   - ✅ Ambientes marcados: Production, Preview, Development

**Exemplo correto:**
```
VITE_API_URL = https://optra-system-production.up.railway.app
```

**Exemplo errado:**
```
VITE_API_URL = http://optra-system-production.up.railway.app  ❌ (sem https)
VITE_API_URL = https://optra-system-production.up.railway.app/  ❌ (com barra no final)
```

---

### 3️⃣ Limpar Cache do Navegador

O navegador pode estar usando uma versão antiga em cache:

1. **Pressione:** `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
2. **Selecione:** "Imagens e arquivos em cache"
3. **Período:** "Última hora" ou "Todo o período"
4. **Clique em:** "Limpar dados"
5. **Recarregue a página** (F5)

**Ou teste em aba anônima:**
- `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
- Acesse o site
- Veja se funciona

---

### 4️⃣ Verificar se o Deploy Está Usando a Variável

1. **Vercel** → **Deployments**
2. **Clique no deploy mais recente**
3. **Vá em:** **"Build Logs"** ou **"Logs"**
4. **Procure por:** `VITE_API_URL`
5. **Deve aparecer:** A URL do Railway

**Se não aparecer:**
- A variável pode não estar sendo incluída no build
- Tente fazer redeploy novamente

---

### 5️⃣ Verificar no Console do Navegador

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12 → Console)
3. **Execute este comando:**
   ```javascript
   console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
   console.log('API_BASE_URL:', window.location.origin);
   ```
4. **Me diga o que aparece**

**Esperado:**
- `VITE_API_URL: https://optra-system-production.up.railway.app`
- Se aparecer `undefined`, a variável não está sendo lida

---

### 6️⃣ Forçar Novo Deploy

Se nada funcionar, force um novo deploy:

1. **Faça uma pequena alteração** no código (ex: adicione um comentário)
2. **Commit e push:**
   ```bash
   git add .
   git commit -m "fix: forçar novo deploy"
   git push
   ```
3. **Vercel vai fazer deploy automático**
4. **Aguarde** e teste novamente

---

## 🔍 Diagnóstico Avançado

### Verificar se o Código Está Usando a Variável

O código em `src/lib/utils.ts` deve estar assim:

```typescript
export const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';
  
  return isProduction ? '/api' : 'http://localhost:4000';
})();
```

**Se `VITE_API_URL` estiver definida, deve usar ela!**

---

## 🐛 Problemas Comuns

### ❌ Variável não está sendo lida

**Causa:** Variáveis do Vite precisam começar com `VITE_`

**Solução:** Verifique se o nome está exatamente como `VITE_API_URL` (não `API_URL`)

---

### ❌ Deploy antigo ainda ativo

**Causa:** Não fez redeploy após adicionar variável

**Solução:** Faça redeploy agora!

---

### ❌ Cache do navegador

**Causa:** Navegador usando versão antiga

**Solução:** Limpe o cache ou use aba anônima

---

### ❌ Variável em ambiente errado

**Causa:** Variável só configurada para Development, mas site está em Production

**Solução:** Marque TODOS os ambientes (Production, Preview, Development)

---

## 📋 Checklist Final

- [ ] Variável `VITE_API_URL` configurada na Vercel
- [ ] Valor correto: `https://optra-system-production.up.railway.app`
- [ ] Sem barra no final da URL
- [ ] Começa com `https://`
- [ ] Ambientes marcados: Production, Preview, Development
- [ ] Redeploy feito após adicionar variável
- [ ] Deploy concluído (2-5 minutos)
- [ ] Cache do navegador limpo
- [ ] Testado em aba anônima

---

## 🆘 Me Diga:

1. **Você fez redeploy após adicionar a variável?**
2. **O que aparece quando executa no console:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```
3. **A variável está marcada para Production?**

Com essas informações, consigo identificar exatamente o problema! 🚀

