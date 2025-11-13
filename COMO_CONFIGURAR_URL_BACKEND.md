# 🔗 Como Configurar a URL do Backend na Vercel

## 📋 Passo a Passo Completo

### 1️⃣ Primeiro: Fazer Deploy do Backend

Você precisa fazer deploy do backend em um serviço de hospedagem. Recomendo **Railway** (mais fácil e sem cold start).

#### Opção A: Railway (Recomendado) ⭐

1. **Acesse:** https://railway.app
2. **Faça login** com GitHub
3. **Clique em:** "New Project" → "Deploy from GitHub repo"
4. **Selecione:** Seu repositório `MatheusGonzaga-dev/optra`
5. **Configure:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. **Adicione variáveis de ambiente:**
   ```
   PORT=4000
   SUPABASE_URL=https://imxvcgixvlxrllkvngsa.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   ```
7. **Aguarde o deploy** (2-5 minutos)
8. **Railway vai gerar uma URL tipo:** `https://seu-projeto.up.railway.app`

#### Opção B: Render (Alternativa)

1. **Acesse:** https://render.com
2. **Faça login** com GitHub
3. **Clique em:** "New +" → "Web Service"
4. **Conecte seu repositório**
5. **Configure:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. **Adicione variáveis de ambiente** (mesmas do Railway)
7. **Aguarde o deploy**
8. **Render vai gerar uma URL tipo:** `https://seu-projeto.onrender.com`

### 2️⃣ Pegar a URL do Backend

Após o deploy, você terá uma URL tipo:
- Railway: `https://optra-backend.up.railway.app`
- Render: `https://optra-backend.onrender.com`

**⚠️ IMPORTANTE:** Copie a URL completa (com `https://`)

### 3️⃣ Configurar na Vercel

1. **Acesse:** https://vercel.com → Seu projeto
2. **Vá em:** **Settings** → **Environment Variables**
3. **Clique em:** **Add New**
4. **Configure:**
   - **Name:** `VITE_API_URL`
   - **Value:** A URL do backend (ex: `https://optra-backend.up.railway.app`)
   - **Environments:** Marque **Production**, **Preview** e **Development**
5. **Clique em:** **Save**

### 4️⃣ Fazer Redeploy

Após adicionar a variável:

1. **Vá em:** **Deployments**
2. **Clique nos três pontos (...)** no último deploy
3. **Selecione:** **Redeploy**
4. **Aguarde** 2-5 minutos

### 5️⃣ Testar

1. **Acesse:** `https://optrasystem.vercel.app`
2. **Abra o console** (F12)
3. **Verifique:** Não deve mais aparecer `localhost:4000`
4. **Teste:** Acesse a página de pacientes - deve carregar os dados!

## 📝 Exemplo Completo

### Se você usar Railway:

1. **URL do backend:** `https://optra-backend.up.railway.app`
2. **Na Vercel, configure:**
   ```
   VITE_API_URL=https://optra-backend.up.railway.app
   ```
3. **Pronto!** O frontend vai usar essa URL para todas as chamadas da API.

## 🔍 Como Verificar se Está Funcionando

### Teste 1: Health Check do Backend

Acesse diretamente no navegador:
```
https://optra-backend.up.railway.app/health
```

**Esperado:** `{"status":"ok"}` ou similar

### Teste 2: Frontend

1. Abra: `https://optrasystem.vercel.app`
2. Abra o console (F12)
3. Vá na aba **Network**
4. Faça login e acesse uma página
5. Procure por requisições para a URL do backend (não `localhost`)

## 🐛 Problemas Comuns

### Erro: "Failed to fetch"

- **Causa:** Backend não está rodando ou URL incorreta
- **Solução:** Verifique se o backend está online e se a URL está correta

### Erro: "CORS"

- **Causa:** Backend não está permitindo requisições da Vercel
- **Solução:** Verifique a configuração de CORS no backend (já está configurado)

### Ainda aparece `localhost:4000`

- **Causa:** Variável não foi aplicada ou não fez redeploy
- **Solução:** Verifique se a variável está salva e faça redeploy

## ✅ Checklist Final

- [ ] Backend deployado (Railway ou Render)
- [ ] URL do backend copiada
- [ ] `VITE_API_URL` configurada na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Backend respondendo em `/health`
- [ ] Frontend funcionando sem erros de `localhost`

## 🆘 Precisa de Ajuda?

Me diga:
1. **Qual serviço você escolheu?** (Railway ou Render)
2. **A URL do backend** (para eu verificar)
3. **Se o backend está respondendo** (teste `/health`)

Com essas informações, consigo ajudar a configurar tudo!

