# 🚀 Guia de Deploy na Vercel

Este guia explica como fazer deploy do Optra Vision na Vercel.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Repositório no GitHub conectado
3. Projeto Supabase configurado

## 🎯 Opções de Deploy

### Opção 1: Frontend na Vercel + Backend Separado (Recomendado)

Esta é a opção mais simples e recomendada:

1. **Frontend na Vercel** (este repositório)
2. **Backend em outro serviço** (Railway, Render, Fly.io, etc)

#### Passos:

1. **Deploy do Frontend na Vercel:**
   - Conecte seu repositório GitHub na Vercel
   - Configure as variáveis de ambiente (veja abaixo)
   - Deploy automático!

2. **Deploy do Backend:**
   - Use Railway, Render ou Fly.io para o backend
   - Configure as variáveis de ambiente do backend
   - Atualize `VITE_API_URL` no frontend com a URL do backend

### Opção 2: Tudo na Vercel (Frontend + Backend como Serverless)

Para esta opção, você precisaria converter o backend Express para serverless functions da Vercel.

## 🔧 Configuração de Variáveis de Ambiente

### Variáveis do Frontend (na Vercel)

Configure estas variáveis no painel da Vercel:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://seu-backend-url.com
```

**Onde configurar:**
1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável acima

### Variáveis do Backend (se usar outro serviço)

```
PORT=4000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

## 📝 Passo a Passo Completo

### 1. Preparar o Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "feat: preparar para deploy na Vercel"
git push origin main
```

### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Importe seu repositório GitHub
4. Configure o projeto:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Configurar Variáveis de Ambiente

No painel da Vercel, adicione:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (URL do seu backend)

### 4. Deploy

Clique em **Deploy** e aguarde o processo!

## 🔗 URLs e Domínios

Após o deploy, você receberá:
- URL de produção: `https://seu-projeto.vercel.app`
- URL de preview: para cada PR/commit

## ⚠️ Importante

1. **Backend Separado:** Se você usar backend em outro serviço, certifique-se de:
   - Configurar CORS para aceitar requisições da Vercel
   - Atualizar `VITE_API_URL` com a URL correta do backend

2. **Variáveis de Ambiente:**
   - Nunca commite arquivos `.env`
   - Configure todas as variáveis no painel da Vercel

3. **Build:**
   - O build do Vite será executado automaticamente
   - Certifique-se de que `npm run build` funciona localmente

## 🐛 Troubleshooting

### Erro de Build

- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente para testar

### Erro de Variáveis de Ambiente

- Verifique se todas as variáveis estão configuradas
- Certifique-se de que começam com `VITE_` para serem expostas

### Erro de CORS

- Configure CORS no backend para aceitar requisições da Vercel
- Adicione a URL da Vercel nas origens permitidas

## 📚 Recursos

- [Documentação da Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/guides/deploying-vite-to-vercel)
- [Variáveis de Ambiente](https://vercel.com/docs/concepts/projects/environment-variables)

