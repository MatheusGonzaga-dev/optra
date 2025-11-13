# ✅ Checklist de Deploy na Vercel

## 📋 Antes do Deploy

### 1. Variáveis de Ambiente

Configure estas variáveis no painel da Vercel (Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://seu-backend-url.com
```

### 2. Backend

Você tem duas opções:

**Opção A: Backend em outro serviço (Recomendado)**
- Deploy do backend em Railway, Render, Fly.io, etc
- Configure CORS para aceitar requisições da Vercel
- Use a URL do backend em `VITE_API_URL`

**Opção B: Backend na Vercel (Serverless)**
- Converter o backend Express para serverless functions
- Mais complexo, mas tudo em um lugar

### 3. URLs Hardcoded

⚠️ **IMPORTANTE:** Alguns arquivos ainda têm `http://localhost:4000` hardcoded.

Arquivos que precisam ser atualizados para usar `VITE_API_URL`:
- `src/pages/optometrist/PatientAttendance.tsx`
- `src/pages/optometrist/PatientQueue.tsx`
- `src/pages/secretary/SecretaryQueue.tsx`
- E outros...

**Solução:** Use a constante `API_BASE_URL` de `src/lib/utils.ts`:

```typescript
import { API_BASE_URL } from "@/lib/utils";

// Em vez de:
fetch('http://localhost:4000/endpoint')

// Use:
fetch(`${API_BASE_URL}/endpoint`)
```

## 🚀 Passos para Deploy

1. **Commit e Push:**
   ```bash
   git add .
   git commit -m "feat: preparar para deploy na Vercel"
   git push origin main
   ```

2. **Conectar na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Importe seu repositório GitHub
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configurar Variáveis:**
   - Adicione todas as variáveis de ambiente
   - Certifique-se de que `VITE_API_URL` aponta para seu backend

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o processo

## 🔍 Verificações Pós-Deploy

- [ ] Site está acessível
- [ ] Login funciona
- [ ] API está respondendo (verificar console do navegador)
- [ ] Não há erros de CORS
- [ ] Variáveis de ambiente estão configuradas

## 🐛 Problemas Comuns

### Erro: "Failed to fetch"
- Verifique se `VITE_API_URL` está configurada
- Verifique se o backend está rodando e acessível
- Verifique CORS no backend

### Erro: "Supabase connection failed"
- Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Certifique-se de que as chaves estão corretas

### Build falha
- Execute `npm run build` localmente para testar
- Verifique se todas as dependências estão no `package.json`

## 📚 Próximos Passos

Após o deploy funcionar:
1. Atualizar todos os arquivos com `localhost:4000` hardcoded
2. Configurar domínio customizado (opcional)
3. Configurar CI/CD para deploys automáticos

