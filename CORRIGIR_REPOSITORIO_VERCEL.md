# 🔧 Corrigir Repositório na Vercel

## 🐛 Problema

A Vercel está fazendo deploy do repositório **`optra_system`**, mas você está fazendo commit no repositório **`optra`**.

Por isso as mudanças não aparecem!

## ✅ Solução: Conectar o Repositório Correto

### Opção 1: Conectar o Repositório `optra` (Recomendado)

1. **Acesse:** https://vercel.com → Seu projeto
2. **Vá em:** **Settings** (no topo)
3. **Vá em:** **Git** (menu lateral)
4. **Procure por:** "Connected Git Repository"
5. **Clique em:** **"Disconnect"** (desconectar o repositório atual)
6. **Clique em:** **"Connect Git Repository"**
7. **Selecione:** `MatheusGonzaga-dev/optra` (não `optra_system`)
8. **Autorize** se pedir
9. ✅ Repositório conectado!

### Opção 2: Verificar Qual Repositório Está Conectado

1. **Vercel** → **Settings** → **Git**
2. **Veja qual repositório está conectado:**
   - Se for `optra_system` → Desconecte e conecte `optra`
   - Se for `optra` → Está correto, mas pode ter outro problema

---

## 🔍 Verificar no GitHub

### Verificar Qual Repositório Tem o Código Atualizado:

1. **Acesse:** `https://github.com/MatheusGonzaga-dev/optra`
2. **Verifique se o arquivo `src/lib/utils.ts` tem os logs de debug**
3. **Se não tiver:** Faça commit e push novamente

### Verificar o Outro Repositório:

1. **Acesse:** `https://github.com/MatheusGonzaga-dev/optra_system`
2. **Veja se esse repositório existe e tem código**
3. **Se existir:** Pode ser um repositório antigo ou diferente

---

## 🎯 Passo a Passo Completo

### 1. Desconectar Repositório Atual

1. **Vercel** → **Settings** → **Git**
2. **Clique em:** **"Disconnect"** ao lado do repositório `optra_system`
3. **Confirme** a desconexão

### 2. Conectar Repositório Correto

1. **Clique em:** **"Connect Git Repository"**
2. **Selecione:** GitHub
3. **Procure por:** `optra` (não `optra_system`)
4. **Selecione:** `MatheusGonzaga-dev/optra`
5. **Autorize** o acesso se pedir
6. ✅ Conectado!

### 3. Verificar Configurações

1. **Ainda em Settings** → **Git**
2. **Verifique:**
   - **Repository:** `MatheusGonzaga-dev/optra` ✅
   - **Production Branch:** `main` (ou `master`)
   - **Root Directory:** (deixe vazio ou `/`)

### 4. Fazer Deploy

1. **Vá em:** **Deployments**
2. **Clique em:** **"Redeploy"** no último deploy
3. **Ou faça um novo commit** no repositório `optra`
4. **Vercel vai fazer deploy automático**

---

## 🔍 Verificar se Funcionou

### 1. Verificar Deploy

1. **Vercel** → **Deployments**
2. **Veja o último deploy**
3. **Deve mostrar:** "Automatically created for pushes to MatheusGonzaga-dev/optra"
4. ✅ Correto!

### 2. Verificar Logs no Console

Após o deploy:

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12)
3. **Recarregue a página** (F5)
4. **Deve aparecer:**
   ```
   🔍 DEBUG API_BASE_URL - Iniciando verificação...
   🔍 VITE_API_URL existe? true/false
   🔍 VITE_API_URL valor: https://optra-system-production.up.railway.app
   🎯 API_BASE_URL FINAL: ...
   ```

---

## 🐛 Se Ainda Não Funcionar

### Problema: Não consigo desconectar

**Solução:**
- Pode precisar de permissões de admin
- Ou criar um novo projeto na Vercel conectado ao `optra`

### Problema: Repositório `optra` não aparece na lista

**Solução:**
1. Verifique se você tem acesso ao repositório
2. Verifique se autorizou a Vercel a acessar seus repositórios
3. Vá em GitHub → Settings → Applications → Vercel → Configure

---

## 📋 Checklist

- [ ] Repositório conectado: `MatheusGonzaga-dev/optra` (não `optra_system`)
- [ ] Código atualizado no GitHub (`optra`)
- [ ] Deploy feito com sucesso
- [ ] Logs aparecem no console
- [ ] Variável `VITE_API_URL` configurada

---

## 🆘 Precisa de Ajuda?

Me diga:
1. **Qual repositório está conectado agora?** (`optra` ou `optra_system`)
2. **Conseguiu desconectar e conectar o correto?**
3. **O que aparece nos Deployments agora?**

Com essas informações, consigo ajudar! 🚀

