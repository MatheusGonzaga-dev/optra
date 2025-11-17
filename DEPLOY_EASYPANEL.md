# 🚀 Deploy no EasyPanel - Guia Completo

Este guia te ajudará a fazer deploy do **backend** e **frontend** do Optra Vision na sua VPS usando o **EasyPanel**.

## 📋 Pré-requisitos

- ✅ VPS da Hostinger com EasyPanel instalado
- ✅ Domínio configurado (opcional, mas recomendado)
- ✅ Acesso SSH à VPS
- ✅ Repositório Git com seu código

---

## 🎯 Opção 1: Deploy via EasyPanel (Recomendado)

O EasyPanel tem interface visual que facilita muito o deploy!

### **1. Preparar o Repositório**

Certifique-se de que seu código está no GitHub/GitLab:

```bash
git add .
git commit -m "Preparar para deploy EasyPanel"
git push origin main
```

### **2. Acessar o EasyPanel**

1. Acesse o EasyPanel na sua VPS (geralmente `http://seu-ip:3000` ou domínio configurado)
2. Faça login

### **3. Deploy do Backend**

#### **3.1. Criar Nova Aplicação**

1. Clique em **"New App"** ou **"Criar Aplicação"**
2. Selecione **"Node.js"** ou **"Docker"**
3. Escolha **"From Git Repository"**
4. Configure:
   - **Repository URL**: URL do seu repositório Git
   - **Branch**: `main` ou `master`
   - **Build Command**: `cd server && npm ci && npm run build`
   - **Start Command**: `cd server && node dist/index.js`
   - **Port**: `4000`

#### **3.2. Configurar Variáveis de Ambiente**

Adicione as seguintes variáveis no EasyPanel:

```
NODE_ENV=production
PORT=4000
SUPABASE_URL=sua-url-do-supabase
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com
```

**⚠️ IMPORTANTE:**
- Substitua `seu-dominio.com` pelo seu domínio real
- Se não tiver domínio ainda, use `*` (menos seguro, mas funciona para testes)

#### **3.3. Configurar Domínio (Opcional)**

1. Vá em **"Domains"** ou **"Domínios"**
2. Adicione: `api.seu-dominio.com` (ou o que preferir)
3. O EasyPanel configurará automaticamente o SSL com Let's Encrypt

### **4. Deploy do Frontend**

#### **4.1. Criar Nova Aplicação**

1. Clique em **"New App"** novamente
2. Selecione **"Static Site"** ou **"Docker"**
3. Se escolher Docker:
   - **Repository URL**: Mesmo repositório
   - **Dockerfile Path**: `Dockerfile` (raiz do projeto)
   - **Port**: `80`

#### **4.2. Se Escolher Static Site**

1. **Build Command**: `npm ci && npm run build`
2. **Output Directory**: `dist`
3. **Port**: `80`

#### **4.3. Configurar Variáveis de Ambiente do Frontend**

```
VITE_API_URL=https://api.seu-dominio.com
```

**⚠️ IMPORTANTE:** 
- Use a URL do backend que você configurou
- Se o backend estiver em `api.seu-dominio.com`, use essa URL
- Se estiver na mesma VPS mas porta diferente, use `http://backend:4000` (se estiverem na mesma rede Docker)

#### **4.4. Configurar Domínio do Frontend**

1. Adicione: `seu-dominio.com` e `www.seu-dominio.com`
2. SSL será configurado automaticamente

---

## 🐳 Opção 2: Deploy com Docker Compose (Alternativa)

Se preferir usar Docker Compose diretamente:

### **1. Conectar via SSH**

```bash
ssh usuario@seu-ip-vps
```

### **2. Clonar Repositório**

```bash
cd /opt
git clone <seu-repositorio> optra-vision
cd optra-vision
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Backend
cd server
cp .env.example .env
nano .env  # Configure suas variáveis
cd ..

# Criar .env na raiz para docker-compose
nano .env
```

Adicione no `.env` da raiz:

```env
SUPABASE_URL=sua-url
SUPABASE_ANON_KEY=sua-chave
SUPABASE_SERVICE_ROLE_KEY=sua-chave
CORS_ORIGIN=https://seu-dominio.com
```

### **4. Build e Iniciar**

```bash
docker-compose up -d --build
```

### **5. Verificar Logs**

```bash
docker-compose logs -f
```

---

## 🔧 Configuração Detalhada no EasyPanel

### **Backend - Configurações Avançadas**

No EasyPanel, configure:

**Build Settings:**
- **Working Directory**: `server`
- **Build Command**: `npm ci && npm run build`
- **Install Command**: `npm ci`

**Runtime Settings:**
- **Start Command**: `node dist/index.js`
- **Port**: `4000`
- **Health Check Path**: `/health`

