# 🔍 Verificar Repositório na Vercel

## 🎯 Objetivo

Verificar se o frontend na Vercel está conectado ao repositório correto: **`optra_system`**

## ✅ Como Verificar

### Passo 1: Acessar Configurações do Git

1. **Acesse:** https://vercel.com
2. **Vá no seu projeto** (optrasystem ou similar)
3. **Clique em:** **Settings** (no topo)
4. **Clique em:** **Git** (menu lateral esquerdo)

### Passo 2: Verificar Repositório Conectado

Na seção **"Connected Git Repository"**, você verá:

- **Repository:** `MatheusGonzaga-dev/optra_system` ✅ (correto)
- **OU**
- **Repository:** `MatheusGonzaga-dev/optra` ❌ (errado)

---

## 🔧 Se Estiver Conectado ao `optra` (ERRADO)

### Corrigir:

1. **Na mesma página (Settings → Git)**
2. **Clique em:** **"Disconnect"** ao lado do repositório
3. **Confirme** a desconexão
4. **Clique em:** **"Connect Git Repository"**
5. **Selecione:** GitHub
6. **Procure e selecione:** `MatheusGonzaga-dev/optra_system`
7. **Autorize** se pedir
8. ✅ Conectado ao repositório correto!

---

## ✅ Se Estiver Conectado ao `optra_system` (CORRETO)

**Perfeito!** Está conectado ao repositório certo. 

Agora verifique:

1. **Vá em:** **Deployments**
2. **Veja o último deploy:**
   - Deve mostrar: "Automatically created for pushes to MatheusGonzaga-dev/optra_system"
3. **Se não aparecer isso:**
   - Faça um commit e push no repositório `optra_system`
   - Ou faça um redeploy manual

---

## 🔍 Verificar se o Código Está no Repositório Correto

### Verificar no GitHub:

1. **Acesse:** `https://github.com/MatheusGonzaga-dev/optra_system`
2. **Verifique se tem:**
   - ✅ Pasta `src/`
   - ✅ Arquivo `src/lib/utils.ts` (com os logs de debug)
   - ✅ Arquivo `package.json`
   - ✅ Arquivo `vercel.json`

**Se não tiver esses arquivos:**
- Você precisa fazer commit e push no repositório `optra_system`

---

## 📋 Checklist Completo

- [ ] Vercel conectado ao: `MatheusGonzaga-dev/optra_system` ✅
- [ ] Código está no repositório `optra_system` no GitHub ✅
- [ ] Arquivo `src/lib/utils.ts` tem os logs de debug ✅
- [ ] Último deploy mostra: "pushes to optra_system" ✅
- [ ] Variável `VITE_API_URL` configurada na Vercel ✅

---

## 🆘 Se Precisar Fazer Commit no Repositório Correto

Se o código está no repositório `optra` mas precisa estar no `optra_system`:

### Opção 1: Adicionar Remote

```bash
# Adicionar o repositório optra_system como remote
git remote add optra_system https://github.com/MatheusGonzaga-dev/optra_system.git

# Fazer push para optra_system
git push optra_system main
```

### Opção 2: Mudar o Remote Principal

```bash
# Remover remote atual
git remote remove origin

# Adicionar optra_system como origin
git remote add origin https://github.com/MatheusGonzaga-dev/optra_system.git

# Fazer push
git push -u origin main
```

---

## 🎯 Resumo

1. **Vercel** → **Settings** → **Git**
2. **Verifique:** Qual repositório está conectado
3. **Se for `optra`:** Desconecte e conecte `optra_system`
4. **Se for `optra_system`:** ✅ Está correto!
5. **Verifique:** Se o código está no GitHub (`optra_system`)
6. **Se não estiver:** Faça commit e push

---

## 🆘 Me Diga:

1. **Qual repositório está conectado na Vercel?** (`optra` ou `optra_system`)
2. **O código está no repositório `optra_system` no GitHub?**
3. **Conseguiu corrigir?**

Com essas informações, consigo ajudar a finalizar! 🚀

