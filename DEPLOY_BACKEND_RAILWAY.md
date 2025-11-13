# 🚂 Deploy do Backend no Railway

Este guia mostra como fazer deploy do backend no **Railway**, que é uma das opções mais fáceis e rápidas.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app) (pode fazer login com GitHub)
2. Repositório no GitHub com o código
3. Projeto Supabase configurado

## 🚀 Passo a Passo Completo

### 1. Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Faça login com sua conta GitHub
4. Autorize o Railway a acessar seus repositórios

### 2. Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: `MatheusGonzaga-dev/optra`
4. Railway vai detectar automaticamente o projeto

### 3. Configurar o Backend

1. **Selecione o serviço criado**
2. Vá em **Settings** → **Root Directory**
3. Configure: `server` (isso indica que o backend está na pasta `server/`)
4. Clique em **Save**

### 4. Configurar Build e Start

1. Vá em **Settings** → **Build Command**
2. Configure: `npm install && npm run build`
3. Vá em **Settings** → **Start Command**
4. Configure: `npm start`
5. Vá em **Settings** → **Watch Paths**
6. Deixe vazio ou remova (não precisa)

### 5. Configurar Variáveis de Ambiente

1. Vá em **Variables** (aba no topo)
2. Adicione as seguintes variáveis:

```
PORT=4000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Onde encontrar:**
- **SUPABASE_URL:** Dashboard do Supabase → Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY:** Dashboard do Supabase → Settings → API → service_role key (a chave secreta)

⚠️ **IMPORTANTE:** A `SERVICE_ROLE_KEY` é diferente da `ANON_KEY`. Use a **service_role** (secret)!

### 6. Configurar Domínio (Opcional mas Recomendado)

1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Railway vai gerar uma URL tipo: `seu-projeto.up.railway.app`
4. **Copie essa URL** - você vai precisar dela!

### 7. Aguardar Deploy

1. Railway vai fazer o deploy automaticamente
2. Você pode acompanhar os logs em tempo real
3. Aguarde até ver: `[server] listening on http://localhost:4000`
4. ✅ Deploy concluído!

### 8. Configurar CORS (Importante!)

O backend já está configurado para aceitar requisições de qualquer origem (`origin: '*'`), então deve funcionar. Mas se quiser ser mais específico:

1. Edite `server/src/index.ts`
2. Altere a linha do CORS para:

```typescript
app.use(cors({ 
  origin: [
    'https://optrasystem.vercel.app',
    'https://*.vercel.app', // Para previews
    'http://localhost:8080' // Para desenvolvimento local
  ], 
  credentials: false 
}));
```

3. Faça commit e push
4. Railway vai fazer redeploy automaticamente

### 9. Atualizar Vercel com a URL do Backend

1. Acesse o painel da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione ou edite:
   ```
   Nome: VITE_API_URL
   Valor: https://seu-projeto.up.railway.app
   ```
4. Faça um redeploy na Vercel

### 10. Testar

1. Acesse `https://optrasystem.vercel.app`
2. Faça login
3. Tente usar funcionalidades que precisam do backend
4. ✅ Deve funcionar!

## 🔍 Verificar se Está Funcionando

### Testar o Backend Diretamente:

1. Abra no navegador: `https://seu-projeto.up.railway.app/health`
2. Deve retornar: `{"status":"ok"}`

### Ver Logs:

1. No Railway, vá em **Deployments**
2. Clique no deploy mais recente
3. Veja os logs em tempo real

## 🐛 Troubleshooting

### Erro: "Cannot find module"

- Verifique se o **Root Directory** está configurado como `server`
- Verifique se o **Build Command** está correto

### Erro: "Port already in use"

- Railway define a porta automaticamente via `PORT`
- Não precisa configurar manualmente

### Erro de CORS no frontend

- Verifique se a URL do backend está correta em `VITE_API_URL`
- Verifique se o CORS está configurado no backend

### Backend não inicia

- Verifique os logs no Railway
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique se o `Start Command` está correto: `npm start`

## 💰 Custos

- **Railway:** Tem plano gratuito generoso
- **Limite:** $5 de crédito grátis por mês
- **Suficiente para:** Projetos pequenos/médios

## 📚 Próximos Passos

Após o deploy funcionar:
1. Configure domínio customizado (opcional)
2. Configure monitoramento (opcional)
3. Configure backups (opcional)

## 🆘 Precisa de Ajuda?

- [Documentação do Railway](https://docs.railway.app)
- [Discord do Railway](https://discord.gg/railway)

