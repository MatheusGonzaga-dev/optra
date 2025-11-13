# ⚙️ Configurar Variáveis de Ambiente na Vercel

## 🚨 Problema: Tela em Branco

Se você está vendo uma tela em branco após o deploy na Vercel, é porque as **variáveis de ambiente não estão configuradas**.

## ✅ Solução Rápida

### Passo 1: Acesse o Painel da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione seu projeto (`optra` ou o nome que você deu)

### Passo 2: Configure as Variáveis de Ambiente

1. No menu lateral, clique em **Settings**
2. Clique em **Environment Variables**
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
Nome: VITE_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
Ambientes: Production, Preview, Development
```

```
Nome: VITE_SUPABASE_ANON_KEY
Valor: sua-anon-key-aqui
Ambientes: Production, Preview, Development
```

```
Nome: VITE_API_URL
Valor: https://seu-backend-url.com
Ambientes: Production, Preview, Development
```

### Passo 3: Onde Encontrar os Valores

#### Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY):

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** (ícone de engrenagem) → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Backend (VITE_API_URL):

Se você ainda não fez deploy do backend, você tem duas opções:

**Opção 1: Deploy do Backend em outro serviço**
- Railway: https://railway.app
- Render: https://render.com
- Fly.io: https://fly.io

Depois de fazer deploy, use a URL fornecida pelo serviço.

**Opção 2: Usar localhost temporariamente (não recomendado para produção)**
```
VITE_API_URL=http://localhost:4000
```

⚠️ **Nota:** Isso só funcionará se você estiver rodando o backend localmente.

### Passo 4: Fazer Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos três pontos (...) no último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push (deploy automático)

## 🔍 Verificar se Funcionou

Após o redeploy:

1. Acesse sua URL da Vercel (ex: `optrasystem.vercel.app`)
2. Você deve ver:
   - ✅ A página inicial (Landing) ou Login
   - ❌ **NÃO** deve ver mais a tela em branco

Se ainda estiver em branco:
- Verifique o console do navegador (F12)
- Verifique se as variáveis foram salvas corretamente
- Aguarde alguns minutos (pode levar tempo para propagar)

## 📝 Checklist

- [ ] Variáveis adicionadas no painel da Vercel
- [ ] Valores corretos copiados do Supabase
- [ ] Backend configurado e URL adicionada
- [ ] Novo deploy realizado
- [ ] Site funcionando corretamente

## 🆘 Ainda com Problemas?

1. **Verifique os logs:**
   - Vercel → Deployments → Clique no deploy → Logs

2. **Verifique o console do navegador:**
   - F12 → Console
   - Procure por erros

3. **Teste localmente:**
   ```bash
   # Crie um arquivo .env na raiz:
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-key
   VITE_API_URL=http://localhost:4000
   
   npm run dev
   ```

## 📚 Documentação

- [Variáveis de Ambiente na Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Dashboard](https://supabase.com/dashboard)

