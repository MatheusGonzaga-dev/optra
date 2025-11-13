# 🔧 Resolver Erro de Deploy no Railway

## 🐛 Problema: "There was an error deploying from source"

Vejo que o deploy está falhando. Vamos diagnosticar e resolver!

## 🔍 Passo 1: Verificar os Logs

1. **No Railway, clique no serviço "optra-system"**
2. **Vá na aba "Deployments"** (já deve estar aberta)
3. **Clique no deploy que falhou** (deve ter um ícone de erro)
4. **Veja os Logs** - copie e me envie os erros que aparecem

**O que procurar nos logs:**
- ❌ `Cannot find module`
- ❌ `Missing environment variable`
- ❌ `Build failed`
- ❌ `Command not found`
- ❌ `Port already in use`

## 🔍 Passo 2: Verificar Configurações

### Verificar Root Directory:

1. **Vá em Settings** (aba no topo)
2. **Verifique "Root Directory":**
   - Deve estar: `server`
   - Se estiver vazio ou diferente, corrija!

### Verificar Build Command:

1. **Ainda em Settings**
2. **Verifique "Build Command":**
   - Deve estar: `npm install && npm run build`
   - Se estiver vazio, adicione!

### Verificar Start Command:

1. **Ainda em Settings**
2. **Verifique "Start Command":**
   - Deve estar: `npm start`
   - Se estiver vazio, adicione!

## 🔍 Passo 3: Verificar Variáveis de Ambiente

1. **Vá na aba "Variables"** (no topo)
2. **Verifique se TODAS estas variáveis estão configuradas:**

```
PORT=4000
SUPABASE_URL=https://imxvcgixvlxrllkvngsa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**Se alguma estiver faltando:**
- Clique em "New Variable"
- Adicione a variável faltante
- Salve

## 🔍 Passo 4: Problemas Comuns e Soluções

### ❌ Erro: "Cannot find module"

**Causa:** Dependências não instaladas ou Root Directory errado

**Solução:**
1. Verifique se Root Directory = `server`
2. Verifique se Build Command = `npm install && npm run build`
3. Faça redeploy

### ❌ Erro: "Missing SUPABASE_URL"

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Vá em Variables
2. Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
3. Faça redeploy

### ❌ Erro: "Build failed"

**Causa:** Erro de compilação TypeScript

**Solução:**
1. Veja os logs completos
2. Procure por erros de TypeScript
3. Pode ser problema no código

### ❌ Erro: "Command not found: npm"

**Causa:** Node.js não detectado

**Solução:**
1. Railway deve detectar automaticamente
2. Se não detectar, pode precisar de `package.json` na raiz
3. Ou configurar manualmente em Settings

### ❌ Erro: "Port already in use"

**Causa:** Porta já está em uso (raro no Railway)

**Solução:**
1. Railway usa a variável `PORT` automaticamente
2. Não precisa configurar porta manualmente
3. Verifique se `PORT=4000` está nas variáveis

## 🔍 Passo 5: Verificar Estrutura do Projeto

O Railway precisa encontrar o `package.json` dentro da pasta `server/`.

**Estrutura esperada:**
```
optra/
  ├── server/
  │   ├── package.json  ← Railway precisa encontrar este
  │   ├── tsconfig.json
  │   └── src/
  │       └── index.ts
  └── ...
```

**Verifique:**
1. O arquivo `server/package.json` existe?
2. O arquivo `server/src/index.ts` existe?
3. O Root Directory está como `server`?

## ✅ Solução Rápida: Recriar o Serviço

Se nada funcionar, tente recriar:

1. **Delete o serviço atual:**
   - Clique no serviço "optra-system"
   - Vá em Settings
   - Role até o final
   - Clique em "Delete Service"

2. **Crie um novo:**
   - Clique em "New" no projeto
   - Selecione "GitHub Repo"
   - Escolha `MatheusGonzaga-dev/optra`
   - Configure tudo novamente

## 📋 Checklist de Verificação

Antes de tentar novamente, verifique:

- [ ] Root Directory = `server`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] Variável `PORT=4000` configurada
- [ ] Variável `SUPABASE_URL` configurada
- [ ] Variável `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Arquivo `server/package.json` existe no GitHub
- [ ] Arquivo `server/src/index.ts` existe no GitHub

## 🆘 Me Envie:

Para eu ajudar melhor, me diga:

1. **O que aparece nos Logs do deploy?** (copie o erro completo)
2. **Qual é o Root Directory configurado?**
3. **Quais variáveis estão configuradas?**
4. **O Build Command e Start Command estão configurados?**

Com essas informações, consigo identificar exatamente o problema! 🚀

