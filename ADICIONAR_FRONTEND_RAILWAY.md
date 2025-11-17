# 🎨 Adicionar Frontend no Railway (Backend já configurado)

## ✅ Você já tem:
- ✅ Backend rodando no Railway
- ✅ Variáveis de ambiente do backend configuradas
- ✅ URL do backend (ex: `https://seu-backend.up.railway.app`)

## 🚀 O que fazer agora:

### 1. Adicionar Novo Serviço (Frontend)

1. **Acesse:** https://railway.app → Seu projeto
2. **Clique em:** **"+ New"** → **"GitHub Repo"**
3. **Selecione:** O mesmo repositório (`optra_system`)
4. Railway vai criar um novo serviço

### 2. Configurar o Frontend

No novo serviço criado, vá em **Settings** e configure:

- **Root Directory:** `.` (ponto, significa raiz do repositório)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

### 3. Configurar Variáveis de Ambiente do Frontend

Vá na aba **Variables** do serviço do frontend e adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://seu-backend-url.railway.app
```

**⚠️ IMPORTANTE:**
- Substitua `seu-backend-url.railway.app` pela URL real do seu backend
- Você encontra a URL do backend em: Backend Service → Settings → Networking → Domain

### 4. Gerar Domínio do Frontend

1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Railway vai gerar uma URL (ex: `optra-frontend-production.up.railway.app`)
4. Esta será a URL principal do seu sistema

### 5. Aguardar Deploy

- Railway vai fazer deploy automático
- Aguarde 2-5 minutos
- Verifique os logs para confirmar que está funcionando

### 6. Testar

1. Acesse a URL do frontend gerada
2. Deve carregar a aplicação
3. Teste fazer login
4. Teste funcionalidades que usam o backend

## ✅ Pronto!

Agora você tem frontend + backend no mesmo projeto Railway!

## 🔍 Verificações

### Se der erro 404 ao recarregar página:
- Verifique se o Start Command está: `npx serve -s dist -l $PORT`
- O `-s` é importante para servir o SPA corretamente

### Se o frontend não conseguir acessar o backend:
- Verifique se `VITE_API_URL` está com a URL correta do backend
- Verifique se o backend está rodando (veja logs)