**Environment Variables:**
```
NODE_ENV=production
PORT=4000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CORS_ORIGIN=https://seu-dominio.com
```

### **Frontend - Configurações Avançadas**

**Build Settings:**
- **Working Directory**: `/` (raiz)
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`

**Environment Variables:**
```
VITE_API_URL=https://api.seu-dominio.com
```

**Nginx Configuration (se usar Docker):**
- O arquivo `nginx.conf` já está configurado
- Porta: `80`

---

## 🌐 Configuração de Domínios

### **Cenário 1: Domínios Separados**

- **Backend**: `api.seu-dominio.com`
- **Frontend**: `seu-dominio.com`

**Vantagens:**
- ✅ Separação clara
- ✅ Fácil escalar backend separadamente
- ✅ CORS mais fácil de configurar

### **Cenário 2: Mesmo Domínio com Path**

- **Backend**: `seu-dominio.com/api`
- **Frontend**: `seu-dominio.com`

**Configuração no EasyPanel:**
- Configure Nginx reverse proxy no frontend
- Adicione regra: `/api` → `backend:4000`

---

## 🔒 Configuração de SSL/HTTPS

O EasyPanel geralmente configura SSL automaticamente com Let's Encrypt:

1. Adicione o domínio no EasyPanel
2. O SSL será configurado automaticamente
3. Aguarde alguns minutos para o certificado ser emitido

**Verificar SSL:**
```bash
curl -I https://seu-dominio.com
```

---

## 🧪 Testar o Deploy

### **1. Testar Backend**

```bash
# Health check
curl https://api.seu-dominio.com/health

# Deve retornar: {"status":"ok"}
```

### **2. Testar Frontend**

1. Acesse: `https://seu-dominio.com`
2. Abra o console do navegador (F12)
3. Verifique se não há erros de CORS
4. Tente fazer login

### **3. Verificar Logs**

No EasyPanel:
- Vá em **"Logs"** de cada aplicação
- Verifique se há erros

---

## 🐛 Troubleshooting

### **Erro: CORS bloqueado**

**Solução:**
1. Verifique `CORS_ORIGIN` no backend
2. Adicione o domínio do frontend na lista
3. Reinicie o backend

### **Erro: Frontend não encontra API**

**Solução:**
1. Verifique `VITE_API_URL` no frontend
2. Certifique-se de que a URL está correta
3. Faça rebuild do frontend

### **Erro: Backend não inicia**

**Solução:**
1. Verifique logs no EasyPanel
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Teste localmente primeiro

### **Erro: Build falha**

**Solução:**
1. Verifique se o Node.js está na versão correta (20+)
2. Verifique se todas as dependências estão no `package.json`
3. Veja os logs de build no EasyPanel

---

## 📊 Monitoramento

### **No EasyPanel:**

1. **Dashboard**: Veja uso de recursos
2. **Logs**: Monitore erros em tempo real
3. **Metrics**: CPU, RAM, Network

### **Comandos Úteis (SSH):**

```bash
# Ver containers rodando
docker ps

# Ver logs do backend
docker logs optra-backend -f

# Ver logs do frontend
docker logs optra-frontend -f

# Reiniciar serviços
docker-compose restart
```

---

## 🔄 Atualizar Aplicação

### **Via EasyPanel:**

1. Vá na aplicação
2. Clique em **"Redeploy"** ou **"Rebuild"**
3. Aguarde o build completar

### **Via Git (Automático):**

Se configurou webhook:
1. Faça `git push`
2. O EasyPanel detecta e faz rebuild automaticamente

### **Manual:**

```bash
ssh usuario@vps
cd /opt/optra-vision
git pull
docker-compose up -d --build
```

---

## ✅ Checklist Final

- [ ] Backend deployado e rodando
- [ ] Frontend deployado e rodando
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios configurados
- [ ] SSL/HTTPS funcionando
- [ ] CORS configurado corretamente
- [ ] `VITE_API_URL` apontando para backend correto
- [ ] Health check do backend funcionando
- [ ] Login funcionando no frontend
- [ ] Logs sem erros críticos

---

## 🎉 Pronto!

Seu Optra Vision está rodando na VPS! 

**URLs:**
- Frontend: `https://seu-dominio.com`
- Backend: `https://api.seu-dominio.com`

**Próximos Passos:**
1. Configure backups regulares
2. Configure monitoramento (opcional)
3. Configure domínio personalizado (se ainda não fez)

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no EasyPanel
2. Verifique se todas as variáveis estão configuradas
3. Teste cada serviço individualmente
4. Consulte a documentação do EasyPanel

**Boa sorte com o deploy! 🚀**

