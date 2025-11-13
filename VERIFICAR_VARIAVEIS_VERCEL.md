# ✅ Verificar Variáveis de Ambiente na Vercel

## 🔍 Problema: Dados não carregam

Se o site está funcionando mas os dados não carregam, verifique as variáveis de ambiente na Vercel.

## 📋 Checklist de Variáveis

### 1. Acesse o Painel da Vercel

1. Vá em [vercel.com](https://vercel.com)
2. Selecione seu projeto (`optra` ou `optrasystem`)
3. Clique em **Settings** → **Environment Variables**

### 2. Verifique estas Variáveis

#### ✅ Obrigatórias (Frontend):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

#### ⚠️ Importante para Backend na Vercel:

Se você configurou o backend como serverless function na Vercel, adicione também:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Nota:** `VITE_API_URL` não precisa ser configurada se tudo está na Vercel - o sistema usa `/api` automaticamente.

### 3. Verificar se Estão Configuradas Corretamente

1. **VITE_SUPABASE_URL:**
   - Deve começar com `https://`
   - Deve terminar com `.supabase.co`
   - Exemplo: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY:**
   - É uma string longa (chave JWT)
   - Começa com `eyJ...`
   - É a chave **anon/public** (NÃO a service_role)

3. **SUPABASE_SERVICE_ROLE_KEY** (se backend na Vercel):
   - Também é uma string longa
   - É a chave **service_role** (secret)
   - ⚠️ **NUNCA** exponha essa chave publicamente

### 4. Onde Encontrar os Valores

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** (ícone de engrenagem) → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Após Adicionar/Atualizar Variáveis

1. **Faça um Redeploy:**
   - Vá em **Deployments**
   - Clique nos três pontos (...) no último deploy
   - Selecione **Redeploy**
   - Ou faça um novo commit e push

2. **Aguarde alguns minutos** para o deploy completar

3. **Teste novamente:**
   - Acesse o site
   - Faça login
   - Verifique se os dados carregam

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
- Verifique se os valores estão corretos (sem espaços extras)

### Erro: "Failed to fetch" ou "ERR_CONNECTION_REFUSED"

- Se você configurou backend na Vercel, verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Verifique os logs do deploy na Vercel para erros de build

### Dados não carregam mas login funciona

- Login funciona porque usa Supabase diretamente
- Dados não carregam porque precisa do backend
- Verifique se o backend está funcionando:
  - Acesse: `https://optrasystem.vercel.app/api/health`
  - Deve retornar: `{"status":"ok"}`

### Backend retorna erro 500

- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente
- Verifique os logs da função serverless na Vercel
- Vá em **Functions** → Clique na função → Veja os logs

## 📝 Resumo Rápido

**Variáveis Mínimas Necessárias:**
1. `VITE_SUPABASE_URL` ✅
2. `VITE_SUPABASE_ANON_KEY` ✅

**Se Backend na Vercel:**
3. `SUPABASE_URL` ✅
4. `SUPABASE_SERVICE_ROLE_KEY` ✅

**Não Precisa:**
- `VITE_API_URL` (usa `/api` automaticamente se tudo na Vercel)

## 🆘 Ainda com Problemas?

1. Verifique os logs do deploy na Vercel
2. Verifique o console do navegador (F12)
3. Teste a API diretamente: `https://optrasystem.vercel.app/api/health`
4. Verifique se todas as variáveis estão salvas (sem espaços, sem quebras de linha)

