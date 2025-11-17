# ⚡ Quick Start - Deploy no EasyPanel

Guia rápido para fazer deploy em 5 minutos!

## 🎯 Passo a Passo Rápido

### **1. Backend no EasyPanel**

1. **New App** → **Node.js** → **From Git**
2. **Repository**: Seu repositório Git
3. **Branch**: `main`
4. **Root Directory**: `server`
5. **Build Command**: `npm ci && npm run build`
6. **Start Command**: `node dist/index.js`
7. **Port**: `4000`

**Variáveis de Ambiente:**
```
NODE_ENV=production
PORT=4000
SUPABASE_URL=sua-url
SUPABASE_ANON_KEY=sua-chave
SUPABASE_SERVICE_ROLE_KEY=sua-chave
CORS_ORIGIN=https://seu-dominio.com
```

**Domínio (opcional):**
- `api.seu-dominio.com`

---

### **2. Frontend no EasyPanel**

1. **New App** → **Static Site** ou **Docker**
2. **Repository**: Mesmo repositório
3. **Branch**: `main`
4. **Build Command**: `npm ci && npm run build`
5. **Output Directory**: `dist`
6. **Port**: `80`

**Variáveis de Ambiente:**
```
VITE_API_URL=https://api.seu-dominio.com
```

**Domínio:**
- `seu-dominio.com`

---

### **3. Testar**

```bash
# Backend
curl https://api.seu-dominio.com/health

# Frontend
# Acesse: https://seu-dominio.com
```

---

## ✅ Pronto!

Seu sistema está no ar! 🚀

**Dúvidas?** Veja o guia completo: `DEPLOY_EASYPANEL.md`

