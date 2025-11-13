# 🔧 Resolver Erro no Dashboard

## 🐛 Problema

O backend está funcionando (`optra-production.up.railway.app`), mas o dashboard ainda está tentando acessar `localhost:4000`.

## ✅ Soluções (Tente nesta ordem)

### 1️⃣ Verificar Variável na Vercel

1. **Vercel** → **Settings** → **Environment Variables**
2. **Encontre:** `VITE_API_URL`
3. **Verifique:**
   - ✅ Valor: `https://optra-production.up.railway.app`
   - ✅ Deve começar com `https://` (não `http://`)
   - ✅ **NÃO deve ter barra no final** (`/`)
   - ✅ Ambientes marcados: **Production**, **Preview**, **Development**

**Exemplo correto:**
```
VITE_API_URL = https://optra-production.up.railway.app
```

**Exemplo errado:**
```
VITE_API_URL = https://optra-production.up.railway.app/  ❌ (com barra)
VITE_API_URL = http://optra-production.up.railway.app   ❌ (sem https)
```

---

### 2️⃣ Fazer Redeploy (IMPORTANTE!)

Após verificar/corrigir a variável, você **PRECISA** fazer redeploy:

1. **Vercel** → **Deployments**
2. **Clique nos três pontos (...)** no último deploy
3. **Selecione:** **"Redeploy"**
4. **Aguarde** 2-5 minutos para completar
5. **Teste novamente**

**Se não fizer redeploy, a variável não será aplicada!**

---

### 3️⃣ Verificar se os Logs Aparecem

Após o redeploy:

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12 → Console)
3. **Recarregue a página** (F5)
4. **Procure por estas mensagens:**

### Se a variável estiver funcionando:
```
🔍 DEBUG API_BASE_URL - Iniciando verificação...
🔍 VITE_API_URL existe? true
🔍 VITE_API_URL valor: https://optra-production.up.railway.app
✅ API_BASE_URL configurado: https://optra-production.up.railway.app
🎯 API_BASE_URL FINAL: https://optra-production.up.railway.app
```

### Se a variável NÃO estiver funcionando:
```
🔍 DEBUG API_BASE_URL - Iniciando verificação...
🔍 VITE_API_URL existe? false
🔍 VITE_API_URL valor: undefined
⚠️ VITE_API_URL não configurada. Usando fallback: /api
🎯 API_BASE_URL FINAL: /api
```

**Se não aparecer NENHUM log:**
- O código atualizado não foi deployado
- Verifique se o código está no repositório `optra_system` no GitHub

---

### 4️⃣ Verificar Network Tab

1. **Abra o console** (F12)
2. **Vá na aba:** **Network**
3. **Recarregue a página** (F5)
4. **Procure por requisições** que começam com:
   - ✅ `optra-production.up.railway.app` → **Funcionando!**
   - ❌ `localhost:4000` → **Não está funcionando**

---

### 5️⃣ Limpar Cache do Navegador

O navegador pode estar usando uma versão antiga em cache:

1. **Pressione:** `Ctrl + Shift + Delete`
2. **Selecione:** "Imagens e arquivos em cache"
3. **Período:** "Última hora" ou "Todo o período"
4. **Clique em:** "Limpar dados"
5. **Recarregue a página** (F5)

**Ou teste em aba anônima:**
- `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
- Acesse o site
- Veja se funciona

---

## 🔍 Verificar se o Código Está no GitHub

### Verificar no GitHub:

1. **Acesse:** `https://github.com/MatheusGonzaga-dev/optra_system`
2. **Vá em:** `src/lib/utils.ts`
3. **Verifique se tem os logs de debug:**
   ```typescript
   console.log('🔍 DEBUG API_BASE_URL - Iniciando verificação...');
   ```

**Se não tiver:**
- Você precisa fazer commit e push no repositório `optra_system`

---

## 🐛 Problemas Comuns

### ❌ Logs não aparecem no console

**Causa:** Código atualizado não foi deployado

**Solução:**
1. Verifique se o código está no GitHub (`optra_system`)
2. Faça commit e push se necessário
3. Aguarde o deploy automático na Vercel

### ❌ Log mostra "VITE_API_URL não configurada"

**Causa:** Variável não está sendo lida

**Solução:**
1. Verifique se a variável está salva na Vercel
2. Verifique se está marcada para **Production**
3. Faça redeploy após verificar

### ❌ Ainda aparece `localhost:4000`

**Causa:** Cache do navegador ou variável não aplicada

**Solução:**
1. Limpe o cache do navegador
2. Teste em aba anônima
3. Verifique se fez redeploy após adicionar variável

---

## 📋 Checklist Final

- [ ] Variável `VITE_API_URL` configurada na Vercel
- [ ] Valor: `https://optra-production.up.railway.app` (sem barra no final)
- [ ] Começa com `https://`
- [ ] Ambientes marcados: Production, Preview, Development
- [ ] Redeploy feito após adicionar/modificar variável
- [ ] Deploy concluído (2-5 minutos)
- [ ] Logs aparecem no console
- [ ] Network mostra requisições para Railway (não localhost)
- [ ] Cache do navegador limpo

---

## 🆘 Me Diga:

Após fazer o redeploy, me diga:

1. **O que aparece no console?** (os logs com 🔍)
2. **O que aparece no Network tab?** (requisições para Railway ou localhost)
3. **A variável está configurada corretamente?** (sem barra no final)

Com essas informações, consigo identificar exatamente o problema! 🚀

