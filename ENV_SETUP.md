# Configuração de Variáveis de Ambiente

## 📋 Resumo

O projeto usa **dois arquivos `.env` diferentes**:

1. **`.env`** na raiz → para o **Frontend**
2. **`server/.env`** → para o **Backend**

---

## 🎨 Frontend (.env na raiz)

Crie o arquivo `.env` na **raiz do projeto**:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-public-key-aqui
```

### Onde encontrar essas chaves:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem) → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon` `public` → `VITE_SUPABASE_ANON_KEY`

⚠️ **IMPORTANTE**: Use a chave **anon/public** no frontend (é segura para exposição pública).

---

## 🔧 Backend (server/.env)

Crie o arquivo `.env` dentro da pasta **`server/`**:

```env
PORT=4000
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### Onde encontrar essas chaves:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Project Settings** → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys** → `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **ATENÇÃO**: A chave **service_role** dá acesso TOTAL ao banco de dados. 
**NUNCA** exponha essa chave publicamente ou comite no Git!

---

## 🔐 Diferença entre as Chaves

| Chave | Uso | Permissões | Exposição |
|-------|-----|------------|-----------|
| **anon/public** | Frontend | Limitadas (RLS) | ✅ Pode ser pública |
| **service_role** | Backend | Total (bypass RLS) | ❌ NUNCA exponha |

---

## ✅ Checklist de Configuração

### Frontend
- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] Reiniciou o servidor Vite (`npm run dev`)

### Backend
- [ ] Arquivo `.env` criado em `server/`
- [ ] `PORT` configurado (padrão: 4000)
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] Reiniciou o servidor Node (`cd server && npm run dev`)

---

## 🚨 Segurança

### ✅ Fazer:
- Usar `anon key` no frontend
- Usar `service_role key` apenas no backend
- Adicionar `.env` ao `.gitignore`
- Usar variáveis de ambiente em produção

### ❌ NÃO Fazer:
- Nunca comitar arquivos `.env` no Git
- Nunca usar `service_role key` no frontend
- Nunca expor chaves em código público
- Nunca compartilhar suas chaves

---

## 🔄 Após Configurar

1. **Reinicie ambos os servidores**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Acesse**: http://localhost:8080

3. **Faça login** com o usuário criado no Supabase

---

## 🆘 Problemas Comuns

### "Missing Supabase environment variables"

**Causa**: Arquivo `.env` não encontrado ou variáveis faltando.

**Solução**:
- Verifique se criou o `.env` no local correto
- Confirme os nomes das variáveis (são case-sensitive)
- Reinicie o servidor após criar/editar `.env`

### "Invalid API key"

**Causa**: Chave incorreta ou projeto errado.

**Solução**:
- Copie novamente as chaves do Supabase Dashboard
- Verifique se está usando o projeto correto
- Confirme que não há espaços extras nas chaves

### Mudanças no .env não aplicam

**Solução**: Sempre reinicie o servidor após alterar `.env`.

---

## 📝 Exemplo Completo

### Frontend (raiz/.env)
```env
VITE_SUPABASE_URL=https://abcdefgh12345678.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoMTIzNDU2NzgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Backend (server/.env)
```env
PORT=4000
SUPABASE_URL=https://abcdefgh12345678.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoMTIzNDU2NzgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

*(Valores de exemplo - use suas próprias chaves)*

---

✅ **Pronto!** Com as variáveis configuradas, o sistema está pronto para uso.

