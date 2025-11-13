# ⚙️ Configurar VITE_API_URL na Vercel - Passo a Passo

## 🎯 Problema

O backend está funcionando no Railway (`https://optra-system-production.up.railway.app`), mas o frontend ainda está tentando acessar `localhost:4000`.

## ✅ Solução: Configurar VITE_API_URL na Vercel

### Passo 1: Copiar URL do Backend

A URL do seu backend no Railway é:
```
https://optra-system-production.up.railway.app
```

**Copie essa URL completa!**

---

### Passo 2: Configurar na Vercel

1. **Acesse:** https://vercel.com
2. **Vá no seu projeto** (optrasystem)
3. **Clique em:** **Settings** (no topo)
4. **Clique em:** **Environment Variables** (menu lateral)
5. **Você verá uma lista de variáveis**

---

### Passo 3: Adicionar VITE_API_URL

1. **Clique em:** **"Add New"** ou **"Add"** (botão para adicionar variável)
2. **Configure:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://optra-system-production.up.railway.app`
   - **Environments:** Marque TODAS as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. **Clique em:** **"Save"**
4. ✅ Variável adicionada!

---

### Passo 4: Fazer Redeploy

**IMPORTANTE:** Após adicionar a variável, você PRECISA fazer redeploy!

1. **Vá em:** **Deployments** (no topo)
2. **Encontre o último deploy** (o mais recente)
3. **Clique nos três pontos (...)** no canto direito do deploy
4. **Selecione:** **"Redeploy"**
5. **Aguarde** 2-5 minutos para o deploy completar
6. ✅ Frontend atualizado!

---

## 🔍 Como Verificar se Funcionou

### Teste 1: Verificar Variável

1. **Vercel** → **Settings** → **Environment Variables**
2. **Procure por:** `VITE_API_URL`
3. **Deve aparecer:** `https://optra-system-production.up.railway.app`

### Teste 2: Testar no Site

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12 → Console)
3. **Faça login** e acesse o Dashboard
4. **Verifique:**
   - ❌ **NÃO deve mais aparecer:** `localhost:4000`
   - ✅ **Deve aparecer:** Requisições para `https://optra-system-production.up.railway.app`

### Teste 3: Verificar Network

1. **Abra o console** (F12)
2. **Vá na aba:** **Network**
3. **Recarregue a página**
4. **Procure por requisições** que começam com `optra-system-production`
5. ✅ Se aparecer, está funcionando!

---

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda aparece `localhost:4000`

**Solução:**
1. Verifique se a variável `VITE_API_URL` está salva na Vercel
2. Verifique se fez **Redeploy** após adicionar a variável
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Teste em aba anônima

### Problema: Erro de CORS

**Solução:**
- O backend já está configurado para aceitar requisições da Vercel
- Se ainda der erro, verifique se a URL está correta (com `https://`)

### Problema: Variável não aparece

**Solução:**
1. Verifique se salvou a variável (clique em "Save")
2. Verifique se marcou os ambientes (Production, Preview, Development)
3. Faça redeploy novamente

---

## 📋 Checklist Final

- [ ] URL do backend copiada: `https://optra-system-production.up.railway.app`
- [ ] Variável `VITE_API_URL` adicionada na Vercel
- [ ] Valor da variável está correto (com `https://`)
- [ ] Ambientes marcados (Production, Preview, Development)
- [ ] Redeploy feito na Vercel
- [ ] Deploy concluído (2-5 minutos)
- [ ] Testado no site - não aparece mais `localhost:4000`
- [ ] Requisições vão para o Railway

---

## 🎯 Resumo Rápido

1. **Vercel** → **Settings** → **Environment Variables**
2. **Adicione:** `VITE_API_URL` = `https://optra-system-production.up.railway.app`
3. **Marque:** Production, Preview, Development
4. **Salve**
5. **Deployments** → **Redeploy**
6. ✅ Pronto!

---

## 🆘 Ainda com Problemas?

Me diga:
1. A variável `VITE_API_URL` está configurada na Vercel?
2. Você fez redeploy após adicionar?
3. O que aparece no console do navegador agora?

Com essas informações, consigo ajudar! 🚀

