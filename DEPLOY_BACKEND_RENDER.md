# 🎨 Deploy do Backend no Render

Guia alternativo para fazer deploy no **Render**, que também oferece plano gratuito.

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório no GitHub
3. Projeto Supabase configurado

## 🚀 Passo a Passo

### 1. Criar Conta

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub
3. Autorize o acesso

### 2. Criar Novo Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Selecione: `MatheusGonzaga-dev/optra`

### 3. Configurar

**Name:** `optra-backend` (ou o nome que preferir)

**Environment:** `Node`

**Region:** Escolha o mais próximo (ex: `Oregon (US West)`)

**Branch:** `main`

**Root Directory:** `server`

**Build Command:** `npm install && npm run build`

**Start Command:** `npm start`

### 4. Configurar Variáveis

Na seção **Environment Variables**, adicione:

```
PORT=4000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 5. Plano

- Escolha **Free** (plano gratuito)
- ⚠️ **Nota:** No plano gratuito, o serviço "dorme" após 15 minutos de inatividade

### 6. Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (pode levar alguns minutos)
3. Render vai gerar uma URL tipo: `optra-backend.onrender.com`

### 7. Atualizar Vercel

1. Adicione `VITE_API_URL=https://optra-backend.onrender.com` na Vercel
2. Faça redeploy

## ⚠️ Limitações do Plano Gratuito

- **Cold Start:** Primeira requisição após inatividade pode demorar ~30 segundos
- **Timeout:** 15 minutos de inatividade e o serviço "dorme"
- **Solução:** Use Railway se quiser evitar isso (também tem plano gratuito)

## 🔗 Próximos Passos

Mesmo processo do Railway - atualizar `VITE_API_URL` na Vercel e testar!

