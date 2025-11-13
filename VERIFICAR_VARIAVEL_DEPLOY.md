# 🔍 Como Verificar se VITE_API_URL Está Funcionando

## ✅ Método 1: Ver Logs no Console (Após Deploy)

Após o deploy completar:

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12 → Console)
3. **Recarregue a página** (F5)
4. **Procure por estas mensagens:**

### Se a variável estiver configurada:
```
🔗 API_BASE_URL configurado: https://optra-system-production.up.railway.app
```

### Se a variável NÃO estiver configurada:
```
⚠️ VITE_API_URL não configurada. Usando: /api
📍 Hostname: optrasystem.vercel.app
🔧 PROD: true
```

---

## ✅ Método 2: Verificar Network Tab

1. **Abra o console** (F12)
2. **Vá na aba:** **Network**
3. **Recarregue a página** (F5)
4. **Procure por requisições** que começam com:
   - ✅ `optra-system-production.up.railway.app` → **Funcionando!**
   - ❌ `localhost:4000` → **Não está funcionando**

---

## ✅ Método 3: Verificar Build Logs na Vercel

1. **Vercel** → **Deployments**
2. **Clique no deploy mais recente**
3. **Vá em:** **"Build Logs"**
4. **Procure por:** `VITE_API_URL`
5. **Deve aparecer:** A URL do Railway

**Se não aparecer:**
- A variável pode não estar sendo incluída
- Verifique se está marcada para Production

---

## 🐛 Se Ainda Não Funcionar

### Problema: Log mostra "VITE_API_URL não configurada"

**Soluções:**

1. **Verifique na Vercel:**
   - Settings → Environment Variables
   - Confirme que `VITE_API_URL` está lá
   - Confirme que está marcada para **Production**

2. **Faça redeploy novamente:**
   - Deployments → ... → Redeploy
   - Aguarde completar

3. **Verifique o valor:**
   - Clique no olho (👁️) ao lado da variável
   - Confirme que é: `https://optra-system-production.up.railway.app`
   - Sem barra no final!

### Problema: Log mostra URL correta mas ainda usa localhost

**Soluções:**

1. **Limpe o cache:**
   - Ctrl + Shift + Delete
   - Limpe cache e cookies
   - Recarregue

2. **Teste em aba anônima:**
   - Ctrl + Shift + N
   - Acesse o site
   - Veja se funciona

---

## 📋 Checklist

- [ ] Variável `VITE_API_URL` configurada na Vercel
- [ ] Valor: `https://optra-system-production.up.railway.app`
- [ ] Sem barra no final
- [ ] Marcada para Production
- [ ] Redeploy feito
- [ ] Deploy concluído
- [ ] Console mostra: `🔗 API_BASE_URL configurado: ...`
- [ ] Network mostra requisições para Railway

---

## 🆘 Me Diga:

Após o novo deploy, me diga:

1. **O que aparece no console?**
   - `🔗 API_BASE_URL configurado: ...` ou
   - `⚠️ VITE_API_URL não configurada...`

2. **O que aparece no Network tab?**
   - Requisições para `optra-system-production` ou
   - Requisições para `localhost:4000`

Com essas informações, consigo identificar o problema! 🚀

