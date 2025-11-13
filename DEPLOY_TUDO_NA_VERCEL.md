# 🚀 Deploy Tudo na Vercel (Frontend + Backend)

## ✅ Sim, é possível!

A Vercel suporta serverless functions, então podemos adaptar o backend Express para rodar como serverless function na Vercel.

## 📋 O que foi configurado

1. ✅ Criado `api/index.ts` - Wrapper para adaptar Express ao formato serverless
2. ✅ Ajustado `server/src/index.ts` - Exporta o app e só inicia servidor se não estiver na Vercel
3. ✅ Atualizado `vercel.json` - Configurado para rotear `/api/*` para o backend

## 🚀 Como Funciona

- **Frontend:** Continua rodando normalmente (SPA React)
- **Backend:** Roda como serverless function em `/api/*`
- **URLs:**
  - Frontend: `https://optrasystem.vercel.app`
  - Backend: `https://optrasystem.vercel.app/api/...`

## ⚙️ Configuração na Vercel

### 1. Variáveis de Ambiente

Adicione na Vercel (Settings → Environment Variables):

```
# Frontend
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://optrasystem.vercel.app/api

# Backend (serverless function)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

⚠️ **IMPORTANTE:** 
- `VITE_API_URL` agora aponta para `/api` (mesmo domínio)
- Variáveis do backend são acessadas pela função serverless

### 2. Build

A Vercel vai:
1. Buildar o frontend (`npm run build`)
2. Compilar o backend TypeScript
3. Criar serverless function em `/api`

### 3. Deploy

Após fazer commit e push, a Vercel vai fazer deploy automático!

## 🔧 Ajustes Necessários

### Atualizar Frontend para usar `/api`

O frontend já está usando `API_BASE_URL` que vem de `VITE_API_URL`. Você só precisa:

1. Configurar `VITE_API_URL=https://optrasystem.vercel.app/api` na Vercel
2. Ou deixar sem configurar e o sistema vai usar a URL relativa

### Testar Localmente

Para testar localmente com a mesma estrutura:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (como antes)
cd server
npm run dev
```

## 📝 Estrutura de URLs

**Produção:**
- Frontend: `https://optrasystem.vercel.app`
- API Health: `https://optrasystem.vercel.app/api/health`
- API Pacientes: `https://optrasystem.vercel.app/api/pacientes`
- API Fila: `https://optrasystem.vercel.app/api/fila`

**Desenvolvimento:**
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`

## ⚠️ Limitações do Serverless

1. **Cold Start:** Primeira requisição pode demorar ~1-2 segundos
2. **Timeout:** Funções têm limite de 10s (Hobby) ou 60s (Pro)
3. **Memória:** Limite de memória por função

Para a maioria dos casos, isso é suficiente!

## 🎯 Vantagens

✅ Tudo em um lugar (Vercel)
✅ Deploy automático
✅ Escalável automaticamente
✅ Sem gerenciar servidor
✅ HTTPS automático
✅ CDN global

## 🚀 Próximos Passos

1. **Fazer commit das alterações:**
   ```bash
   git add .
   git commit -m "feat: adaptar backend para serverless functions da Vercel"
   git push origin main
   ```

2. **Configurar variáveis na Vercel:**
   - Adicione todas as variáveis de ambiente
   - Configure `VITE_API_URL=https://optrasystem.vercel.app/api`

3. **Aguardar deploy:**
   - Vercel vai fazer deploy automático
   - Aguarde alguns minutos

4. **Testar:**
   - Acesse: `https://optrasystem.vercel.app/api/health`
   - Deve retornar: `{"status":"ok"}`
   - Teste o site completo

## 🐛 Troubleshooting

### Erro: "Cannot find module"

- Verifique se o TypeScript está compilando corretamente
- Verifique se todas as dependências estão no `package.json`

### Erro: "Function timeout"

- Verifique se alguma requisição está demorando muito
- Considere otimizar queries ou usar cache

### Erro de CORS

- Backend já está configurado para aceitar requisições da Vercel
- Se ainda der erro, verifique a configuração de CORS

## 📚 Documentação

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Express na Vercel](https://vercel.com/guides/using-express-with-vercel)

