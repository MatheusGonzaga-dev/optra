# 🚀 Resumo: Deploy do Backend

## 🎯 Objetivo

Fazer deploy do backend para que o site funcione completamente no mobile e em produção.

## ⚡ Opção Mais Rápida: Railway

**Tempo estimado:** 10-15 minutos

1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. New Project → Deploy from GitHub
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Adicione variáveis:
   - `PORT=4000`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
6. Copie a URL gerada (ex: `https://seu-projeto.up.railway.app`)
7. Adicione na Vercel: `VITE_API_URL=https://seu-projeto.up.railway.app`
8. ✅ Pronto!

**Guia completo:** Veja `DEPLOY_BACKEND_RAILWAY.md`

## 📚 Guias Disponíveis

- **Railway:** `DEPLOY_BACKEND_RAILWAY.md` (Recomendado - mais fácil)
- **Render:** `DEPLOY_BACKEND_RENDER.md` (Alternativa gratuita)

## ✅ Checklist

- [ ] Backend deployado (Railway ou Render)
- [ ] URL do backend copiada
- [ ] `VITE_API_URL` configurada na Vercel
- [ ] Redeploy na Vercel feito
- [ ] Testado no celular
- [ ] Tudo funcionando! 🎉

## 🔍 Como Saber se Funcionou

1. Acesse: `https://seu-backend-url.com/health`
2. Deve retornar: `{"status":"ok"}`
3. No site, funcionalidades que precisam do backend devem funcionar

## 🆘 Problemas Comuns

**Backend não inicia:**
- Verifique logs no Railway/Render
- Verifique se variáveis de ambiente estão corretas

**CORS error:**
- Backend já está configurado para aceitar requisições da Vercel
- Se ainda der erro, verifique a URL em `VITE_API_URL`

**Site não carrega dados:**
- Verifique se `VITE_API_URL` está configurada na Vercel
- Verifique se o backend está rodando (veja logs)
- Teste a URL do backend diretamente no navegador

