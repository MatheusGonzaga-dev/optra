# ⚙️ Configurações do Railway - Copiar e Colar

Use este arquivo para copiar as configurações exatas para cada serviço no Railway.

---

## 🟦 BACKEND (Serviço 1)

### **Settings → Root Directory**
```
server
```

### **Settings → Custom Build Command** (opcional)
```
npm ci && npm run build
```

### **Settings → Custom Start Command** (opcional)
```
node dist/index.js
```

### **Settings → Watch Paths**
```
server/**
```

### **Variables → Environment Variables**
```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**⚠️ Substitua pelos seus valores reais do Supabase!**

---

## 🟩 FRONTEND (Serviço 2)

### **Settings → Root Directory**
```
.
```

### **Settings → Watch Paths**
```
src/**
public/**
index.html
vite.config.ts
package.json
```

### **Variables → Environment Variables**
```
VITE_API_URL=https://SEU-BACKEND.up.railway.app
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**⚠️ IMPORTANTE:**
- Substitua `SEU-BACKEND.up.railway.app` pela URL gerada do seu backend
- **NÃO coloque barra `/` no final**
- Use `https://` (com S)

---

## ✅ Checklist Rápido

### Backend:
- [ ] Root Directory: `server`
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio gerado
- [ ] Teste `/health` funciona

### Frontend:
- [ ] Root Directory: `.`
- [ ] `VITE_API_URL` aponta para o backend
- [ ] Variáveis do Supabase configuradas
- [ ] Domínio gerado
- [ ] Site abre sem erros

---

## 🔗 URLs para Testar

**Backend Health Check:**
```
https://SEU-BACKEND.up.railway.app/health
```

**Frontend:**
```
https://SEU-FRONTEND.up.railway.app
```

---

## 🐛 Se não funcionar

1. **Veja os logs:**
   - Clique no serviço
   - Aba "Deployments"
   - Clique no deploy ativo
   - Veja erros em vermelho

2. **Redeploy:**
   - Settings → "Redeploy" (força rebuild)

3. **Verifique variáveis:**
   - Aba "Variables"
   - Confirme que estão todas lá

