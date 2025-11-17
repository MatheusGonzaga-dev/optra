# 🚂 Deploy Completo no Railway (Frontend + Backend)

## 🎯 Por que Railway?

- ✅ **Frontend + Backend juntos** no mesmo projeto
- ✅ **$5 grátis por mês** (suficiente para a maioria)
- ✅ **Sem cold start** (sempre ativo)
- ✅ **Deploy automático** via GitHub
- ✅ **HTTPS automático**
- ✅ **Fácil de configurar**

## 📋 Passo a Passo

### 1. Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em **"Login"** → **"Login with GitHub"**
3. Autorize o Railway a acessar seus repositórios

### 2. Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório: `optra_system` (ou o nome do seu repo)

### 3. Adicionar Serviço do Backend

1. No projeto criado, clique em **"+ New"** → **"GitHub Repo"**
2. Selecione o mesmo repositório
3. Railway vai detectar automaticamente
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 4. Configurar Variáveis de Ambiente do Backend

No serviço do backend, vá em **Variables** e adicione:

```
PORT=4000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### 5. Adicionar Serviço do Frontend

1. No mesmo projeto, clique em **"+ New"** → **"GitHub Repo"**
2. Selecione o mesmo repositório novamente
3. Configure:
   - **Root Directory:** `.` (raiz)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** (deixe vazio, Railway vai servir os arquivos estáticos)

### 6. Configurar Variáveis de Ambiente do Frontend

No serviço do frontend, vá em **Variables** e adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://seu-backend-url.railway.app
```

**⚠️ IMPORTANTE:** 
- Substitua `seu-backend-url.railway.app` pela URL real do serviço backend
- Você encontra a URL do backend em: Backend Service → Settings → Domains

### 7. Configurar Domínios

#### Backend:
1. Vá no serviço do backend → **Settings** → **Generate Domain**
2. Copie a URL gerada (ex: `optra-backend-production.up.railway.app`)
3. Use essa URL em `VITE_API_URL` do frontend

#### Frontend:
1. Vá no serviço do frontend → **Settings** → **Generate Domain**
2. Railway vai gerar uma URL (ex: `optra-frontend-production.up.railway.app`)
3. Esta será a URL principal do seu sistema

### 8. Configurar Nginx para Frontend (SPA)

O Railway precisa servir o `index.html` para todas as rotas. Crie um arquivo `nginx.conf` na raiz:

```nginx
server {
    listen $PORT;
    server_name _;
    root /app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

E atualize o `package.json` para usar nginx:

```json
{
  "scripts": {
    "start": "npx serve -s dist -l $PORT"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  }
}
```

Ou use o comando direto no Railway:
- **Start Command:** `npx serve -s dist -l $PORT`

### 9. Aguardar Deploy

- Railway vai fazer deploy automático
- Aguarde 2-5 minutos
- Verifique os logs em cada serviço

## ✅ Verificações

### Backend:
1. Acesse: `https://seu-backend-url.railway.app/health`
2. Deve retornar: `{"status":"ok"}`

### Frontend:
1. Acesse: `https://seu-frontend-url.railway.app`
2. Deve carregar a aplicação
3. Teste fazer login
4. Teste funcionalidades que usam o backend

## 💰 Custos

- **Plano gratuito:** $5 de crédito por mês
- **Uso típico:** $2-4 por mês (dentro do limite)
- **Se passar:** Você recebe aviso e pode escolher pagar ou otimizar

## 🔧 Troubleshooting

### Backend não inicia:
- Verifique logs no Railway
- Verifique se variáveis de ambiente estão corretas
- Verifique se `PORT` está configurado

### Frontend dá 404 ao recarregar:
- Configure o nginx ou use `serve` com `-s` flag
- Isso serve `index.html` para todas as rotas

### CORS error:
- Backend já está configurado para aceitar requisições
- Verifique se `VITE_API_URL` está correto no frontend

## 📚 Recursos

- [Documentação Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)


